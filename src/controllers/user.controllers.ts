import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import { changePasswordValidator, registerValidator, resetPasswordValidator } from "../validators/user.validators";
import { GetMe, LoginUser, RegisterUser, ResetNewPassword, SearchUser, SendPasswordReset, SendVerification, UpdatePassword, UpdateUserInfo, VerifyEmailCode } from "../services/user.services";
import apiResponse from "../utils/apiResponse";
import apiError from "../utils/apiError";
import { ReqUser } from "../types/user.types";


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
    const { email, password } = req.body;
    const result = await LoginUser(email, password);

    res.cookie("login_token", result.login_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "prod",
        //sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return apiResponse(res, 200, "Logged in successfully", result);
});



export const Logout = asyncHandler(async (
    req: Request,
    res: Response
) => {
    res.clearCookie("login_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "prod",
        sameSite: "strict"
    });
    return apiResponse(res, 200, "Logged out successfully");
});


export const Me = asyncHandler(async (
    req: Request,
    res: Response
) => {
    const user = req.user as ReqUser
    const result = await GetMe(user.id);
    return apiResponse(res, 200, "User data fetched successfully", result);
});



export const FindUser = asyncHandler(async (
    req: Request,
    res: Response
) => {
    const username = req.query.username as string;
    const result = await SearchUser(username, (req.user as ReqUser).username);

    return apiResponse(res, 200, "User info fetched successfully", result);
}
);



export const SendEmailVerification = asyncHandler(async (
    req: Request,
    res: Response
) => {
    const email = req.body.email as string;
    const result = await SendVerification(email);

    return apiResponse(res, 200, result.message);
});




export const VerifyEmail = asyncHandler(async (
    req: Request,
    res: Response
) => {
    const { email, code } = req.body;
    const result = await VerifyEmailCode(email, String(code));

    return apiResponse(res, 200, result.message);
});



export const ForgetPassword = asyncHandler(async (
    req: Request,
    res: Response
) => {
    const email = req.body.email as string;
    const result = await SendPasswordReset(email);

    return apiResponse(res, 200, result.message);
}
);



export const ResetPassword = asyncHandler(async (
    req: Request,
    res: Response
) => {

    const { email, code, new_password } = resetPasswordValidator.parse(req.body);
    const result = await ResetNewPassword(email, String(code), new_password);
    return apiResponse(res, 200, result.message);
}
);



export const UpdateProfile = asyncHandler(async (
    req: Request,
    res: Response
) => {
    const { fullname, username, bio } = req.body
    const file = req?.file?.buffer

    const result = await UpdateUserInfo((req.user as ReqUser).id, fullname, username, file, bio)

    res.cookie("login_token", result.login_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "prod",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    return apiResponse(res, 200, "Profile updated successfully", result)
}
);



export const ChangePassword = asyncHandler(async (
    req: Request,
    res: Response
) => {
    const { password, new_password } = changePasswordValidator.parse(req.body);
    const result = await UpdatePassword(password, new_password, (req.user as ReqUser).id);
    return apiResponse(res, 200, result.message);
}
);
