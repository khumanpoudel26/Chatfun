import apiError from "../utils/apiError";
import asyncHandler from "../utils/asyncHandler";
import { NextFunction, Request, Response } from "express";
import { jwtVerify } from "../utils/jwtToken";
import { ReqUser } from "../types/user.types";


export const isAuthenticated = asyncHandler(async (
    req: Request, 
    res: Response, 
    next: NextFunction
) => {
    const token =
        req.headers?.authorization?.split(" ")[1] ||
        req.headers?.cookie?.split(";").find(c => c.trim().startsWith("login_token="))?.split("=")[1]

    if (!token) {
        throw new apiError(
            401,
            process.env.NODE_ENV === "dev" ? "No authentication token provided" : "Unauthorized"
        );
    }

    const decoded: ReqUser = await jwtVerify(token);

    req.user = decoded

    next();

});