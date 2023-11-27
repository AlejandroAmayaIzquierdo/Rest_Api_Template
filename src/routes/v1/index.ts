import express from "express";
import { catsFactsRoute } from "./catFacts.js";


const v1Routes = express.Router();

v1Routes.use('/cats',catsFactsRoute);

export default v1Routes;