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
const env_1 = require("../config/env");
const utils_1 = require("../utils");
class CognitoService {
    constructor() {
        this.cognitoClient = new client_cognito_identity_provider_1.CognitoIdentityProviderClient({
            region: env_1.AWS_REGION,
        });
    }
    cognitoSignup(username, password, formatAttributes) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const newUser = {
                    ClientId: env_1.APP_CLIENT_ID,
                    Username: username,
                    SecretHash: (0, utils_1.calculateSecretHash)(username, env_1.APP_CLIENT_ID, env_1.APP_SECRET_KEY),
                    Password: password,
                    UserAttributes: formatAttributes,
                };
                const command = new client_cognito_identity_provider_1.SignUpCommand(newUser);
                const data = yield this.cognitoClient.send(command);
                return (0, utils_1.buildResponse)({
                    data,
                });
            }
            catch (error) {
                throw error;
            }
        });
    }
    cognitoLogin(username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const command = new client_cognito_identity_provider_1.InitiateAuthCommand({
                    AuthFlow: "USER_PASSWORD_AUTH",
                    ClientId: env_1.APP_CLIENT_ID,
                    AuthParameters: {
                        USERNAME: username,
                        PASSWORD: password,
                        SECRET_HASH: (0, utils_1.calculateSecretHash)(username, env_1.APP_CLIENT_ID, env_1.APP_SECRET_KEY),
                    },
                });
                const data = yield this.cognitoClient.send(command);
                return (0, utils_1.buildResponse)({
                    data,
                });
            }
            catch (error) {
                throw error;
            }
        });
    }
    confirmUser(username, code) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const command = new client_cognito_identity_provider_1.ConfirmSignUpCommand({
                    ClientId: env_1.APP_CLIENT_ID,
                    Username: username,
                    ConfirmationCode: code,
                    SecretHash: (0, utils_1.calculateSecretHash)(username, env_1.APP_CLIENT_ID, env_1.APP_SECRET_KEY),
                });
                const data = yield this.cognitoClient.send(command);
                return (0, utils_1.buildResponse)({
                    data,
                });
            }
            catch (error) {
                throw error;
            }
        });
    }
    resendConfirmationCode(username) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const command = new client_cognito_identity_provider_1.ResendConfirmationCodeCommand({
                    ClientId: env_1.APP_CLIENT_ID,
                    Username: username,
                    SecretHash: (0, utils_1.calculateSecretHash)(username, env_1.APP_CLIENT_ID, env_1.APP_SECRET_KEY),
                });
                const data = yield this.cognitoClient.send(command);
                return (0, utils_1.buildResponse)({
                    data,
                });
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.default = new CognitoService();
