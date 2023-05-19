import { Router } from "express";
import { Request } from "express-jwt";
import path from "path";
import { DeleteCertificate, NewCertificate } from "./type";
import { Res } from "../../../common/res";
import {
	writeEncryptedFile,
	splitFileName,
	cryptography,
	writeEncryptedFiles,
	getEvidenceFromReqBody,
} from "../../../common/utils";
import { Result } from "../../../common/type";
import fabric from "../../../services/fabric-sdk";
import upload from "../../../middlewares/multer";
import {
	Evidence,
	Status,
} from "../../../services/fabric-sdk/type";

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
	Partial<Record<Exclude<keyof Evidence, "id">, string>>
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

crudRouter.get<never, Result>("/all", async (req, res) => {
	const data = fabric.getAllEvidences();
	res.send({
		status: 200,
		code: 1,
		data,
	});
});

crudRouter.get(
	"/download/:id",
	async function downloadCertificate(req, res) {
		// @ts-ignore
		const applicantEmail = req.auth?.email;
		const { id } = req.params;
		const evidence = fabric.getEvidence(Number(id));
		if (!evidence) {
			throw new Error("未找到证据");
		}
		// 鉴权
		if (false) {
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

// crudRouter.post(
// 	"/download/:email/:created",
// 	async function downloadCertificate(req, res) {
// 		// @ts-ignore
// 		const email = req.auth?.email;
// 		const { email: targetEmail } = req.params;
// 		let created: string | number = parseInt(
// 			req.params.created
// 		);
// 		if (isNaN(created)) {
// 			created = req.params.created;
// 		}
// 		const ledger = await FabricSDK.getLedger();
// 		const targetUser = ledger[targetEmail];
// 		const originUser = ledger[email];
// 		const isAuthed = originUser.authorizedCertificates[
// 			targetEmail
// 		]?.find(
// 			(certificate) => certificate.created === created
// 		);
// 		if (email !== targetEmail && !isAuthed) {
// 			throw new Error("不具有权限");
// 		}
// 		const certificate: Certificate =
// 			targetUser.evidences.find(
// 				(certificate) => certificate.created === created
// 			)!;
// 		if (!certificate) {
// 			throw new Error("未找到证据");
// 		}
// 		cryptography.decrypt.certificate(
// 			certificate,
// 			targetUser.columnEncryption
// 		);
// 		const { name, extension, encryption } = certificate;
// 		const absolutePath = path.resolve(
// 			`upload/${targetEmail}-${certificate.created}-${name}.${extension}`
// 		);
// 		const data = await cryptography.decrypt.file(
// 			encryption,
// 			absolutePath
// 		);
// 		res.send(data);
// 	}
// );

export default crudRouter;
