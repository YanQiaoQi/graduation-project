import {
	RequestHandler as ExpressRequestHandler,
	ErrorRequestHandler as ExpressErrorRequestHandler,
} from "express";
import { Result } from "./res";

export type RequestHandler<
	resBody = Result<any>,
	T = any
> = ExpressRequestHandler<
	Record<string, string>,
	resBody,
	T
>;

export type ErrorRequestHandler<T = any> =
	ExpressErrorRequestHandler<
		Record<string, string>,
		Result,
		T
	>;
