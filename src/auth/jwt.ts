import jwt from "jsonwebtoken"
import { TokenPayload } from "./token";

const secretKey = process.env.JWT_SECRET as string;

export const generateToken = (payload: TokenPayload) => {
  
  if (!secretKey) {
    throw new Error(
      "JWT_SECRET is not defined in the environment variables."
    );
  }
  const token = jwt.sign(payload, secretKey, { expiresIn: "1h" });
  return token;
};
