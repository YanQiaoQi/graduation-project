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
	}).unless({ path: [/^\/v1\/auth\//] });
}

export function errorToken(): ErrorRequestHandler {
	return (err, req, res, next) => {
		if (err.name === "UnauthorizedError") {
			res.send(Res.fail(err, 401)); //返回失败信息
		}
	};
}
