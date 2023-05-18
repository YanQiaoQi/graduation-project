import { Router } from "express";
import jwt from "jsonwebtoken";
import { Request } from "express-jwt";
import * as FabricSDK from "../../services/fabric-sdk";
import fabric from "../../services/fabric-sdk";
import emailService from "../../services/email";
import redis from "../../services/redis";
import Res from "../../common/res";
import {
	expiresIn,
	jwtSecretKey,
} from "../../services/redis/common";
import { getRandom6Num } from "../../common/utils";

const userRouter = Router();

// 注册
userRouter.post("/signup", async (req, res) => {
	const { email, password, captcha } = req?.body;

	// 1. 邮箱已注册
	const existeduser = fabric.getUser(email);
	if (existeduser) {
		res.send(Res.fail("该邮箱已注册"));
		return;
	}

	// 2. 邮箱验证码错误
	const rightCaptcha = await redis.get(email);
	if (rightCaptcha !== captcha) {
		res.send(Res.fail("邮箱验证码错误"));
		return;
	}

	await fabric.createUser(email, password);
	res.send(Res.success("注册成功"));
});

// 密码登录
userRouter.post("/login/pwd", async (req, res) => {
	const { email } = req?.body;
	const user = fabric.getUser(email);

	// 1. 邮箱未注册
	if (!user) {
		res.send(Res.fail("该邮箱未注册"));
		return;
	}

	// 2. 密码错误
	if (user.password !== req.body?.password) {
		res.send(Res.fail("密码错误"));
		return;
	}

	const token = jwt.sign({ email }, jwtSecretKey, {
		expiresIn: `${expiresIn}s`,
	});

	res.send(
		Res.success("登录成功", 200, {
			data: token,
		})
	);
});

// 邮箱验证码登录
userRouter.post("/login/captcha", async (req, res) => {
	const { email, captcha } = req?.body;
	const code = await redis.get(email);

	// 1. 邮箱验证码过期
	if (!code) {
		res.send(Res.fail("邮箱验证码已过期"));
		return;
	}

	// 2. 邮箱验证码错误
	if (code !== captcha) {
		res.send(Res.fail("邮箱验证码错误"));
		return;
	}

	const token = jwt.sign({ email: email }, jwtSecretKey, {
		expiresIn: `${expiresIn}s`,
	});

	res.send(
		Res.success("登录成功", 200, {
			data: token,
		})
	);
});

// 获取邮箱验证码
userRouter.get("/captcha/:email", async (req, res) => {
	const { email } = req.params;
	const captcha = getRandom6Num();
	redis.setex(email, 300, captcha);
	emailService
		.send(email, captcha)
		.then(() => {
			res.send(Res.success("邮箱验证码发送成功"));
		})
		.catch((e) => {
			res.send(Res.fail(e));
		});
});

userRouter.get("/", async (req: Request, response) => {
	const email = req.auth?.email;
	const res = await FabricSDK.get(email);
	response.send(Res.create(res));
});

userRouter.get(
	"/isAuthorized",
	async (req: Request, res) => {
		const email = req.auth?.email;
		const user = fabric.getUser(email);
		user
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
	}
);

export default userRouter;
