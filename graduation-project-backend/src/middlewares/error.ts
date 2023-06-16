import { ErrorRequestHandler } from "express";
import Res from "../common/res";

export function error(): ErrorRequestHandler {
	return (err, req, res, next) => {
		console.log(err);
		res.status(403);
		res.send(Res.fail(JSON.stringify(err))); //返回失败信息
	};
}
