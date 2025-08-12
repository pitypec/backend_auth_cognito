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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const event_1 = require("../types/event");
const leaderboard_service_1 = __importDefault(require("../services/leaderboard.service"));
class LeaderboardController {
    registerConnection(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = (0, event_1.toLambdaEvent)(req);
            console.log({ event });
            try {
                const authHeader = event.headers.Authorization || event.headers.authorization;
                if (!authHeader) {
                    return res.status(400).json({
                        code: "00",
                        status: "failure",
                        statusCode: 400,
                        message: "Missing Authorization header",
                    });
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
                    console.log({ parsedBody });
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
                const response = yield leaderboard_service_1.default.registerConnection(userId, connectionId);
                return res.status(200).json({
                    code: "00",
                    message: "Connection registered successfully",
                    data: response === null || response === void 0 ? void 0 : response.data,
                });
            }
            catch (err) {
                if (err instanceof Error) {
                    return res
                        .status(400)
                        .json({ code: "00", status: "failed", message: err === null || err === void 0 ? void 0 : err.message });
                }
                next(err);
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
                const response = yield leaderboard_service_1.default.submitScore(userName, userId, score);
                return res.status(200).json({
                    code: "00",
                    message: "Score submitted successfully",
                    data: response === null || response === void 0 ? void 0 : response.data,
                });
            }
            catch (err) {
                if (err instanceof Error) {
                    return res
                        .status(400)
                        .json({ code: "00", status: "failed", message: err === null || err === void 0 ? void 0 : err.message });
                }
                next(err);
            }
        });
    }
    getLeaderboard(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield leaderboard_service_1.default.getLeaderboard();
                return res
                    .status(200)
                    .json({ code: "00", message: "", data: response === null || response === void 0 ? void 0 : response.data });
            }
            catch (err) {
                console.log({ err });
                if (err instanceof Error) {
                    return res
                        .status(400)
                        .json({ code: "00", status: "failed", message: err === null || err === void 0 ? void 0 : err.message });
                }
                next(err);
            }
        });
    }
    getWebConnections(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield leaderboard_service_1.default.getWebconnections();
                return res
                    .status(200)
                    .json({ code: "00", message: "", data: response === null || response === void 0 ? void 0 : response.data });
            }
            catch (err) {
                console.log({ err });
                if (err instanceof Error) {
                    return res
                        .status(400)
                        .json({ code: "00", status: "failed", message: err === null || err === void 0 ? void 0 : err.message });
                }
                next(err);
            }
        });
    }
    getTopScore(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield leaderboard_service_1.default.getTopScore();
                return res
                    .status(200)
                    .json({ code: "00", message: "", data: response.data });
            }
            catch (err) {
                if (err instanceof Error) {
                    return res
                        .status(400)
                        .json({ code: "00", status: "failed", message: err === null || err === void 0 ? void 0 : err.message });
                }
                next(err);
            }
        });
    }
    deleteConnectionId(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = (0, event_1.toLambdaEvent)(req);
            const connectionId = event.requestContext.connectionId;
            try {
                const response = yield leaderboard_service_1.default.deleteConnectionId(connectionId);
                return res.status(200).json({
                    code: "00",
                    success: "success",
                    message: "Confirmation code resent",
                    data: response,
                });
            }
            catch (err) {
                if (err instanceof Error) {
                    return res
                        .status(400)
                        .json({ code: "00", status: "failed", message: err === null || err === void 0 ? void 0 : err.message });
                }
                next(err);
            }
        });
    }
}
exports.default = LeaderboardController;
