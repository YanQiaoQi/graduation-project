import { RequestHandler } from "express";

export const loginByPwd: RequestHandler = (req, res) => {
	res.send({ status: 200 });
};

export const loginByCaptcha: RequestHandler = (
	req,
	res
) => {
	res.send({ status: 200 });
};

export const signup: RequestHandler = (req, res) => {
	res.send({ status: 200 });
};
