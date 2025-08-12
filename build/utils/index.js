"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildResponse = void 0;
exports.calculateSecretHash = calculateSecretHash;
const crypto_1 = __importDefault(require("crypto"));
const serverResponseStatus_1 = __importDefault(require("../constant/serverResponseStatus"));
/**
 * Build api response
 */
const buildResponse = (response) => {
    return Object.assign(Object.assign({}, response), { status: serverResponseStatus_1.default.RESPONSE_STATUS_SUCCESS, statusCode: serverResponseStatus_1.default.OK, data: response.data });
};
exports.buildResponse = buildResponse;
function calculateSecretHash(username, clientId, clientSecret) {
    const hmac = crypto_1.default.createHmac("sha256", clientSecret);
    hmac.update(username + clientId);
    return hmac.digest("base64");
}
