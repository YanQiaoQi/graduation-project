import express from "express";
import { initMiddlewares } from "./middlewares";
import { initRoutes } from "./routes/v1";
import { initServices } from "./services";

const app = express();
const port = 3000;

app.get("/", (req, res) => {
	res.send("Hello World!");
});

initMiddlewares(app);

initRoutes(app);

initServices();

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
