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
const event_1 = require("../types/event");
const awscognito_service_1 = __importDefault(require("../services/awscognito.service"));
class AuthController {
    signup(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                const { body = {} } = req;
                const attributes = body.attributes || {};
                const formatAttributes = Object.keys(attributes).map((curr) => {
                    return {
                        Name: curr,
                        Value: attributes[curr],
                    };
                });
                const response = yield awscognito_service_1.default.cognitoSignup(body.username, body.password, formatAttributes);
                return res.status(200).json({
                    code: "00",
                    status: "success",
                    message: "login successful",
                    data: {
                        UserConfirmed: (_a = response.data) === null || _a === void 0 ? void 0 : _a.UserConfirmed,
                        Usersub: (_b = response.data) === null || _b === void 0 ? void 0 : _b.UserSub,
                        Session: (_c = response === null || response === void 0 ? void 0 : response.data) === null || _c === void 0 ? void 0 : _c.Session,
                    },
                });
            }
            catch (err) {
                console.log("ERROR", err);
                if (err instanceof Error) {
                    return res
                        .status(400)
                        .json({ code: "00", status: "failed", message: err === null || err === void 0 ? void 0 : err.message });
                }
                next(err);
            }
        });
    }
    login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const event = (0, event_1.toLambdaEvent)(req);
            console.log({ event });
            try {
                const body = JSON.parse(event.body || "{}");
                const { username, password } = body;
                if (!username || !password) {
                    return res
                        .status(200)
                        .json({ message: "Missing required login fields" });
                }
                const response = yield awscognito_service_1.default.cognitoLogin(username, password);
                return res.status(200).json({
                    code: "00",
                    status: "success",
                    message: "login successful",
                    data: (_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.AuthenticationResult,
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
    /**
     * Confirm a Cognito user signup using the confirmation code sent to email/phone.
     *
     * @param username - The Cognito username (usually email)
     * @param code - The confirmation code received via email/SMS
     * @param clientId - The app client ID (must match the one used for signup)
     */
    confirmUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = (0, event_1.toLambdaEvent)(req);
            try {
                const body = JSON.parse(event.body || "{}");
                const { username, code } = body;
                yield awscognito_service_1.default.confirmUser(username, code);
                return res.status(200).json({
                    code: "00",
                    status: "success",
                    message: "User confirmed successfully",
                });
            }
            catch (err) {
                if (err instanceof Error) {
                    return res
                        .status(400)
                        .json({ code: "00", status: "failed", message: err === null || err === void 0 ? void 0 : err.message });
                }
                else {
                    next(err);
                }
            }
        });
    }
    resendConfirmationCode(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const event = (0, event_1.toLambdaEvent)(req);
            try {
                const body = JSON.parse(event.body || "{}");
                const { username } = body;
                const response = yield awscognito_service_1.default.resendConfirmationCode(username);
                return res.status(200).json({
                    code: "00",
                    success: "success",
                    message: "Confirmation code resent",
                    data: {
                        codeDeliveryDetails: (_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.CodeDeliveryDetails,
                    },
                });
            }
            catch (err) {
                if (err instanceof Error) {
                    return res
                        .status(400)
                        .json({ code: "00", status: "failed", message: err === null || err === void 0 ? void 0 : err.message });
                }
                else {
                    next(err);
                }
            }
        });
    }
}
exports.default = AuthController;
