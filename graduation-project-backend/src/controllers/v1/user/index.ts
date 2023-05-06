import { RequestHandler } from "../../../common/type";
import { Res } from "../../../common/res";
import * as FabricSDK from "../../../services/fabric-sdk";
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
		: res.send(Res.fail("未鉴权"));
	return;
};
