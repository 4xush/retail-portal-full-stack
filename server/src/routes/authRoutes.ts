import { Router } from 'express';
import * as auth from '../controllers/auth.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { loginValidators, signupValidators } from '../validators/auth.validators.js';

const r = Router();

r.post('/signup', signupValidators, asyncHandler(auth.signup));
r.post('/login', loginValidators, asyncHandler(auth.login));
r.post('/refresh', asyncHandler(auth.refresh));
r.post('/logout', asyncHandler(auth.logout));

export default r;
