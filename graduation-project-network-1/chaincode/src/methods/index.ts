import { Method } from "../types";

export const test: Method<void> = async (stub, argus) => {
	console.log("successful");
};

export * from "./auth";
export * from "./certificate";
