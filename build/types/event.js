"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toLambdaEvent = void 0;
const toLambdaEvent = (req) => {
    return {
        body: JSON.stringify(req.body),
        headers: req.headers,
        httpMethod: req.method,
        path: req.path,
        queryStringParameters: req.query,
        pathParameters: req.params,
        requestContext: {}, // optional, only needed if you access it
        isBase64Encoded: false,
        multiValueHeaders: {},
        multiValueQueryStringParameters: null,
        resource: "",
        stageVariables: null,
    };
};
exports.toLambdaEvent = toLambdaEvent;
