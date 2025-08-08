"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WEBSOCKET_API_ENDPOINT = exports.APP_CLIENT_ID = exports.APP_SECRET_KEY = exports.AWS_REGION = exports.AWS_BUCKET = exports.AWS_SECRET_ACCESS_KEY = exports.AWS_ACCESS_KEY_ID = exports.API_BASE_URL = exports.NODE_ENV = exports.HOST_NAME = exports.PORT = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
_a = process.env, exports.PORT = _a.PORT, exports.HOST_NAME = _a.HOST_NAME, exports.NODE_ENV = _a.NODE_ENV, exports.API_BASE_URL = _a.API_BASE_URL, exports.AWS_ACCESS_KEY_ID = _a.AWS_ACCESS_KEY_ID, exports.AWS_SECRET_ACCESS_KEY = _a.AWS_SECRET_ACCESS_KEY, exports.AWS_BUCKET = _a.AWS_BUCKET, exports.AWS_REGION = _a.AWS_REGION, exports.APP_SECRET_KEY = _a.APP_SECRET_KEY, exports.APP_CLIENT_ID = _a.APP_CLIENT_ID, exports.WEBSOCKET_API_ENDPOINT = _a.WEBSOCKET_API_ENDPOINT;
