import { Router } from "express";
import { Request } from "express-jwt";
import path from "path";
import { DeleteCertificate, NewCertificate } from "./type";
import { Res } from "../../../../common/res";
import {
	writeEncryptedFile,
	splitFileName,
	cryptography,
} from "../../../../common/utils";
import {
	Certificate,
	Result,
} from "../../../../common/type";
import * as FabricSDK from "../../../../services/fabric-sdk";
import upload from "../../../../middlewares/multer";

const certificateCrudRouter = Router();

// 增
certificateCrudRouter.post<
	never,
	Result,
	NewCertificate.ReqBody
>("/", upload, async (req, res) => {
	const { type, description, encryption } = req.body;
	// @ts-ignore
	const email = req.auth?.email;
	const files = req?.files as Express.Multer.File[];

	const { data: user } = await FabricSDK.get(email);
	const columnEncryption = user.columnEncryption;
	// 信息存入
	let prevCreated: number;
	const certificates: Certificate[] = files?.map(
		({ buffer, originalname, size }) => {
			let created = Date.now();
			if (prevCreated === created) {
				created++;
			}
			prevCreated = created;
			const last_updated = created;
			const [name, extension] = splitFileName(originalname);
			writeEncryptedFile(
				path.resolve(
					`upload/${email}-${created}-${originalname}`
				),
				buffer,
				encryption
			);
			const certificate: Certificate = {
				name,
				size,
				extension,
				type,
				description,
				encryption,
				created,
				last_updated,
			};
			cryptography.encrypt.certificate(
				certificate,
				columnEncryption
			);
			return certificate;
		}
	);

	const fabricRes = await FabricSDK.addCertificates(
		email,
		certificates
	);

	res.send(Res.create(fabricRes));
});

// 删
certificateCrudRouter.delete<
	DeleteCertificate.ReqParams,
	Result,
	DeleteCertificate.ReqBody
>("/:index", async (req, res) => {
	// @ts-ignore
	const email = req.auth?.email;
	const { index } = req.params;
	const { password } = req.body;

	const fabricRes = await FabricSDK.deleteCertificate(
		email,
		parseInt(index)
	);
	res.send(Res.create(fabricRes));
});

// 查
certificateCrudRouter.get(
	"/",
	async function getCertificates(req: Request, res) {
		const email = req.auth?.email;
		const fabricRes = await FabricSDK.getCertificates(
			email
		);
		res.send(Res.create(fabricRes));
	}
);

certificateCrudRouter.get(
	"/all",
	async function getAllCertificates(req, res) {
		const fabricRes = await FabricSDK.getAllCertificates();
		res.send(Res.create(fabricRes));
	}
);

certificateCrudRouter.post(
	"/download/:email/:created",
	async function downloadCertificate(req, res) {
		// @ts-ignore
		const email = req.auth?.email;
		const { email: targetEmail } = req.params;
		let created: string | number = parseInt(
			req.params.created
		);
		if (isNaN(created)) {
			created = req.params.created;
		}
		const ledger = await FabricSDK.getLedger();
		const targetUser = ledger[targetEmail];
		const originUser = ledger[email];
		const isAuthed = originUser.authorizedCertificates[
			targetEmail
		]?.find(
			(certificate) => certificate.created === created
		);
		if (email !== targetEmail && !isAuthed) {
			throw new Error("不具有权限");
		}
		const certificate: Certificate =
			targetUser.certificates.find(
				(certificate) => certificate.created === created
			)!;
		if (!certificate) {
			throw new Error("未找到证据");
		}
		cryptography.decrypt.certificate(
			certificate,
			targetUser.columnEncryption
		);
		const { name, extension, encryption } = certificate;
		const absolutePath = path.resolve(
			`upload/${targetEmail}-${certificate.created}-${name}.${extension}`
		);
		const data = await cryptography.decrypt.file(
			encryption,
			absolutePath
		);
		res.send(data);
	}
);

export default certificateCrudRouter;
