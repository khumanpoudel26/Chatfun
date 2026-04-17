import z from "zod";


const err = {
    Empty_fullname: "Fullname shouldn't be empty",
    Short_fullname: "Fullname should be atleast 3 characters long",
    Empty_username: "Username shouldn't be empty",
    Empty_email: "Email shouldn't be empty",
    Invalid_email: "Provide valid email address",
    Empty_password: "Password shouldn't be empty",
    Short_password: "Password should be atleast 6 characters long",
    Empty_body: "Provide valid body data"
}

export const registerValidator = z.object({
    fullname: z.string(err.Empty_fullname).min(3, err.Short_fullname),
    username: z.string(err.Empty_username),
    email: z.string(err.Empty_email).email(err.Invalid_email),
    password: z.string(err.Empty_password).min(6, err.Short_password)
        .regex(/[A-Z]/, "Must contain uppercase letter")
        .regex(/[a-z]/, "Must contain lowercase letter")
        .regex(/[0-9]/, "Must contain a number")
},err.Empty_body);


export const resetPasswordValidator = z.object({
    email: z.string(err.Empty_email).email(err.Invalid_email),
    code: z.number().min(1, "Code shouldn't be empty"),
    new_password: z.string(err.Empty_password).min(6, err.Short_password)
});