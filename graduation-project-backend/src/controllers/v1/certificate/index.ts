import path from "path";
import {
	writeEncryptedFile,
	splitFileName,
	cryptography,
} from "../../../common/utils";
import { RequestHandler } from "../../../common/type";
import { Res, Result } from "../../../common/res";
import {
	Encryption,
	NewCertificateReqBody,
} from "./interface";
import {
	Certificate,
	Certificates,
	User,
} from "../../../services/fabric-sdk/interface";
import * as FabricSDK from "../../../services/fabric-sdk";

// 增
export const newCertificate: RequestHandler<
	Result<NewCertificateReqBody>
> = async (req, response) => {
	const { type, description, encryption } = req.body;
	// @ts-ignore
	const email = req.auth.email;
	const files = req?.files as Express.Multer.File[];
	const { data } = await FabricSDK.get(email);
	const user = data as User;
	const columnEncryption = user.columnEncryption;

	if (Number(files?.length) <= 0) {
		response.send(Res.fail("上传文件失败"));
		return;
	}

	// 信息存入
	const certificates: Certificates = files?.map(
		({ buffer, originalname, size }) => {
			const [name, extension] = splitFileName(originalname);
			const created = Date.now();
			console.log(created);

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

	const res = await FabricSDK.updateCertificates(
		email,
		certificates
	);
	response.send(Res.create(res));
};

// 删
export const deleteCertificate: RequestHandler = async (
	req,
	response
) => {
	// @ts-ignore
	const email = req.auth.email;
	const index = req.params.index;
	const res = await FabricSDK.deleteCertificates(
		email,
		parseInt(index)
	);
	response.send(Res.create(res));
};

// 改
export const updateCertificate: RequestHandler = (
	req,
	res
) => {};

// 查
export const getCertificate: RequestHandler = async (
	req,
	response
) => {
	// @ts-ignore
	const email = req.auth.email;
	const res = await FabricSDK.getCertificates(email);
	response.send(Res.create(res));
};

export const sendCertificate: RequestHandler<
	Buffer
> = async (req, response) => {
	// @ts-ignore
	const email = req.auth.email;
	const { encryption, index } = req.params;
	const { data } = await FabricSDK.get(email);
	const user = data as User;
	const certificate = user.certificates[parseInt(index)];
	cryptography.decrypt.certificate(
		certificate,
		user.columnEncryption
	);
	const { created, name, extension } = certificate;
	const absolutePath = path.resolve(
		`upload/${email}-${created}-${name}.${extension}`
	);
	const res = await cryptography.decrypt.file(
		encryption as Encryption,
		absolutePath
	);
	response.send(res);
};

export const encryptCertificate: RequestHandler = async (
	req,
	response
) => {
	// @ts-ignore
	const email = req.auth.email;
	const { data } = await FabricSDK.get(email);
	const columnEncryption = req.body;
	const user: User = data;
	const prevColumnEncryption = user.columnEncryption ?? {
		name: "clear",
		type: "clear",
		encryption: "clear",
		created: "clear",
		size: "clear",
		description: "clear",
		extension: "clear",
	};
	user.columnEncryption = columnEncryption;
	user.certificates.forEach((certificate) => {
		cryptography.encrypt.certificate(
			certificate,
			columnEncryption,
			prevColumnEncryption
		);
	});
	await FabricSDK.set(email, user);
	response.send({
		status: 200,
		code: 1,
		data: [columnEncryption, ...user.certificates],
	});
};

export const decryptCertificate: RequestHandler = async (
	req,
	response
) => {
	// @ts-ignore
	const email = req.auth.email;
	const { encryption, data } = req.params;
	// @ts-ignore
	const res = cryptography.decrypt.text(encryption, data);
	response.status(200);
	response.send({ status: 200, code: 1, data: res });
};
