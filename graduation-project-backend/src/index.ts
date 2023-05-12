import express from "express";
import "express-async-errors";
import { initMiddlewares } from "./middlewares";
import { initRoutes } from "./controllers/v1";
import { initServices } from "./services";
import { error } from "./middlewares/error";

const app = express();
const port = 3000;

initMiddlewares(app);

initRoutes(app);

initServices();

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});

app.use(error());
