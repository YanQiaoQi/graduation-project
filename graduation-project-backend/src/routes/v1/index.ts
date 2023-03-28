import { Express } from "express";

import authRouter from "./auth";

export const initRoutes = (app: Express) => {
	app.use("/v1/auth", authRouter);
};
