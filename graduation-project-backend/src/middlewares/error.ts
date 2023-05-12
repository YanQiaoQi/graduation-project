import { ErrorRequestHandler } from "express";
import Res from "../common/res";

export function error(): ErrorRequestHandler {
	return (err, req, res, next) => {
		res.send(Res.fail(err)); //返回失败信息
	};
}
