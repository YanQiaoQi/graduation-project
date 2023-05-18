import {
	RequestHandler,
	ErrorRequestHandler,
} from "express";
import { expressjwt } from "express-jwt";
import { jwtSecretKey } from "../services/redis/common";
import Res from "../common/res";

export function JWT(): RequestHandler {
	return expressjwt({
		secret: jwtSecretKey,
		algorithms: ["HS256"],
	}).unless({
		path: [
			/^\/v2\/user\/signup/,
			/^\/v2\/user\/login\/.*/,
			/^\/v2\/user\/captcha\/.*/,
			/^\/v1\/user\//,
		],
	});
}

export function errorToken(): ErrorRequestHandler {
	return (err, req, res, next) => {
		if (err.name === "UnauthorizedError") {
			console.log(err);
			res.send(Res.fail(err, 401)); //返回失败信息
		}
	};
}
