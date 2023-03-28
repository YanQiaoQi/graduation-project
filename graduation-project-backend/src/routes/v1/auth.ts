import express from "express";

import * as authControllers from "../../controllers/v1/auth";

let authRouter = express.Router();

authRouter.post("/signin", authControllers.signin);
authRouter.post("/signup", authControllers.signup);

export default authRouter;
