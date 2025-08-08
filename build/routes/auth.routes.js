"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("../config/env");
const auth_controller_1 = __importDefault(require("../controller/auth.controller"));
const BASE_URL = `${env_1.API_BASE_URL}/auth`;
class AuthRouter {
    constructor(router) {
        this.router = router;
        this.authController = new auth_controller_1.default();
        this.loadRoutes();
    }
    loadRoutes() {
        console.log({ first2: BASE_URL });
        this.router.post(`${BASE_URL}/signup`, this.authController.signup);
        this.router.post(`${BASE_URL}/login`, this.authController.login);
        this.router.post(`${BASE_URL}/confirm-signup`, this.authController.confirmUser);
        this.router.post(`${BASE_URL}/resend-code`, this.authController.resendConfirmationCode);
    }
}
exports.default = AuthRouter;
