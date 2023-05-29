import express from "express";
import "express-async-errors";
import { initMiddlewares } from "./middlewares";
import { initRoutes } from "./controllers";
import { error } from "./middlewares/error";
import fabric from "./services/fabric-sdk";

const app = express();
const port = 3000;

initMiddlewares(app);

initRoutes(app);

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});

app.use(error());
// setTimeout(() => {
// 	fabric.createUser("1981405879@qq.com", "nbawwe_0425");
// },5000);
