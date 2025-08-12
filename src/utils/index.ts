import crypto from "crypto";
import ServerResponseStatus from "../constant/serverResponseStatus";

/**
 * Build api response
 */
export const buildResponse = (response: { data: any }) => {
  return {
    ...response,
    status: ServerResponseStatus.RESPONSE_STATUS_SUCCESS,
    statusCode: ServerResponseStatus.OK,
    data: response.data,
  };
};

export function calculateSecretHash(
  username: string,
  clientId: string,
  clientSecret: string
) {
  const hmac = crypto.createHmac("sha256", clientSecret);
  hmac.update(username + clientId);
  return hmac.digest("base64");
}
