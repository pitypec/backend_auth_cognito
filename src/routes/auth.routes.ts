import { Router } from "express";
import { API_BASE_URL } from "../config/env";
import AuthController from "../controller/auth.controller";
const BASE_URL = `${API_BASE_URL}/auth`;

class AuthRouter {
  router: Router;
  authController;
  constructor(router: Router) {
    this.router = router;
    this.authController = new AuthController();
    this.loadRoutes();
  }

  private loadRoutes() {
    console.log({ first2: BASE_URL });
    this.router.post(`${BASE_URL}/signup`, this.authController.signup);
    this.router.post(`${BASE_URL}/login`, this.authController.login);
    this.router.post(
      `${BASE_URL}/confirm-signup`,
      this.authController.confirmUser
    );
    this.router.post(
      `${BASE_URL}/resend-code`,
      this.authController.resendConfirmationCode
    );
  }
}

export default AuthRouter;
