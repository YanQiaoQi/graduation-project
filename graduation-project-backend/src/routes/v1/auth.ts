import express from "express";

import * as authControllers from "../../controllers/v1/auth";

const authRouter = express.Router();

authRouter.post("/login/pwd", authControllers.loginByPwd);
authRouter.post(
	"/login/captcha",
	authControllers.loginByCaptcha
);
authRouter.post("/signup", authControllers.signup);

export default authRouter;
