import { Router } from "express";
import jwt from "jsonwebtoken";
import { Request } from "express-jwt";
import fabric from "../../services/fabric-sdk";
import {
	UserInfo,
	Status,
} from "../../services/fabric-sdk/type";
import emailService from "../../services/email";
import redis from "../../services/redis";
import Res from "../../common/res";
import {
	expiresIn,
	jwtSecretKey,
} from "../../services/redis/common";
import { getRandom6Num } from "../../common/utils";
import { Result } from "../../common/type";

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

// 检验邮箱
userRouter.post(
	"/captcha/check",
	async (req: Request, res) => {
		const { email, captcha } = req.body;
		console.log(email);

		const rightCaptcha = await redis.get(email);
		console.log(
			captcha,
			rightCaptcha,
			typeof captcha,
			typeof rightCaptcha
		);

		if (rightCaptcha !== captcha) {
			res.send(Res.fail("邮箱验证码错误"));
			return;
		}
		res.send(Res.success("邮箱验证成功"));
	}
);

// 重置密码
userRouter.post("/resetPwd", async (req: Request, res) => {
	const { email, password } = req?.body;

	// 1. 邮箱已注册
	const user = fabric.getUser(email);
	if (!user) {
		res.send(Res.fail("该邮箱未注册"));
		return;
	}
	user.password = password;

	await fabric.updateUser(email, user);
	res.send(Res.success("修改密码成功"));
});

userRouter.get("/", async (req: Request, response) => {
	const email = req.auth?.email;
	const user = fabric.getUser(email);
	if (!user) {
		return;
	}
	response.send({
		status: 200,
		code: 1,
		message: "操作成功",
		data: {
			createTime: user.createTime,
			...(user.info ?? {}),
		},
	});
});
type UpdateUserInfo = {
	sex?: "1" | "0";
	ID?: string;
};

userRouter.post<{}, Result, UpdateUserInfo>(
	"/",
	async (req, response) => {
		//@ts-ignore
		const email = req.auth?.email;
		const user = fabric.getUser(email);
		if (!user) {
			return;
		}
		console.log(req.body);

		if (!user.info) {
			user.info = {};
		}
		if (
			req.body.hasOwnProperty("sex") &&
			req.body.sex !== undefined &&
			req.body.sex !== null
		) {
			user.info.sex = Number(req.body.sex) as Status;
		}
		if (req.body.hasOwnProperty("ID") && req.body.ID) {
			user.info.ID = req.body.ID;
		}
		await fabric.updateUser(email, user);
		console.log(user.info);

		response.send({
			status: 200,
			code: 1,
			message: "修改个人信息成功",
		});
	}
);

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

userRouter.post("/check", async (req: Request, res) => {
	const email = req.auth?.email;
	const pwd = req.body.password;
	const user = fabric.getUser(email);
	user?.password === pwd
		? res.send({
				status: 200,
				code: 1,
				message: "鉴权成功",
		  })
		: res.send({
				status: 200,
				code: 0,
				message: "鉴权失败",
		  });
});

export default userRouter;
