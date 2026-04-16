import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import { registerValidator } from "../validators/user.validators";
import { LoginUser, RegisterUser } from "../services/user.services";
import apiResponse from "../utils/apiResponse";
import apiError from "../utils/apiError";

export const Register = asyncHandler(async (
    req: Request,
    res: Response
) => {
    const { fullname, username, email, password } = await registerValidator.parse({
        fullname: req.body?.fullname,
        username: req.body?.username,
        email: req.body?.email,
        password: req.body?.password
    });

    const file = req?.file;
    const result = await RegisterUser(fullname, username, email, password, file?.buffer);
    return apiResponse(res, 201, "Account created successfully", result);
});




export const Login = asyncHandler(async (
    req: Request,
    res: Response
) => {
    if (!req.body) {
        throw new apiError(400, "Provide valid body data");
    }
    const { email, password } = req.body;
    const result = await LoginUser(email, password);

    res.cookie("login_token", result.login_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "prod",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return apiResponse(res, 200, "Logged in successfully", result);
});

