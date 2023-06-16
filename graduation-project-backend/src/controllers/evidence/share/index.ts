import { Router } from "express";
import { Apply, Process } from "./type";
import { Result } from "../../../common/type";
import { Res } from "../../../common/res";
import fabric from "../../../services/fabric-sdk";
import { Request } from "express-jwt";
import { Status } from "../../../services/fabric-sdk/type";
const shareRouter = Router();

// 获取我的申请队列
shareRouter.get(
	"/applications/applicant",
	async (req: Request, res) => {
		const email = req.auth?.email;
		const applications =
			fabric.getApplicantsApplications(email);
		const data = applications?.map((a) => {
			const { evidenceId } = a;
			const evidence = fabric.getEvidence(evidenceId);
			const transactor = fabric.getUser(a.transactorId);
			return {
				...a,
				evidences: [evidence],
				access: evidence?.access?.[email],
				fieldEncryption:
					transactor?.evidenceFieldEncryptionMap,
			};
		});
		res.send({
			status: 200,
			code: 1,
			data,
		});
	}
);

//获取他人申请队列;
shareRouter.get(
	"/applications/transactor",
	async (req: Request, res) => {
		const email = req.auth?.email;
		const applications =
			fabric.getTransactorsApplications(email);
		const data = applications?.map((a) => {
			const { evidenceId } = a;
			const evidence = fabric.getEvidence(evidenceId);
			const transactor = fabric.getUser(a.transactorId);
			return {
				...a,
				evidences: [evidence],
				access: evidence?.access?.[email],
				fieldEncryption:
					transactor?.evidenceFieldEncryptionMap,
			};
		});
		res.send({
			status: 200,
			code: 1,
			data,
		});
	}
);

shareRouter.post<Apply.ReqParams, Result>(
	"/apply/:type/:id",
	async (req, res) => {
		// @ts-ignore
		const email = req.auth?.email;
		const { type, id } = req.params;
		const evidenceId = Number(id);
		if (
			!fabric.shouldCreateApplication(email, evidenceId)
		) {
			res.send(
				Res.fail("已申请，但未批准 或 申请通过，资源未过期")
			);
			return;
		}
		await fabric.createApplication(email, evidenceId, type);
		res.send(Res.success("申请成功"));
	}
);

// 处理申请
shareRouter.post<
	Process.ReqParams,
	Result,
	Process.ReqBody
>("/process/:id", async (req, res) => {
	const id = Number(req.params.id);
	const { code, expire } = req.body;

	await fabric.updateApplication(
		id,
		Number(code) as Status,
		Number(expire)
	);
	res.send({
		status: 200,
		code: 1,
		message: "处理成功",
	});
});

export default shareRouter;
