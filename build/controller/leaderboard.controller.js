"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const uuid_1 = require("uuid");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const event_1 = require("../types/event");
const env_1 = require("../config/env");
const client_apigatewaymanagementapi_1 = require("@aws-sdk/client-apigatewaymanagementapi");
const ddbClient = new client_dynamodb_1.DynamoDBClient({
    region: env_1.AWS_REGION,
    credentials: {
        accessKeyId: env_1.AWS_ACCESS_KEY_ID,
        secretAccessKey: env_1.AWS_SECRET_ACCESS_KEY,
    },
});
class LeaderboardController {
    constructor() {
        /**
         * Notify user over WebSocket if score > 1000
         *
         * @param connectionId The WebSocket connection ID (stored during $connect)
         * @param score The user’s score
         */
        this.notifyIfHighScore = (connectionId, score, userName) => __awaiter(this, void 0, void 0, function* () {
            if (score <= 1000)
                return; // Only notify for scores > 1000
            // const endpoint = process.env.WEBSOCKET_API_ENDPOINT; // e.g., 'https://xxxxxxx.execute-api.us-east-1.amazonaws.com/prod'
            const client = new client_apigatewaymanagementapi_1.ApiGatewayManagementApiClient({
                region: env_1.AWS_REGION,
                endpoint: env_1.WEBSOCKET_API_ENDPOINT,
            });
            const message = {
                type: "high_score",
                content: `🎉 Congrats ${userName}, you scored ${score}!`,
            };
            const command = new client_apigatewaymanagementapi_1.PostToConnectionCommand({
                ConnectionId: connectionId,
                Data: Buffer.from(JSON.stringify(message)),
            });
            try {
                yield client.send(command);
                console.log(`✅ WebSocket message sent to ${connectionId}`);
            }
            catch (error) {
                console.error(`❌ Failed to send WebSocket message`, error);
                // Optionally, handle stale connection (e.g., delete from DB)
            }
        });
        this.storeConnectionId = (userId, connectionId) => __awaiter(this, void 0, void 0, function* () {
            const command = new client_dynamodb_1.PutItemCommand({
                TableName: "WebSocketConnections",
                Item: {
                    userId: { S: userId },
                    connectionId: { S: connectionId },
                },
            });
            try {
                yield ddbClient.send(command);
                console.log(`✅ Stored connectionId for user ${userId}`);
            }
            catch (error) {
                console.error("❌ Failed to store connectionId:", error);
                throw error;
            }
        });
        this.ddbClient = new client_dynamodb_1.DynamoDBClient({ region: process.env.AWS_REGION });
        this.tableName = "Leaderboard";
    }
    registerConnection(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = (0, event_1.toLambdaEvent)(req);
            try {
                const authHeader = event.headers.Authorization || event.headers.authorization;
                if (!authHeader) {
                    return {
                        statusCode: 401,
                        body: JSON.stringify({ message: "Missing Authorization header" }),
                    };
                }
                console.log({ authHeader });
                const token = authHeader.replace("Bearer ", "");
                const decoded = jsonwebtoken_1.default.decode(token);
                console.log({ decoded });
                const userId = decoded === null || decoded === void 0 ? void 0 : decoded.sub;
                let connectionId = event.requestContext.connectionId;
                console.log({ connectionId });
                // Fallback: get connectionId from body if missing (manual call)
                if (!connectionId && event.body) {
                    const parsedBody = JSON.parse(event.body);
                    connectionId = parsedBody.connectionId;
                }
                if (!userId || !connectionId) {
                    return res.status(400).json({
                        code: "00",
                        status: "failure",
                        statusCode: 400,
                        message: "Invalid userId or connectionId",
                    });
                }
                yield this.storeConnectionId(userId, connectionId);
                return {
                    statusCode: 200,
                    body: JSON.stringify({ message: "Connection registered successfully" }),
                };
            }
            catch (err) {
                console.error("Register connection error", err);
                return {
                    statusCode: 500,
                    body: JSON.stringify({
                        message: "Failed to register connection",
                        error: err instanceof Error ? err.message : err,
                    }),
                };
            }
        });
    }
    submitScore(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const lambdaEvent = (0, event_1.toLambdaEvent)(req);
            try {
                const authHeader = lambdaEvent.headers.Authorization || lambdaEvent.headers.authorization;
                if (!authHeader) {
                    return {
                        statusCode: 401,
                        body: JSON.stringify({ message: "Missing Authorization header" }),
                    };
                }
                const token = authHeader.replace("Bearer ", "");
                const decoded = jsonwebtoken_1.default.decode(token);
                const userId = decoded === null || decoded === void 0 ? void 0 : decoded.sub;
                const userName = decoded === null || decoded === void 0 ? void 0 : decoded.username;
                const body = JSON.parse(lambdaEvent.body || "{}");
                const { score } = body;
                if (!score || typeof score !== "number") {
                    return res.status(400).json({
                        code: "00",
                        status: "failure",
                        message: "Invalid or missing score",
                        data: null,
                    });
                }
                const command = new client_dynamodb_1.PutItemCommand({
                    TableName: "leaderboard",
                    Item: {
                        id: { S: (0, uuid_1.v4)() },
                        user_id: { S: userId },
                        user_name: { S: userName },
                        score: { N: score.toString() },
                        timestamp: { N: Math.floor(Date.now() / 1000).toString() },
                    },
                });
                const response = yield ddbClient.send(command);
                // Notify via WebSocket if score >= 1000
                if (score >= 1000) {
                    const connectionId = yield this.getConnectionId(userId);
                    if (connectionId) {
                        yield this.notifyIfHighScore(connectionId, score, userName);
                    }
                }
                return res.status(200).json({
                    code: "00",
                    message: "Score submitted successfully",
                    data: response,
                });
            }
            catch (err) {
                console.log({ err });
                return res
                    .status(500)
                    .json({ message: err instanceof Error ? err === null || err === void 0 ? void 0 : err.message : err });
            }
        });
    }
    getLeaderboard(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const command = new client_dynamodb_1.ScanCommand({
                    TableName: "leaderboard",
                    Limit: 50,
                });
                const data = yield ddbClient.send(command);
                const items = (data.Items || [])
                    .map((item) => {
                    var _a, _b, _c, _d, _e;
                    return ({
                        id: (_a = item.id.S) !== null && _a !== void 0 ? _a : "",
                        user_id: (_b = item.user_id.S) !== null && _b !== void 0 ? _b : "",
                        user_name: (_c = item.user_name.S) !== null && _c !== void 0 ? _c : "",
                        score: Number((_d = item.score.N) !== null && _d !== void 0 ? _d : 0),
                        timestamp: Number((_e = item.timestamp.N) !== null && _e !== void 0 ? _e : 0),
                    });
                })
                    .sort((a, b) => b.score - a.score);
                return res.status(200).json({ code: "00", message: "", data: items });
            }
            catch (err) {
                console.log({ err });
                return res
                    .status(500)
                    .json({ message: err instanceof Error ? err === null || err === void 0 ? void 0 : err.message : err });
            }
        });
    }
    getTopScore(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const command = new client_dynamodb_1.ScanCommand({
                    TableName: "leaderboard",
                });
                const data = yield ddbClient.send(command);
                const items = (data.Items || [])
                    .map((item) => {
                    var _a, _b, _c, _d, _e;
                    return ({
                        id: (_a = item.id.S) !== null && _a !== void 0 ? _a : "",
                        user_id: (_b = item.user_id.S) !== null && _b !== void 0 ? _b : "",
                        user_name: (_c = item.user_name.S) !== null && _c !== void 0 ? _c : "",
                        score: Number((_d = item.score.N) !== null && _d !== void 0 ? _d : 0),
                        timestamp: Number((_e = item.timestamp.N) !== null && _e !== void 0 ? _e : 0),
                    });
                })
                    .sort((a, b) => b.score - a.score);
                const topScore = items.length > 0 ? items[0] : null;
                return res.status(200).json({ code: "00", message: "", data: topScore });
            }
            catch (err) {
                console.log({ err });
                return res
                    .status(500)
                    .json({ message: err instanceof Error ? err === null || err === void 0 ? void 0 : err.message : err });
            }
        });
    }
    getConnectionId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const command = new client_dynamodb_1.GetItemCommand({
                TableName: "WebSocketConnections",
                Key: {
                    userId: { S: userId },
                },
            });
            try {
                const result = yield ddbClient.send(command);
                const connectionId = ((_b = (_a = result.Item) === null || _a === void 0 ? void 0 : _a.connectionId) === null || _b === void 0 ? void 0 : _b.S) || null;
                return connectionId;
            }
            catch (error) {
                console.error("❌ Failed to get connectionId:", error);
                throw error;
            }
        });
    }
}
exports.default = LeaderboardController;
