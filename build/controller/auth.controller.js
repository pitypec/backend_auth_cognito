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
const client_cognito_identity_provider_1 = require("@aws-sdk/client-cognito-identity-provider");
const event_1 = require("../types/event");
const env_1 = require("../config/env");
const utils_1 = require("../utils");
// import crypto from "crypto";
const cognitoClient = new client_cognito_identity_provider_1.CognitoIdentityProviderClient({
    region: env_1.AWS_REGION,
});
class AuthController {
    constructor() {
        this.cognitoClient = new client_cognito_identity_provider_1.CognitoIdentityProviderClient({
            region: env_1.AWS_REGION,
        });
    }
    signup(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { body = {} } = req;
                console.log({ body });
                const attributes = body.attributes || {};
                const formatAttributes = Object.keys(attributes).map((curr) => {
                    return {
                        Name: curr,
                        Value: attributes[curr],
                    };
                });
                const newUser = {
                    ClientId: env_1.APP_CLIENT_ID,
                    Username: body.username,
                    SecretHash: (0, utils_1.calculateSecretHash)(body.username, env_1.APP_CLIENT_ID, env_1.APP_SECRET_KEY),
                    Password: body.password,
                    UserAttributes: formatAttributes,
                };
                console.log(newUser, "newUser", "signUp");
                const command = new client_cognito_identity_provider_1.SignUpCommand(newUser);
                const response = yield cognitoClient.send(command);
                return res.status(200).json({
                    code: "00",
                    status: "success",
                    message: "login successful",
                    data: {
                        UserConfirmed: response.UserConfirmed,
                        Usersub: response.UserSub,
                        Session: response === null || response === void 0 ? void 0 : response.Session,
                    },
                });
            }
            catch (e) {
                console.log("ERROR", e);
                next(e);
            }
        });
    }
    login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log({ req });
            const event = (0, event_1.toLambdaEvent)(req);
            console.log({ event });
            try {
                const body = JSON.parse(event.body || "{}");
                console.log({ body });
                const { username, password } = body;
                if (!username || !password) {
                    return res
                        .status(200)
                        .json({ message: "Missing required login fields" });
                }
                console.log({ body });
                const command = new client_cognito_identity_provider_1.InitiateAuthCommand({
                    AuthFlow: "USER_PASSWORD_AUTH",
                    ClientId: env_1.APP_CLIENT_ID,
                    AuthParameters: {
                        USERNAME: username,
                        PASSWORD: password,
                        SECRET_HASH: (0, utils_1.calculateSecretHash)(username, env_1.APP_CLIENT_ID, env_1.APP_SECRET_KEY),
                    },
                });
                const response = yield cognitoClient.send(command);
                return res.status(200).json({
                    code: "00",
                    status: "success",
                    message: "login successful",
                    data: response.AuthenticationResult,
                });
            }
            catch (err) {
                console.error("Login error", err);
                if (err instanceof Error) {
                    return res.status(400).json({ message: err === null || err === void 0 ? void 0 : err.message });
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
                console.log({ body });
                const { username, code } = body;
                const command = new client_cognito_identity_provider_1.ConfirmSignUpCommand({
                    ClientId: env_1.APP_CLIENT_ID,
                    Username: username,
                    ConfirmationCode: code,
                    SecretHash: (0, utils_1.calculateSecretHash)(username, env_1.APP_CLIENT_ID, env_1.APP_SECRET_KEY),
                });
                yield cognitoClient.send(command);
                return res
                    .status(200)
                    .json({
                    code: "00",
                    status: "success",
                    message: "User confirmed successfully",
                });
            }
            catch (err) {
                console.error("Cognito confirmation error:", err);
                next(err);
            }
        });
    }
    resendConfirmationCode(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = (0, event_1.toLambdaEvent)(req);
            try {
                const body = JSON.parse(event.body || "{}");
                const { username } = body;
                const command = new client_cognito_identity_provider_1.ResendConfirmationCodeCommand({
                    ClientId: env_1.APP_CLIENT_ID,
                    Username: username,
                    SecretHash: (0, utils_1.calculateSecretHash)(username, env_1.APP_CLIENT_ID, env_1.APP_SECRET_KEY),
                });
                const response = yield cognitoClient.send(command);
                return res.status(200).json({
                    code: "00",
                    success: "success",
                    message: "Confirmation code resent",
                    codeDeliveryDetails: response.CodeDeliveryDetails,
                });
            }
            catch (err) {
                console.error("Error resending confirmation code:", err);
                return {
                    success: false,
                    error: err instanceof Error ? err.message : err,
                };
            }
        });
    }
}
exports.default = AuthController;
