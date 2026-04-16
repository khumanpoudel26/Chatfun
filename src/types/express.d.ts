declare global {
    namespace Express {
        export interface Request {
            user?: import("./user.types").ReqUser;
        }
    }
}
 
export {};