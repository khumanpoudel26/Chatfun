import { NextFunction, Request, Response } from "express";
import redis from "../configs/redis";

export const rateLimiter = (
    limit: number = 60, // default 60 requests
    window: number = 120 // default 120 seconds
) => {
    return async (
        req: Request, res: Response, next: NextFunction) => {
        const ip = req.ip;
        const key = `rate:${ip}`;
        const count = await redis.incrby(key, 1);

        if (count === 1) {
            redis.expire(key, window);  
        }

        process.env.NODE_ENV === "dev" && res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - count));

        if (count > limit) {
            process.env.NODE_ENV === "dev" && res.setHeader('Retry-After', `${window}seconds`);
            return res.status(429).json({
                success: false,
                message: `Too many requests, please try again later`
            });
        }

        next();
    }
}