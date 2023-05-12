import { Router } from "express";
import { DecryptCertificateProp } from "./type";
import { Result } from "../../../../common/res";
import * as FabricSDK from "../../../../services/fabric-sdk";
import { cryptography } from "../../../../common/utils";
const certificateSecurityRouter = Router();

// 加密
certificateSecurityRouter.post(
	"/encrypt",
	async function encryptCertificates(req, res) {
		// @ts-ignore
		const email = req.auth?.email;
		const { data: user } = await FabricSDK.get(email);
		const columnEncryption = req.body;
		const prevColumnEncryption = user.columnEncryption;
		user.columnEncryption = columnEncryption;
		user.certificates.forEach((certificate) => {
			cryptography.encrypt.certificate(
				certificate,
				columnEncryption,
				prevColumnEncryption
			);
		});
		await FabricSDK.set(email, user);
		res.send({
			status: 200,
			code: 1,
			data: {
				columnEncryption,
				certificates: user.certificates,
			},
		});
	}
);

// 解密
certificateSecurityRouter.post<
	DecryptCertificateProp.ReqParams,
	Result,
	DecryptCertificateProp.ReqBody
>("/decrypt/:encryption/:data", async (req, res) => {
	// @ts-ignore
	const email = req.auth?.email;
	const { encryption, data } = req.params;
	const { password } = req.body;
	await FabricSDK.isAuthorized(email, password);
	res.send({
		status: 200,
		code: 1,
		data: cryptography.decrypt.text(encryption, data),
		message: "鉴权成功",
	});
});

export default certificateSecurityRouter
