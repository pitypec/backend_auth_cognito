// @flow

import express, { Application, Router, Request, Response } from "express";
import path from "path";
import logger from "morgan";
import cors from "cors";
import routeHandler from "../routes/index";
import { errorHandler } from "../utils/error";
import headerOptions from "./headerOptions";
import authHeader from "../middleware/authHeader";

const app: Application = express();
const router: Router = express.Router();

// const Sentry = require("@sentry/node");

// if (NODE_ENV === "production") {
//   Sentry.init({ dsn: `https://${SENTRY_KEY}@sentry.io/${SENTRY_ID}` });
// }

/*
  Load routes
*/
routeHandler(router);

/**
 * Load modules
 */
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "../public")));
app.use(cors());

/**
 * Header options
 */
app.use(headerOptions);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Server Working Good", status: "success" });
});

// app.all('/*"*"', authHeader);
app.use(router);

// dataUtil(models.Farmer);
/**
 *  error handler
 */
app.use(errorHandler);

export default app;
