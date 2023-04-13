import { Express } from "express";

import authRouter from "./auth";

import certificateRouter from "./certificate";

export const initRoutes = (app: Express) => {
	app.use("/v1/auth", authRouter);
	app.use("/v1/certificate", certificateRouter);
};
