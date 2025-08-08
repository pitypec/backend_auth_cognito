"use strict";
// @flow
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const index_1 = __importDefault(require("../routes/index"));
const error_1 = require("../utils/error");
const headerOptions_1 = __importDefault(require("./headerOptions"));
const app = (0, express_1.default)();
const router = express_1.default.Router();
// const Sentry = require("@sentry/node");
// if (NODE_ENV === "production") {
//   Sentry.init({ dsn: `https://${SENTRY_KEY}@sentry.io/${SENTRY_ID}` });
// }
/*
  Load routes
*/
(0, index_1.default)(router);
/**
 * Load modules
 */
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use(express_1.default.static(path_1.default.join(__dirname, "../public")));
app.use((0, cors_1.default)());
/**
 * Header options
 */
app.use(headerOptions_1.default);
app.get("/", (req, res) => {
    res.status(200).json({ message: "Server Working Good", status: "success" });
});
// app.all('/*"*"', authHeader);
app.use(router);
// dataUtil(models.Farmer);
/**
 *  error handler
 */
app.use(error_1.errorHandler);
exports.default = app;
