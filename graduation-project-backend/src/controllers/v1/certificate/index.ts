import { RequestHandler } from "../../../common/type";
import { Res } from "../../../common/res";
import { NewCertificateReqBody } from "./interface";
import { File } from "buffer";

// 增
export const newCertificate: RequestHandler<
	NewCertificateReqBody
> = async (req, res) => {
	const { type, description } = req.body;
	const file = req?.files;
	console.log(file);
	
	if (Number(file?.length) > 0) {
		res.send(Res.success("存证新建成功"));
	} else {
		res.send(Res.fail("存证新建失败"));
	}
};

// 删
export const deleteCertificate: RequestHandler = (
	req,
	res
) => {};

// 改
export const updateCertificate: RequestHandler = (
	req,
	res
) => {};

// 查
export const getCertificate: RequestHandler = (
	req,
	res
) => {};
