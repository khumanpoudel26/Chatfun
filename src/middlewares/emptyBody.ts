import { NextFunction, Request, Response } from "express";
import apiError from "../utils/apiError";

const emptyBody = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (req.method === "POST" ||
        req.method === "PUT" ||
        req.method === "PATCH" ||
        req.method === "DELETE") {
        if (!req.body){
            throw new apiError(400, "Provide valid body data"); 
        }

        next();
    }
    next();
}

export default emptyBody;
