import {
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  ResendConfirmationCodeCommand,
  SignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { APP_CLIENT_ID, APP_SECRET_KEY, AWS_REGION } from "../config/env";
import { buildResponse, calculateSecretHash } from "../utils";

const cognitoClient: CognitoIdentityProviderClient =
  new CognitoIdentityProviderClient({
    region: AWS_REGION,
  });
class CognitoService {
  private cognitoClient: CognitoIdentityProviderClient;

  constructor() {
    this.cognitoClient = new CognitoIdentityProviderClient({
      region: AWS_REGION,
    });
  }

  async cognitoSignup(
    username: string,
    password: string,
    formatAttributes: {
      Name: string;
      Value: string;
    }[]
  ) {
    try {
      const newUser = {
        ClientId: APP_CLIENT_ID,
        Username: username,
        SecretHash: calculateSecretHash(
          username,
          APP_CLIENT_ID,
          APP_SECRET_KEY
        ),
        Password: password,
        UserAttributes: formatAttributes,
      };
      console.log(newUser, "newUser", "signUp");
      const command = new SignUpCommand(newUser);
      const data = await cognitoClient.send(command);
      return buildResponse({
        data,
      });
    } catch (error) {
      throw error;
    }
  }

  async cognitoLogin(username: string, password: string) {
    try {
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

      const data = await cognitoClient.send(command);
      return buildResponse({
        data,
      });
    } catch (error) {
      throw error;
    }
  }

  async confirmUser(username: string, code: string) {
    try {
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

      const data = await cognitoClient.send(command);
      return buildResponse({
        data,
      });
    } catch (error: any) {
      throw error;
    }
  }

  async resendConfirmationCode(username: string) {
    try {
      const command = new ResendConfirmationCodeCommand({
        ClientId: APP_CLIENT_ID,
        Username: username,
        SecretHash: calculateSecretHash(
          username,
          APP_CLIENT_ID,
          APP_SECRET_KEY
        ),
      });
      const data = await cognitoClient.send(command);
      return buildResponse({
        data,
      });
    } catch (error) {
      throw error;
    }
  }
}

export default new CognitoService();
