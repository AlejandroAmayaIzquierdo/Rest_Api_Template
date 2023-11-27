import { Request, Response } from "express";
import { randomCatFact } from "../services/catsServices.js";
import auth from "../database/lucia.js";


const CATEGORY = "cats";


export const getRandomCatFact = async (request: Request,response: Response) => {
    try {
        const token = request.get('authorization') as string;
    
        const isValid = await auth.validateSession(token);
        if(!isValid) response.status(402).send({status: 0, error: "AUTH_INVALID_SESSION_ID"});
        console.log(token);
        console.log(isValid);
        const randomFact = await randomCatFact();
        const resp: App.StandarFact = {
            id: 0,
            category: CATEGORY,
            fact : randomFact ?? "Error while finding cat",
        }
        response.status(202).send({status: 1, result: resp});
    } catch (error) {
        response.status(500).send({status: 1, error: "AUTH_INVALID_SESSION_ID"});
    }

}