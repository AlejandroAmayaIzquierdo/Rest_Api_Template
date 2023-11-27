import express from "express";
import { getRandomCatFact } from "../../controllers/catsController.js";


export const catsFactsRoute = express.Router();


catsFactsRoute.get('/',getRandomCatFact);