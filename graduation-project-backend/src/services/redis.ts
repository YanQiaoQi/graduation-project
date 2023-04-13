import { Redis } from "ioredis";

const redis = new Redis({
	host: "101.34.32.241",
	port: 6380,
	password: "qiyanqiao",
});

redis.on("connect", () => {
	console.log("Successfully ! redis connected ");
});

redis.on("error", () => {
	console.log("Failed ! redis connected ");
});

export default redis;
