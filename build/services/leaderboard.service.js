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
Object.defineProperty(exports, "__esModule", { value: true });
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const env_1 = require("../config/env");
const client_apigatewaymanagementapi_1 = require("@aws-sdk/client-apigatewaymanagementapi");
const utils_1 = require("../utils");
const uuid_1 = require("uuid");
class LeaderboardService {
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
                throw error;
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
                yield this.ddbClient.send(command);
            }
            catch (error) {
                throw error;
            }
        });
        this.ddbClient = new client_dynamodb_1.DynamoDBClient({
            region: env_1.AWS_REGION,
            credentials: {
                accessKeyId: env_1.AWS_ACCESS_KEY_ID,
                secretAccessKey: env_1.AWS_SECRET_ACCESS_KEY,
            },
        });
    }
    registerConnection(userId, connectionId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.storeConnectionId(userId, connectionId);
                console.log({ storedConn: response });
                return (0, utils_1.buildResponse)({
                    data: response,
                });
            }
            catch (error) {
                throw error;
            }
        });
    }
    submitScore(userName, userId, score) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
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
                const response = yield this.ddbClient.send(command);
                return (0, utils_1.buildResponse)({
                    data: response,
                });
            }
            catch (error) {
                throw error;
            }
        });
    }
    getLeaderboard() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const command = new client_dynamodb_1.ScanCommand({
                    TableName: "leaderboard",
                    Limit: 50,
                });
                const data = yield this.ddbClient.send(command);
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
                return (0, utils_1.buildResponse)({
                    data: items,
                });
            }
            catch (error) {
                throw error;
            }
        });
    }
    getTopScore() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const command = new client_dynamodb_1.ScanCommand({
                    TableName: "leaderboard",
                });
                const data = yield this.ddbClient.send(command);
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
                return (0, utils_1.buildResponse)({
                    data: topScore,
                });
            }
            catch (error) {
                throw error;
            }
        });
    }
    getWebconnections() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const command = new client_dynamodb_1.ScanCommand({
                    TableName: "WebSocketConnections",
                });
                const data = yield this.ddbClient.send(command);
                return (0, utils_1.buildResponse)({
                    data: data === null || data === void 0 ? void 0 : data.Items,
                });
            }
            catch (error) {
                throw error;
            }
        });
    }
    deleteConnectionId(connectionId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Optional: You can reverse lookup by connectionId if needed
                // For simplicity, assume connectionId is also the key
                const scanCommand = new client_dynamodb_1.DeleteItemCommand({
                    TableName: "WebSocketConnections",
                    Key: {
                        userId: { S: connectionId }, // update if your PK is not connectionId
                    },
                });
                const data = yield this.ddbClient.send(scanCommand);
                return (0, utils_1.buildResponse)({
                    data,
                });
            }
            catch (error) {
                throw error;
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
                const result = yield this.ddbClient.send(command);
                const connectionId = ((_b = (_a = result.Item) === null || _a === void 0 ? void 0 : _a.connectionId) === null || _b === void 0 ? void 0 : _b.S) || null;
                return connectionId;
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.default = new LeaderboardService();
