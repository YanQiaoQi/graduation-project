import { RequestHandler } from "../../../common/type";
import FabricSDK from "../../../services/fabric-sdk";
import emailService from "../../../services/email";
import redis from "../../../services/redis";
import Res from "../../../common/res";

const getRandom6Num = () => {
	return parseInt(String(Math.random() * 1000000));
};

export const loginByPwd: RequestHandler = async (
	req,
	res
) => {
	const { email, password } = req?.body;
	const { status, data } = await FabricSDK.get(email);

	// 1. 邮箱未注册
	if (status === 0) {
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

	res.send(Res.success("密码正确"));
};

export const loginByCaptcha: RequestHandler = async (
	req,
	res
) => {
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

	res.send(Res.success("登录成功"));
};

// 增
export const signup: RequestHandler = async (req, res) => {
	const { email, password, captcha } = req?.body;

	// 1. 邮箱已注册
	const { status } = await FabricSDK.get(email);
	if (status === 1) {
		res.send(Res.fail("该邮箱已注册"));
		return;
	}

	// 2. 邮箱验证码错误
	const code = await redis.get(email);
	if (code !== captcha) {
		res.send(Res.fail("邮箱验证码错误"));
		return;
	}

	const user = {
		password,
		certificates: [],
	};
	const { status: setStatus } = await FabricSDK.set(
		email,
		user
	);
	if (setStatus === 1) {
		res.send(Res.success("注册成功"));
	}
};

export const sendCaptchaEmail: RequestHandler = async (
	req,
	res
) => {
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
};
