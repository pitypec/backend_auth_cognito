import { Request } from "express";
import { APIGatewayProxyEvent } from "aws-lambda";

export const toLambdaEvent = (req: Request): APIGatewayProxyEvent => {
  return {
    body: JSON.stringify(req.body),
    headers: req.headers as { [key: string]: string },
    httpMethod: req.method,
    path: req.path,
    queryStringParameters: req.query as { [key: string]: string },
    pathParameters: req.params,
    requestContext: {} as any, // optional, only needed if you access it
    isBase64Encoded: false,
    multiValueHeaders: {},
    multiValueQueryStringParameters: null,
    resource: "",
    stageVariables: null,
  };
};
