import { Router } from "express";

import * as userControllers from "../../controllers/v1/user";

const userRouter = Router();
// 注册
// userRouter.post("/signup", userControllers.signup);

// // 密码登录
// userRouter.post("/login/pwd", userControllers.loginByPwd);

// // 邮箱验证码登录
// userRouter.post(
// 	"/login/captcha",
// 	userControllers.loginByCaptcha
// );

// 获取邮箱验证码
userRouter.get(
	"/",
	userControllers.getUserInfo
);

userRouter.get(
	"/isAuthorized",
	userControllers.getUserInfo
);

export default userRouter;
