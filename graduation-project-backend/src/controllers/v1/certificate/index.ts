import { Router } from "express";
import crudRouter from "./crud";
import shareRouter from "./share";
import securityRouter from "./security";

const certificateRouter = Router();

certificateRouter.use("/", crudRouter);
certificateRouter.use("/", securityRouter);
certificateRouter.use("/share", shareRouter);

export default certificateRouter;
