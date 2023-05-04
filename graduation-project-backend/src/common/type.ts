import {
	RequestHandler as ExpressRequestHandler,
	ErrorRequestHandler as ExpressErrorRequestHandler,
} from "express";
import { Result } from "./res";

export type RequestHandler<T = any> = ExpressRequestHandler<
	Record<string, string>,
	Result,
	T
>;

export type ErrorRequestHandler<T = any> = ExpressErrorRequestHandler<
	Record<string, string>,
	Result,
	T
>;