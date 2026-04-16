import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import apiError from "../utils/apiError";

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.message);
    if (err instanceof ZodError) {
        return res.status(400).json({
            success: false,
            message: err.issues[0].message
        });
    }

    if (err instanceof apiError) {
        return res.status(err.status).json({
            success: err.success,
            message: err.message
        });
    }

    return res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === "prod" ? "Internal server error, try later" : err.message
    })
};

export default errorHandler;