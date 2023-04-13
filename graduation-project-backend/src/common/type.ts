import { RequestHandler as ExpressRequestHandler } from "express";
import { Result } from "./res";

export type RequestHandler<T = any> = ExpressRequestHandler<
	Record<string, string>,
	Result,
	T
>;
