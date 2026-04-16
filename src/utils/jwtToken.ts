import jwt from "jsonwebtoken";
import apiError from "./apiError";
import { ReqUser } from "../types/user.types";


export const jwtSign = async (
    payload: object,
    expiry: string | number = "7d"
): Promise<string> => {
    return jwt.sign(payload, process.env.JWT_SECRET as string, {
        expiresIn: expiry
    } as jwt.SignOptions);
}


export const jwtVerify = async (
    token: string
): Promise<ReqUser | any> => {
    const verify = await jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
        if (err) {
            throw new apiError(
                401,
                process.env.NODE_ENV === "dev" ? err.message : "Unauthorized"
            );
        }
        return decoded
    });


    return verify;
};