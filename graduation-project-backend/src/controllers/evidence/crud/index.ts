import { Router } from "express";
import { Request } from "express-jwt";
import path from "path";
import { DeleteCertificate, NewCertificate } from "./type";
import { Res } from "../../../common/res";
import {
	cryptography,
	getEvidenceFromReqBody,
	copy,
} from "../../../common/utils";
import { Result } from "../../../common/type";
import fabric from "../../../services/fabric-sdk";
import upload from "../../../middlewares/multer";
import { Evidence } from "../../../services/fabric-sdk/type";

const crudRouter = Router();

// 增
crudRouter.post<never, Result, NewCertificate.ReqBody>(
	"/",
	upload,
	async (req, res) => {
		// @ts-ignore
		const email = req.auth?.email;
		const files = req?.files as Express.Multer.File[];

		const user = fabric.getUser(email);
		if (!user) {
			res.send(Res.fail("鉴权错误"));
			return;
		}

		await fabric.createEvidences(files, {
			...req.body,
			isPrivate: Number(req.body.isPrivate) as 0 | 1,
			creatorId: email,
		});

		res.send(Res.success("创建成功"));
	}
);

// 删
crudRouter.delete<DeleteCertificate.ReqParams, Result>(
	"/:id",
	async (req, res) => {
		await fabric.deleteEvidence(parseInt(req.params.id));
		res.send(Res.success("删除成功"));
	}
);

// 改
crudRouter.put<
	DeleteCertificate.ReqParams,
	Result,
	DeleteCertificate.ReqBody
>("/:id", async (req, res) => {
	await fabric.updateEvidence(
		parseInt(req.params.id),
		getEvidenceFromReqBody(req.body)
	);
	res.send(Res.success("修改成功"));
});

// 查
crudRouter.get<never, Result>(
	"/",
	async (req: Request, res) => {
		const email = req.auth?.email;
		const user = fabric.getUser(email);
		if (!user) {
			throw new Error("鉴权失败");
		}
		const evidences = fabric.getEvidences(email);
		res.send({
			status: 200,
			code: 1,
			data: {
				evidences,
				fieldEncryption: user.evidenceFieldEncryptionMap,
			},
		});
	}
);

crudRouter.get<never, Result>(
	"/all",
	async (req: Request, res) => {
		const data = fabric.getAllEvidences();
		res.send({
			status: 200,
			code: 1,
			data,
		});
	}
);

crudRouter.get(
	"/download/:id",
	async function downloadCertificate(req, res) {
		// @ts-ignore
		const applicantId = req.auth?.email;
		const { id } = req.params;
		const evidence: Evidence = copy(
			fabric.getEvidence(Number(id))
		);
		if (!evidence) {
			throw new Error("未找到证据");
		}
		// 鉴权
		const applications =
			fabric.getApplicantsApplications(applicantId);
		const targetApplications = applications?.filter(
			(a) => a.evidenceId === Number(id)
		);
		const targetApplication =
			targetApplications?.[targetApplications?.length - 1];
		if (
			evidence.creatorId !== applicantId &&
			(!evidence.access?.[applicantId]?.includes(
				"download"
			) ||
				Date.now() > (targetApplication?.expire ?? 0))
		) {
			throw new Error("鉴权失败");
		}
		const creator = fabric.getUser(evidence.creatorId);
		if (!creator) {
			throw new Error("未找到用户");
		}
		cryptography.decrypt.evidence(
			evidence,
			creator.evidenceFieldEncryptionMap
		);
		const absolutePath = path.resolve(
			`upload/${evidence.creatorId}-${evidence.createTime}-${evidence.name}.${evidence.extension}`
		);
		const data = await cryptography.decrypt.file(
			evidence.encryption,
			absolutePath
		);
		res.send(data);
	}
);

export default crudRouter;
