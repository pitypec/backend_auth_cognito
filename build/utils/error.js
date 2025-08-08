"use strict";
// @flow
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.PaymentRequiredError = exports.InternalServerError = exports.NotAcceptableError = exports.ForbiddenError = exports.NotFoundError = exports.BadRequestError = exports.UnauthorizedError = exports.APIError = void 0;
const winston_1 = __importDefault(require("winston"));
const env_1 = require("../config/env");
class APIError extends Error {
    constructor(status = 500, message = `Unknown Server Error.`, data = {}) {
        super(message);
        this.status = status;
    }
}
exports.APIError = APIError;
class UnauthorizedError extends APIError {
    constructor(message) {
        super(401, message);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class BadRequestError extends APIError {
    constructor(message) {
        super(400, message);
    }
}
exports.BadRequestError = BadRequestError;
class NotFoundError extends APIError {
    constructor(message) {
        super(404, message || "Not Found");
    }
}
exports.NotFoundError = NotFoundError;
class ForbiddenError extends APIError {
    constructor(message) {
        super(403, message);
    }
}
exports.ForbiddenError = ForbiddenError;
class NotAcceptableError extends APIError {
    constructor(message) {
        super(406, message);
    }
}
exports.NotAcceptableError = NotAcceptableError;
class InternalServerError extends APIError {
    constructor(message) {
        super(500, message);
    }
}
exports.InternalServerError = InternalServerError;
class PaymentRequiredError extends APIError {
    constructor(message) {
        super(402, message);
    }
}
exports.PaymentRequiredError = PaymentRequiredError;
const errorHandler = (error, request, response, next) => {
    console.log({ error });
    /**
     * log the error message, and meta object
     */
    winston_1.default.error(error.message, error);
    let res = {
        code: "00",
        statusCode: error.status,
        status: "failure",
        //|| ServerResponseStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
    };
    console.log({ error });
    if (env_1.NODE_ENV === "development" && !(error instanceof APIError)) {
        res = Object.assign({}, res, { stack: error.stack });
    }
    //   if (NODE_ENV === "production" && !(error instanceof APIError)) {
    //     Pubsub.emit("error", res);
    //   }
    response
        .status(error.status
    // || ServerResponseStatus.INTERNAL_SERVER_ERROR
    )
        .json(res);
};
exports.errorHandler = errorHandler;
