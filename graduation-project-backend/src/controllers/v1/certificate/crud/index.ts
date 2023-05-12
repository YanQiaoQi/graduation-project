import { Router } from "express";
import { Request } from "express-jwt";
import path from "path";
import { DeleteCertificate, NewCertificate } from "./type";
import { Result, Res } from "../../../../common/res";
import {
	writeEncryptedFile,
	splitFileName,
	cryptography,
} from "../../../../common/utils";
import { Certificate } from "../../../../common/type";
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
	const certificates: Certificate[] = files?.map(
		({ buffer, originalname, size }) => {
			const [name, extension] = splitFileName(originalname);
			const created = Date.now();
			const last_updated = created;
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

certificateCrudRouter.get(
	"/download/:index",
	async function downloadCertificate(req, res) {
		// @ts-ignore
		const email = req.auth?.email;
		const { index } = req.params;
		const { data: user } = await FabricSDK.get(email);
		const certificate = user.certificates[parseInt(index)];
		cryptography.decrypt.certificate(
			certificate,
			user.columnEncryption
		);
		const { created, name, extension, encryption } =
			certificate;
		const absolutePath = path.resolve(
			`upload/${email}-${created}-${name}.${extension}`
		);
		const data = await cryptography.decrypt.file(
			encryption,
			absolutePath
		);
		res.send(data);
	}
);

export default certificateCrudRouter;
