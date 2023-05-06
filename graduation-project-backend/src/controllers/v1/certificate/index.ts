import path from "path";
import {
	decrypt,
	writeEncryptedFile,
	splitFileName,
	encryptFile,
	encryptText,
	decryptStr,
} from "../../../common/utils";
import { RequestHandler } from "../../../common/type";
import { Res, Result } from "../../../common/res";
import {
	Encryption,
	NewCertificateReqBody,
} from "./interface";
import {
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

	if (Number(files?.length) <= 0) {
		response.send(Res.fail("上传文件失败"));
		return;
	}

	// 信息存入
	const certificates: Certificates = files?.map(
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
			return {
				name,
				size,
				extension,
				type,
				description,
				encryption,
				created,
				last_updated,
			};
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
	const { name, created } = req.params;
	const absolutePath = path.resolve(
		`upload/${email}-${created}-${name}`
	);
	const data = await decrypt(absolutePath, "AES");
	response.send(data);
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
	for (let key in columnEncryption) {
		if (columnEncryption.hasOwnProperty(key)) {
			// @ts-ignore
			const prevEncryption = prevColumnEncryption?.[key];
			const encryption = columnEncryption[key];
			if (
				encryption === "clear" ||
				prevEncryption === encryption
			) {
				continue;
			}
			user.certificates.forEach((certificate) => {
				// @ts-ignore
				certificate[key] = encryptText(
					// @ts-ignore
					certificate[key],
					encryption
				);
			});
		}
	}
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
	const res = decryptStr(data, encryption);
	response.status(200);
	response.send({ status: 200, code: 1, data: res });
};
