import { Request, Response, NextFunction } from "express";
import { toLambdaEvent } from "../types/event";
import { APIGatewayProxyEvent } from "aws-lambda";

const authHeader = async (req: Request, res: Response, next: NextFunction) => {
  const lambdaEvent: APIGatewayProxyEvent = toLambdaEvent(req);

  if (lambdaEvent.headers) {
    const authHeader =
      lambdaEvent.headers.Authorization || lambdaEvent.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        message: "Missing Authorization header",
      });
    }
    next();
  }
};

export default authHeader;
