import { Express } from "express";
import bodyParser from "body-parser";
import { expressjwt } from "express-jwt";
import { CORS } from "./cors";

import { jwtSecretKey } from "../common/constant";

export const initMiddlewares = (app: Express) => {
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(CORS());
	app.use(
		expressjwt({
			secret: jwtSecretKey,
			algorithms: ["HS256"],
		}).unless({ path: [/^\/v1\/auth\//] })
	);
};
