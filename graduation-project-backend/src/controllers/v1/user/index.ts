import { RequestHandler } from "../../../common/type";
import { Res } from "../../../common/res";
import { NewCertificateReqBody } from "./interface";
import { Certificates } from "../../../services/fabric-sdk/interface";
import { getFileInfo } from "../../../common/utils";
import * as FabricSDK from "../../../services/fabric-sdk";
import path from "path";

// 增
export const getUserInfo: RequestHandler = async (
	req,
	response
) => {
	// @ts-ignore
	const email = req.auth.email;
	const res = await FabricSDK.get(email);
	res.data.info.email = email;
	response.send(Res.create(res));
};

// 鉴权
export const isAuthorized: RequestHandler = async (
	req,
	res
) => {
	// @ts-ignore
	const email = req.auth.email;
	email
		? res.send(Res.success("已鉴权"))
		: res.send(Res.success("未鉴权"));
	return;
};
