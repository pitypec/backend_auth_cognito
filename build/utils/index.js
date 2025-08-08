"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateSecretHash = calculateSecretHash;
const crypto_1 = __importDefault(require("crypto"));
function calculateSecretHash(username, clientId, clientSecret) {
    const hmac = crypto_1.default.createHmac("sha256", clientSecret);
    hmac.update(username + clientId);
    return hmac.digest("base64");
}
