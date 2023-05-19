import { Router } from "express";
import { Request } from "express-jwt";
import { Apply, Process } from "./type";
import { Result } from "../../../common/type";
import { Res } from "../../../common/res";
import fabric from "../../../services/fabric-sdk";
const certificateShareRouter = Router();

// 获取申请队列
// certificateShareRouter.get(
// 	"/application",
// 	async (req: Request, res) => {
// 		const email = req.auth?.email;
// 		const { data: user } = await FabricSDK.get(email);
// 		const { myApplications, othersApplications } = user;
// 		res.send({
// 			status: 200,
// 			code: 1,
// 			data: {
// 				myApplications,
// 				othersApplications,
// 			},
// 		});
// 	}
// );

// 获取我的申请队列
// certificateShareRouter.get(
// 	"/myApplications",
// 	async (req: Request, res) => {
// 		const email = req.auth?.email;
// 		const ledger = await FabricSDK.getLedger();
// 		const data = ledger[email].myApplications.map(
// 			(application) => {
// 				const { target, index } = application;
// 				const targetUser = ledger[target];
// 				const certificate = targetUser.certificates[index];
// 				return {
// 					...application,
// 					certificate,
// 				};
// 			}
// 		);
// 		res.send({
// 			status: 200,
// 			code: 1,
// 			data,
// 		});
// 	}
// );

// 获取他人申请队列
// certificateShareRouter.get(
// 	"/othersApplications",
// 	async (req: Request, res) => {
// 		const email = req.auth?.email;
// 		const { data: user } = await FabricSDK.get(email);
// 		const certificates = user.certificates;
// 		const data = user.othersApplications.map(
// 			(application) => {
// 				const { index } = application;
// 				const certificate = certificates[index];
// 				return {
// 					...application,
// 					certificate,
// 				};
// 			}
// 		);
// 		// .filter((application) => application.done === false);
// 		res.send({
// 			status: 200,
// 			code: 1,
// 			data,
// 		});
// 	}
// );

// 获取我已经授权的certificate
// certificateShareRouter.get(
// 	"/authorizedApplications",
// 	async (req: Request, res) => {
// 		const email = req.auth?.email;
// 		const ledger = await FabricSDK.getLedger();
// 		const user = ledger[email];
// 		console.log(user.authorizedCertificates);
// 		const data: LedgerItem[] = [];
// 		for (let email in user.authorizedCertificates) {
// 			const targetUser = ledger[email];
// 			const ledgerItem: LedgerItem = {
// 				user: email,
// 				columnEncryption: targetUser.columnEncryption,
// 				certificates: [],
// 			};
// 			const authCertificates =
// 				user.authorizedCertificates[email];
// 			authCertificates.forEach(({ created, auth }) => {
// 				const targetCertificate =
// 					targetUser.certificates.find(
// 						(certificate) => certificate.created === created
// 					);
// 				if (!targetCertificate) return;
// 				const AuthCertificate: AuthCertificate = {
// 					...targetCertificate,
// 					auth,
// 				};
// 				ledgerItem.certificates.push(AuthCertificate);
// 			});
// 			data.push(ledgerItem);
// 		}
// 		res.send({
// 			status: 200,
// 			code: 1,
// 			data,
// 		});
// 	}
// );

certificateShareRouter.post<
	Apply.ReqParams,
	Result,
	Apply.ReqBody
>("/apply/:type/:target/:index", async (req, res) => {
	res.send(Res.success("申请成功"));
});

certificateShareRouter.post<
	Process.ReqParams,
	Result,
	Process.ReqBody
>("/process/:index", async (req, res) => {
	// @ts-ignore
});

export default certificateShareRouter;
