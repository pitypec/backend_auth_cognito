import dotenv from "dotenv";

dotenv.config();

declare var process: {
  env: any;
};

export const {
  PORT,
  HOST_NAME,
  NODE_ENV,
  API_BASE_URL,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_BUCKET,
  AWS_REGION,
  APP_SECRET_KEY,
  APP_CLIENT_ID,
  WEBSOCKET_API_ENDPOINT,
}: any = process.env;
