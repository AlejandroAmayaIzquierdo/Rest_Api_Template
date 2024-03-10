import express from 'express';
import userRoute from './user/user.js';
import storageRoute from './storage.js';

const Routes = express.Router();

Routes.use('/user', userRoute);
Routes.use('/storage', storageRoute);

export default Routes;
