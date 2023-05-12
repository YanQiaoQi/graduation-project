import { Router } from "express";
import { Request } from "express-jwt";
import { Res } from "../../../common/res";
import * as FabricSDK from "../../../services/fabric-sdk";

const userRouter = Router();

userRouter.get("/", async (req: Request, response) => {
	const email = req.auth?.email;
	const res = await FabricSDK.get(email);
	response.send(Res.create(res));
});

userRouter.get(
	"/isAuthorized",
	async (req: Request, res) => {
		const email = req.auth?.email;
		email
			? res.send({
					status: 200,
					code: 1,
					message: "鉴权成功",
					data: { email },
			  })
			: res.send({
					status: 401,
					code: 0,
					message: "鉴权失败",
			  });
		return;
	}
);

export default userRouter;
