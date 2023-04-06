import { Express } from "express";
import bodyParser from "body-parser";
import { CORS } from "./cors";

export const initMiddlewares = (app: Express) => {
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(CORS());
};
