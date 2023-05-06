import { Router } from "express";

import * as userControllers from "../../controllers/v1/user";

const userRouter = Router();

userRouter.get(
	"/",
	userControllers.getUserInfo
);

userRouter.get(
	"/isAuthorized",
	userControllers.isAuthorized
);

export default userRouter;
