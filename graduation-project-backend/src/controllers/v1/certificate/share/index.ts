import { Router } from "express";
import { Request } from "express-jwt";
import { Apply, Process } from "./type";
import { Result, Res } from "../../../../common/res";
import {
	ApplyItem,
	ApplyResult,
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

// 获取申请队列
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

// 获取申请队列
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
	const { data: user } = await FabricSDK.get(origin);
	if (
		user.myApplications.find(
			(item) =>
				item.target === target &&
				item.type === type &&
				item.index === parseInt(index)
		)
	) {
		res.send(Res.fail("已申请，请等待目标用户处理"));
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
	FabricSDK.addMyApplication(origin, [waitItem]);

	res.send(Res.success("申请成功"));
});

// 处理他人发起的申請
certificateShareRouter.post<
	Process.ReqParams,
	Result,
	Process.ReqBody
>("/process/:index", async (req, res) => {
	// @ts-ignore
	const target = req.auth.email;
	const { index } = req.params;
	const { code, expire } = req.body;
	const { data: userTarget } = await FabricSDK.get(target);
	const { data: userOrigin } = await FabricSDK.get(target);

	const targetsOthersApplication =
		userTarget.othersApplications[index];
	const { created } = targetsOthersApplication;

	const indexOforiginsMyApplication =
		userOrigin.myApplications.findIndex(
			(item) => item.created === created
		);

	const result: ApplyResult = {
		code,
		endTime: Date.now(),
		expire,
		data: "",
	};

	const resolvedApplyItem: ApplyItem = {
		...targetsOthersApplication,
		result,
	};
});

export default certificateShareRouter;
