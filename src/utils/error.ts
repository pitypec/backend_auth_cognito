// @flow

import { NextFunction, Request, Response } from "express";
import winston from "winston";
import { NODE_ENV } from "../config/env";

export class APIError extends Error {
  status: number;
  constructor(
    status: number = 500,
    message: string = `Unknown Server Error.`,
    data: {} = {}
  ) {
    super(message);
    this.status = status;
  }
}

export class UnauthorizedError extends APIError {
  constructor(message: any) {
    super(401, message);
  }
}

export class BadRequestError extends APIError {
  constructor(message: string) {
    super(400, message);
  }
}

export class NotFoundError extends APIError {
  constructor(message: string) {
    super(404, message || "Not Found");
  }
}

export class ForbiddenError extends APIError {
  constructor(message: string) {
    super(403, message);
  }
}
export class NotAcceptableError extends APIError {
  constructor(message: string) {
    super(406, message);
  }
}

export class InternalServerError extends APIError {
  constructor(message: string) {
    super(500, message);
  }
}

export class PaymentRequiredError extends APIError {
  constructor(message: string) {
    super(402, message);
  }
}

export const errorHandler = (
  error: any,
  request: Request,
  response: Response,
  next: NextFunction
) => {
  console.log({ error });
  /**
   * log the error message, and meta object
   */
  winston.error(error.message, error);
  let res = {
    code: "00",
    statusCode: error.status,
    status: "failure",
    //|| ServerResponseStatus.INTERNAL_SERVER_ERROR,
    message: error.message,
  };
  console.log({ error });

  if (NODE_ENV === "development" && !(error instanceof APIError)) {
    res = Object.assign({}, res, { stack: error.stack });
  }

  //   if (NODE_ENV === "production" && !(error instanceof APIError)) {
  //     Pubsub.emit("error", res);
  //   }
  response
    .status(
      error.status
      // || ServerResponseStatus.INTERNAL_SERVER_ERROR
    )
    .json(res);
};
