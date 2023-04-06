import { RequestHandler } from "express";

export function CORS(): RequestHandler {
	return (req, res, next) => {
		const origin = req.headers.origin;
		const isDev = origin?.includes("http://localhost");
		if (!isDev) return;

		res.header("Access-Control-Allow-Origin", origin);
		res.header(
			"Access-Control-Allow-Methods",
			"GET,PUT,POST,DELETE,OPTION"
		);
		res.header(
			"Access-Control-Allow-Headers",
			"Content-Type"
		);
		res.header("Access-Control-Allow-Credentials", "true");
		next();
	};
}
