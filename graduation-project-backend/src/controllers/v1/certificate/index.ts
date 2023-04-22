import { RequestHandler } from "../../../common/type";
import { Res } from "../../../common/res";
import { NewCertificateReqBody } from "./interface";
import { Certificates } from "../../../services/fabric-sdk/interface";
import { getFileInfo } from "../../../common/utils";
import * as FabricSDK from "../../../services/fabric-sdk";
import path from "path";

// 增
export const newCertificate: RequestHandler<
	NewCertificateReqBody
> = async (req, response) => {
	const { type, description } = req.body;
	// @ts-ignore
	const email = req.auth.email;
	const files = req?.files as Express.Multer.File[];
	console.log(files);

	if (Number(files?.length) <= 0) {
		response.send(Res.fail("上传文件失败"));
		return;
	}
	const certificates: Certificates = [];
	// @ts-ignore
	files?.forEach(
		({ filename: filenameWithExtAndTime, size }) => {
			const [name, createTime, ext] = getFileInfo(
				filenameWithExtAndTime
			);
			certificates.push({
				size,
				name,
				extension: ext,
				type,
				description,
				created: parseInt(createTime),
				last_updated: parseInt(createTime),
			});
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

export const sendCertificate: RequestHandler = async (
	req,
	response
) => {
	// @ts-ignore
	const email = req.auth.email;
	const { name, created } = req.params;
	const absolutePath = path.resolve(
		`upload/${email}-${created}-${name}`
	);
	// response.set({
	// 	"Content-Disposition": `filename=${name}`,
	// });
	response.download(absolutePath);
};
