const express = require("express");
const n8nRouter = require("./routers/n8n.router");
const GlobalErrorHandler = require("./controllers/error.controller");
require("dotenv").config();

const app = express();

app.use(n8nRouter);

app.use(GlobalErrorHandler);

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
})