import { prisma } from "../configs/client";
import { uploadCloud } from "../utils/uploadCloud";
import { CompareHash, GenerateHash } from "../utils/hash";
import apiError from "../utils/apiError";
import { jwtSign } from "../utils/jwtToken";

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