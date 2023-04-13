import { Router } from "express";

import * as authControllers from "../../controllers/v1/auth";

const authRouter = Router();
// 注册
authRouter.post("/signup", authControllers.signup);

// 密码登录
authRouter.post("/login/pwd", authControllers.loginByPwd);

// 邮箱验证码登录
authRouter.post(
	"/login/captcha",
	authControllers.loginByCaptcha
);

// 获取邮箱验证码
authRouter.get(
	"/captcha/:email",
	authControllers.sendCaptchaEmail
);

export default authRouter;
