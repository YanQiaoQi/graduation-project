import multer from "multer";
import { splitFileName } from "../common/utils";

const storage = multer.diskStorage({
	destination: "upload",
	filename: function (req, file, cb) {
		// @ts-ignore
		const email = req.auth.email;

		const originalname = Buffer.from(
			file.originalname,
			"latin1"
		).toString("utf8");
		cb(null, `${email}-${Date.now()}-${originalname}`);
	},
});

const upload = multer({ storage }).array("file");

export default upload;
