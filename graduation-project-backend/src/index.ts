import express from "express";

import { initRoutes } from "./routes/v1";

const app = express();
const port = 3000;

app.get("/", (req, res) => {
	res.send("Hello World!");
});

initRoutes(app);

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});