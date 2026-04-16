import { Response } from "express";
const apiResponse = <t>(res: Response, status: number, message: string, body?: Array<t> | object) => {
    return res.status(status).json({
        success: true,
        message: message,
        body
    });
}

export default apiResponse;