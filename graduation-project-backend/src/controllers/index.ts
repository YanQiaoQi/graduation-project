import { Express } from "express";
import v2userRouter from "./user";
import v2certificateRouter from "./evidence";

export const initRoutes = (app: Express) => {
	app.use("/v2/certificate", v2certificateRouter);
	app.use("/v2/user", v2userRouter);
};
