import {
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  ResendConfirmationCodeCommand,
  SignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { NextFunction, Request, Response } from "express";
import { toLambdaEvent } from "../types/event";
import { AWS_REGION, APP_SECRET_KEY, APP_CLIENT_ID } from "../config/env";
import { calculateSecretHash } from "../utils";
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
      console.log({ body });
      const attributes = body.attributes || {};
      const formatAttributes = Object.keys(attributes).map((curr) => {
        return {
          Name: curr,
          Value: attributes[curr],
        };
      });

      const newUser = {
        ClientId: APP_CLIENT_ID,
        Username: body.username,
        SecretHash: calculateSecretHash(
          body.username,
          APP_CLIENT_ID,
          APP_SECRET_KEY
        ),
        Password: body.password,
        UserAttributes: formatAttributes,
      };
      console.log(newUser, "newUser", "signUp");
      const command = new SignUpCommand(newUser);
      const response = await cognitoClient.send(command);
      return res.status(200).json({
        code: "00",
        status: "success",
        message: "login successful",
        data: {
          UserConfirmed: response.UserConfirmed,
          Usersub: response.UserSub,
          Session: response?.Session,
        },
      });
    } catch (e) {
      console.log("ERROR", e);
      next(e);
    }
  }

  public async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    console.log({ req });
    const event: APIGatewayProxyEvent = toLambdaEvent(req);
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

      const command = new InitiateAuthCommand({
        AuthFlow: "USER_PASSWORD_AUTH",
        ClientId: APP_CLIENT_ID,
        AuthParameters: {
          USERNAME: username,
          PASSWORD: password,
          SECRET_HASH: calculateSecretHash(
            username,
            APP_CLIENT_ID,
            APP_SECRET_KEY
          ),
        },
      });

      const response = await cognitoClient.send(command);

      return res.status(200).json({
        code: "00",
        status: "success",
        message: "login successful",
        data: response.AuthenticationResult,
      });
    } catch (err) {
      console.error("Login error", err);
      if (err instanceof Error) {
        return res.status(400).json({ message: err?.message });
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
      console.log({ body });
      const { username, code } = body;
      const command = new ConfirmSignUpCommand({
        ClientId: APP_CLIENT_ID,
        Username: username,
        ConfirmationCode: code,
        SecretHash: calculateSecretHash(
          username,
          APP_CLIENT_ID,
          APP_SECRET_KEY
        ),
      });

      await cognitoClient.send(command);

      return res
        .status(200)
        .json({
          code: "00",
          status: "success",
          message: "User confirmed successfully",
        });
    } catch (err) {
      console.error("Cognito confirmation error:", err);
      next(err);
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

      const command = new ResendConfirmationCodeCommand({
        ClientId: APP_CLIENT_ID,
        Username: username,
        SecretHash: calculateSecretHash(
          username,
          APP_CLIENT_ID,
          APP_SECRET_KEY
        ),
      });
      const response = await cognitoClient.send(command);

      return res.status(200).json({
        code: "00",
        success: "success",
        message: "Confirmation code resent",
        codeDeliveryDetails: response.CodeDeliveryDetails,
      });
    } catch (err) {
      console.error("Error resending confirmation code:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : err,
      };
    }
  }
}

export default AuthController;
