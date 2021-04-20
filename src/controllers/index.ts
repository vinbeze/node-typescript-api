import logger from "@src/logger";
import { CUSTOM_VALIDATION } from "@src/models/user";
import ApiError, { APIError } from "@src/util/errors/api-error";
import { Response } from "express";
import mongoose  from "mongoose";


export abstract class BaseController{
    protected sendCreateUpdateErrorResponse(res: Response, error: mongoose.Error.ValidationError| Error): void {
    
        if (error instanceof mongoose.Error.ValidationError) {
            const clientErrors = this.handleClientErrors(error);
            res.status(clientErrors.code).send(ApiError.format({code: clientErrors.code, message: clientErrors.error}));
          } else {
            logger.error(error)
            res.status(500).send(ApiError.format({ code: 500, message: 'Internal Server Error' }));
          }
    };

    private handleClientErrors(error: mongoose.Error.ValidationError): {code: number; error: string} {
        const duplicatedErrors = Object.values(error.errors).filter((err) => err.kind === CUSTOM_VALIDATION.DUPLICATED);
        if(duplicatedErrors.length) { 
            return {code: 409, error: error.message} ;
        }else {
            return { code: 422 ,error: error.message } ; 
        }
    }

    protected sendErrorResponse(res: Response, apiError: APIError): Response {
        return res.status(apiError.code).send(ApiError.format(apiError));
    }


}