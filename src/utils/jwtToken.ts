import jwt from "jsonwebtoken";


export const jwtSign = async (
    payload: object,
    expiry: string | number = "7d"
): Promise<string> =>{
    return jwt.sign(payload, process.env.JWT_SECRET as string, {
        expiresIn: expiry
    } as jwt.SignOptions);
}