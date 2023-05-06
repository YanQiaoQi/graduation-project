import { Router } from "express";
import * as certificateControllers from "../../controllers/v1/certificate";
import upload from "../../middlewares/multer";

const certificateRouter = Router();

// 增
certificateRouter.post(
	"/",
	upload,
	certificateControllers.newCertificate
);

// 删
certificateRouter.delete(
	"/:index",
	certificateControllers.deleteCertificate
);

// 改
certificateRouter.put(
	"/",
	certificateControllers.updateCertificate
);

// 查
certificateRouter.get(
	"/",
	certificateControllers.getCertificate
);

// 查
certificateRouter.get(
	"/:encryption/:index",
	certificateControllers.sendCertificate
);

//
certificateRouter.post(
	"/encrypt",
	certificateControllers.encryptCertificate
);

certificateRouter.get(
	"/decrypt/:encryption/:data",
	certificateControllers.decryptCertificate
);

export default certificateRouter;
