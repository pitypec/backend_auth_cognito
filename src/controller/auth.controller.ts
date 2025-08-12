import {
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  SignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { NextFunction, Request, Response } from "express";
import { toLambdaEvent } from "../types/event";
import { AWS_REGION, APP_SECRET_KEY, APP_CLIENT_ID } from "../config/env";
import { calculateSecretHash } from "../utils";
import CognitoService from "../services/awscognito.service";
// import crypto from "crypto";

const cognitoClient: CognitoIdentityProviderClient =
  new CognitoIdentityProviderClient({
    region: AWS_REGION,
  });
class AuthController {
  private cognitoClient: CognitoIdentityProviderClient;

  constructor() {
    this.cognitoClient = new CognitoIdentityProviderClient({
      region: AWS_REGION,
    });
  }
  async signup(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { body = {} } = req;
      const attributes = body.attributes || {};
      const formatAttributes = Object.keys(attributes).map((curr) => {
        return {
          Name: curr,
          Value: attributes[curr],
        };
      });
      const response = await CognitoService.cognitoSignup(
        body.username,
        body.password,
        formatAttributes
      );
      return res.status(200).json({
        code: "00",
        status: "success",
        message: "login successful",
        data: {
          UserConfirmed: response.data?.UserConfirmed,
          Usersub: response.data?.UserSub,
          Session: response?.data?.Session,
        },
      });
    } catch (err) {
      console.log("ERROR", err);
      if (err instanceof Error) {
        return res
          .status(400)
          .json({ code: "00", status: "failed", message: err?.message });
      }
      next(err);
    }
  }

  public async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    const event: APIGatewayProxyEvent = toLambdaEvent(req);
    console.log({ event });

    try {
      const body = JSON.parse(event.body || "{}");
      const { username, password } = body;

      if (!username || !password) {
        return res
          .status(200)
          .json({ message: "Missing required login fields" });
      }
      const response = await CognitoService.cognitoLogin(username, password);
      return res.status(200).json({
        code: "00",
        status: "success",
        message: "login successful",
        data: response?.data?.AuthenticationResult,
      });
    } catch (err) {
      console.error("Login error", err);
      if (err instanceof Error) {
        return res
          .status(400)
          .json({ code: "00", status: "failed", message: err?.message });
      }
      next(err);
    }
  }

  /**
   * Confirm a Cognito user signup using the confirmation code sent to email/phone.
   *
   * @param username - The Cognito username (usually email)
   * @param code - The confirmation code received via email/SMS
   * @param clientId - The app client ID (must match the one used for signup)
   */
  async confirmUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    const event: APIGatewayProxyEvent = toLambdaEvent(req);

    try {
      const body = JSON.parse(event.body || "{}");
      const { username, code } = body;
      await CognitoService.confirmUser(username, code);
      return res.status(200).json({
        code: "00",
        status: "success",
        message: "User confirmed successfully",
      });
    } catch (err) {
      if (err instanceof Error) {
        return res
          .status(400)
          .json({ code: "00", status: "failed", message: err?.message });
      } else {
        next(err);
      }
    }
  }

  async resendConfirmationCode(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    const event: APIGatewayProxyEvent = toLambdaEvent(req);

    try {
      const body = JSON.parse(event.body || "{}");
      const { username } = body;

      const response = await CognitoService.resendConfirmationCode(username);

      return res.status(200).json({
        code: "00",
        success: "success",
        message: "Confirmation code resent",
        data: {
          codeDeliveryDetails: response?.data?.CodeDeliveryDetails,
        },
      });
    } catch (err) {
      if (err instanceof Error) {
        return res
          .status(400)
          .json({ code: "00", status: "failed", message: err?.message });
      } else {
        next(err);
      }
    }
  }
}

export default AuthController;
