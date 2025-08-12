"use strict";
// @flow
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = __importDefault(require("http-status"));
const ServerResponseStatus = {
    RESPONSE_STATUS_FAILURE: "failure",
    RESPONSE_STATUS_SUCCESS: "success",
    OK: http_status_1.default.OK,
    INTERNAL_SERVER_ERROR: http_status_1.default.INTERNAL_SERVER_ERROR,
    NOT_FOUND: http_status_1.default.NOT_FOUND,
    FAILED: http_status_1.default.BAD_REQUEST,
    BAD_REQUEST: http_status_1.default.BAD_REQUEST,
};
exports.default = ServerResponseStatus;
