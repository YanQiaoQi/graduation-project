import { Router } from "express";
import { Request } from "express-jwt";
import { Apply, Process } from "./type";
import { Result } from "../../../../common/type";
import { Res } from "../../../../common/res";
import {
	ApplyItem,
	ApplyResult,
	Email,
	AuthorizedItem,
	AuthCertificate,
	LedgerItem,
} from "../../../../common/type";
import * as FabricSDK from "../../../../services/fabric-sdk";
const certificateShareRouter = Router();

// 获取申请队列
certificateShareRouter.get(
	"/application",
	async (req: Request, res) => {
		const email = req.auth?.email;
		const { data: user } = await FabricSDK.get(email);
		const { myApplications, othersApplications } = user;
		res.send({
			status: 200,
			code: 1,
			data: {
				myApplications,
				othersApplications,
			},
		});
	}
);

// 获取我的申请队列
certificateShareRouter.get(
	"/myApplications",
	async (req: Request, res) => {
		const email = req.auth?.email;
		const ledger = await FabricSDK.getLedger();
		const data = ledger[email].myApplications.map(
			(application) => {
				const { target, index } = application;
				const targetUser = ledger[target];
				const certificate = targetUser.certificates[index];
				return {
					...application,
					certificate,
				};
			}
		);
		res.send({
			status: 200,
			code: 1,
			data,
		});
	}
);

// 获取他人申请队列
certificateShareRouter.get(
	"/othersApplications",
	async (req: Request, res) => {
		const email = req.auth?.email;
		const { data: user } = await FabricSDK.get(email);
		const certificates = user.certificates;
		const data = user.othersApplications.map(
			(application) => {
				const { index } = application;
				const certificate = certificates[index];
				return {
					...application,
					certificate,
				};
			}
		);
		// .filter((application) => application.done === false);
		res.send({
			status: 200,
			code: 1,
			data,
		});
	}
);

// 获取我已经授权的certificate
certificateShareRouter.get(
	"/authorizedApplications",
	async (req: Request, res) => {
		const email = req.auth?.email;
		const ledger = await FabricSDK.getLedger();
		const user = ledger[email];
		console.log(user.authorizedCertificates);
		const data: LedgerItem[] = [];
		for (let email in user.authorizedCertificates) {
			const targetUser = ledger[email];
			const ledgerItem: LedgerItem = {
				user: email,
				columnEncryption: targetUser.columnEncryption,
				certificates: [],
			};
			const authCertificates =
				user.authorizedCertificates[email];
			authCertificates.forEach(({ created, auth }) => {
				const targetCertificate =
					targetUser.certificates.find(
						(certificate) => certificate.created === created
					);
				if (!targetCertificate) return;
				const AuthCertificate: AuthCertificate = {
					...targetCertificate,
					auth,
				};
				ledgerItem.certificates.push(AuthCertificate);
			});
			data.push(ledgerItem);
		}
		res.send({
			status: 200,
			code: 1,
			data,
		});
	}
);

// 申請
certificateShareRouter.post<
	Apply.ReqParams,
	Result,
	Apply.ReqBody
>("/apply/:type/:target/:index", async (req, res) => {
	// @ts-ignore
	const origin = req.auth?.email;
	const { target, type, index } = req.params;
	const ledger = await FabricSDK.getLedger();
	const user = ledger[origin];
	const targetUser = ledger[target];
	const targetCertificate =
		targetUser.certificates[Number(index)];
	if (
		user.myApplications
			.filter((application) => application.done === false)
			.find(
				(item) =>
					item.target === target &&
					item.type === type &&
					item.index === parseInt(index)
			)
	) {
		res.send(Res.fail("已申请，请等待目标用户处理"));
		return;
	}
	if (
		user.authorizedCertificates[target].find(
			(certificate) =>
				certificate.created === targetCertificate.created
		)
	) {
		res.send(Res.fail("已获取授权"));
		return;
	}
	const waitItem: ApplyItem = {
		done: false,
		type,
		origin,
		target,
		created: Date.now(),
		index: parseInt(index),
	};

	if (type === "decrypt") {
		waitItem.prop = req.body.prop;
	}
	console.log(target, origin, waitItem);

	FabricSDK.addOthersApply(target, [waitItem]);
	await FabricSDK.addMyApplication(origin, [waitItem]);

	res.send(Res.success("申请成功"));
});

// 处理他人发起的申請
certificateShareRouter.post<
	Process.ReqParams,
	Result,
	Process.ReqBody
>("/process/:index", async (req, res) => {
	// @ts-ignore
	const target = req.auth.email as Email;
	const { index } = req.params;
	const { code } = req.body;
	const ledger = await FabricSDK.getLedger();
	const userTarget = ledger[target];

	// 受理人的 applyItem
	const targetsOthersApplication =
		userTarget.othersApplications[index];
	const {
		type,
		created,
		origin,
		index: targetCertificateIndex,
	} = targetsOthersApplication;

	const userOrigin = ledger[origin];
	// 申请人的 applyItem index
	const indexOforiginsMyApplication =
		userOrigin.myApplications.findIndex(
			(item) => item.created === created
		);

	const result: ApplyResult = {
		code,
		endTime: Date.now(),
	};
	// 申请成功
	if (code && req.body.expire) {
		if (req.body.expire <= created) {
			res.send(Res.fail("过期时间小于创建时间"));
			return;
		}
		result.expire = req.body.expire;
		const authorizedCertificate: AuthorizedItem = {
			created:
				userTarget.certificates[targetCertificateIndex]
					.created,
			auth: {
				type,
				expire: req.body.expire,
			},
		};
		if (type === "decrypt") {
			authorizedCertificate.auth.prop =
				targetsOthersApplication.prop;
		}
		if (!userOrigin.authorizedCertificates)
			userOrigin.authorizedCertificates = {};
		if (!userOrigin.authorizedCertificates[target]) {
			userOrigin.authorizedCertificates[target] = [];
		}
		userOrigin.authorizedCertificates[target].push(
			authorizedCertificate
		);
	}

	const finisheddApplyItem: ApplyItem = {
		...targetsOthersApplication,
		done: true,
		result,
	};
	userTarget.othersApplications[index] = finisheddApplyItem;
	userOrigin.myApplications[indexOforiginsMyApplication] =
		finisheddApplyItem;
	await FabricSDK.set(target, userTarget);
	FabricSDK.set(origin, userOrigin);
	res.send(Res.success("处理成功"));
});

export default certificateShareRouter;
