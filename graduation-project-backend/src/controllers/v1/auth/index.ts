import jwt from "jsonwebtoken";
import * as FabricSDK from "../../../services/fabric-sdk";
import emailService from "../../../services/email";
import redis from "../../../services/redis";
import Res from "../../../common/res";
import {
	expiresIn,
	jwtSecretKey,
} from "../../../services/redis/common";
import { User } from "../../../common/type";
import { Router } from "express";
import { getRandom6Num } from "../../../common/utils";

const authRouter = Router();

// 注册
authRouter.post("/signup", async (req, res) => {
	const { email, password, captcha } = req?.body;

	// 1. 邮箱已注册
	const { code } = await FabricSDK.get(email);
	if (code === 1) {
		res.send(Res.fail("该邮箱已注册"));
		return;
	}

	// 2. 邮箱验证码错误
	const rightCaptcha = await redis.get(email);
	if (rightCaptcha !== captcha) {
		res.send(Res.fail("邮箱验证码错误"));
		return;
	}

	const user: User = {
		password,
		info: {
			created: Date.now(),
		},
		columnEncryption: {
			name: "clear",
			type: "clear",
			encryption: "clear",
			created: "clear",
			size: "clear",
			description: "clear",
			extension: "clear",
			last_updated: "clear",
		},
		certificates: [],
		othersApplications: [],
		myApplications: [],
	};
	await FabricSDK.set(email, user);
	res.send(Res.success("注册成功"));
});

// 密码登录
authRouter.post("/login/pwd", async (req, res) => {
	const { email, password } = req?.body;
	const { code, data } = await FabricSDK.get(email);

	// 1. 邮箱未注册
	if (code === 0) {
		res.status(200);
		res.send(Res.fail("该邮箱未注册"));
		return;
	}

	// 2. 密码错误
	if (data?.password !== password) {
		res.status(200);
		res.send(Res.fail("密码错误"));
		return;
	}

	const token = jwt.sign({ email: email }, jwtSecretKey, {
		expiresIn: `${expiresIn}s`,
	});

	res.send(
		Res.success("登录成功", 200, {
			token,
		})
	);
});

// 邮箱验证码登录
authRouter.post("/login/captcha", async (req, res) => {
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
			token,
		})
	);
});

// 获取邮箱验证码
authRouter.get("/captcha/:email", async (req, res) => {
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

export default authRouter;
