import { NextFunction, Request, Response } from "express";
import apiError from "../utils/apiError";

const emptyBody = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const methodsThatRequireBody = ["POST", "PUT", "PATCH", "DELETE"];
    
    if (methodsThatRequireBody.includes(req.method)) {
        // Check if body is empty object
        const isEmpty = !req.body || 
                       Object.keys(req.body).length === 0 || 
                       (req.body.constructor === Object && Object.keys(req.body).length === 0);
        
        if (isEmpty) {
            throw new apiError(400, "Request body cannot be empty");
        }
    }
    
    next();
}

export default emptyBody;