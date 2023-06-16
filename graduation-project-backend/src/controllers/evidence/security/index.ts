import { Router } from "express";
import { DecryptCertificateProp } from "./type";
import type { Result } from "../../../common/type";
import fabric from "../../../services/fabric-sdk";
const securityRouter = Router();

// 加密
securityRouter.post<never, Result>(
	"/encrypt",
	async function encryptCertificates(req, res) {
		// @ts-ignore
		const email = req.auth?.email;
		await fabric.encryptEvidences(email, req.body);
		res.send({
			status: 200,
			code: 1,
			message: "加密成功",
		});
	}
);

// 解密
securityRouter.get<
	DecryptCertificateProp.ReqParams,
	Result
>("/decrypt/:id/:field", async (req, res) => {
	// @ts-ignore
	const email = req.auth?.email;
	const { id, field } = req.params;
	const evidenceId = Number(id);
	const evidence = fabric.getEvidence(evidenceId);
	if (!evidence) {
		res.send({
			status: 200,
			code: 0,
			message: "错误",
		});
		return;
	}
	const applications =
		fabric.getApplicantsApplications(email);
	const targetApplications = applications?.filter(
		(a) => a.evidenceId === evidenceId
	);
	const targetApplication =
		targetApplications?.[targetApplications?.length - 1];
	if (
		evidence.creatorId !== email &&
		(!evidence.access?.[email]?.includes(field) ||
			Date.now() > (targetApplication?.expire ?? 0))
	) {
		res.send({
			status: 200,
			code: 0,
			message: "您没有权限",
		});
		return;
	}
	const data = fabric.decryptEvidencesField(
		evidenceId,
		field,
		email
	);
	res.send({
		status: 200,
		code: 1,
		data,
		message: "鉴权成功",
	});
});

export default securityRouter;
