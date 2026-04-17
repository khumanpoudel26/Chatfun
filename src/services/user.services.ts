import { prisma } from "../configs/client";
import { uploadCloud } from "../utils/uploadCloud";
import { CompareHash, GenerateHash } from "../utils/hash";
import apiError from "../utils/apiError";
import { jwtSign } from "../utils/jwtToken";
import redis from "../configs/redis";
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);


export const RegisterUser = async (
    fullname: string,
    username: string,
    email: string,
    password: string,
    file?: Buffer
) => {

    const exists = await prisma.user.findFirst({
        where: {
            OR: [
                { email },
                { username }
            ]
        }
    });

    if (exists) {
        if (exists.email === email) {
            throw new apiError(400, "Email already exists");
        }

        if (exists.username === username) {
            throw new apiError(400, "Username already exists");
        }
    }

    const hash = await GenerateHash(password);

    let url: string | null = null;

    if (file) {
        url = await uploadCloud(file, 'chatfun/profiles');
    }

    const insert = await prisma.user.create({
        data: {
            fullname,
            username,
            email,
            password: hash,
            profile_picture: url
        },
        omit: {
            password: true

        }
    })
    return insert;
};


export const LoginUser = async (
    email: string,
    password: string
) => {
    if (!email || !password) {
        throw new apiError(400, "Email or password should not be empty");
    }

    const user = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if (!user) {
        throw new apiError(400, "Invalid email or password");
    }

    const validPassword = await CompareHash(password, user.password);

    if (!validPassword) {
        throw new apiError(400, "Invalid email or password")
    }

    const loginToken = await jwtSign({
        id: user.id,
        email: user.email,
        fullname: user.fullname,
        username: user.username,
        email_verified: user.email_verified
    }, "12d");

    return {
        fullname: user.fullname,
        username: user.username,
        email: user.email,
        profile_picture: user.profile_picture,
        email_verified: user.email_verified,
        login_token: loginToken
    }

}


export const GetMe = async (user_id: number) => {
    const user = await prisma.user.findUnique({
        where: {
            id: user_id
        },
        select: {
            id: true,
            fullname: true,
            username: true,
            email: true,
            profile_picture: true,
            bio: true,
            email_verified: true,
            active_status: true,
            created_at: true,
            updated_at: true
        }
    });

    return user;
}




export const SearchUser = async (
    username: string,
    req_user: string
) => {
    if (!username) {
        throw new apiError(400, "Provide username to search");
    }

    const cache = await redis.get(`user:${username}`); // Check cache first
    if (cache) {
        return JSON.parse(cache);
    }

    const user = await prisma.user.findFirst({
        where: {
            username
        },
        select: {
            id: true,
            fullname: true,
            username: true,
            profile_picture: true,
            bio: true,
            active_status: true
        }
    });

    if (!user) {
        throw new apiError(404, "User with this username not found");
    }

    await redis.setex(`user:${username}`, 1500, JSON.stringify(user)); // Cache for 25 minutes

    return user;
}


export const SendVerification = async (
    email: string
) => {

    if (!email) {
        throw new apiError(400, "Provide email to send verification code");
    }


    const user = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if (!user) {
        throw new apiError(404, "User with this email not found");
    }

    if (user.email_verified) {
        throw new apiError(400, "Email is already verified");
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6 digit code
    await redis.setex(`verify:${email}`, 1800, code); // Store code in Redis for 30 minutes

    await resend.emails.send({
        from: process.env.EMAIL as string,
        to: user.email,
        subject: "Email Verification for Chatfun",
        html: `<p>Your verification code is: <strong>${code}</strong></p><p>This code will expire in 30 minutes.</p>`
    });

    return { message: "Verification code sent to email" };

}



export const VerifyEmailCode = async (
    email: string,
    code: string
) => {

    if (!email || !code) {
        throw new apiError(400, "Email or code should not be empty");
    }

    const storedCode = await redis.get(`verify:${email}`);

    if (!storedCode || code !== storedCode) {
        throw new apiError(400, "Verification code expired or invalid");
    }

    await redis.del(`verify:${email}`); // Delete code from Redis after successful verification
    await prisma.user.update({
        where: {
            email
        },
        data: {
            email_verified: true
        }
    });

    return { message: "Email verified successfully" };
}





export const SendPasswordReset = async (
    email: string
) => {

    if (!email) {
        throw new apiError(400, "Provide email to send password reset code");
    }

    const user = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if (!user) {
        throw new apiError(404, "User with this email not found");
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6 digit code
    await redis.setex(`resetPass:${email}`, 1800, code); // Store code in Redis for 30 minutes
    await resend.emails.send({
        from: process.env.EMAIL as string,
        to: user.email,
        subject: "Password Reset for Chatfun",
        html: `<p>Your password reset code is: <strong>${code}</strong></p><p>This code will expire in 30 minutes.</p>`
    });

    return { message: "Password reset code has been sent to email" };
}




export const ResetNewPassword = async (
    email: string,
    code: string,
    new_password: string
) => {

    const storedCode = await redis.get(`resetPass:${email}`);
    if (!storedCode || code !== storedCode) {
        throw new apiError(400, "Password reset code expired or invalid");
    }

    const hash = await GenerateHash(new_password);
    await prisma.user.update({
        where: {
            email
        },
        data: {
            password: hash
        }
    });
    await redis.del(`resetPass:${email}`) // Delete code from Redis after successful password reset


    return { message: "Password has been reset successfully" }


}