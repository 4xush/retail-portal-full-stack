import { Router } from 'express';
import * as search from '../controllers/search.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const r = Router();

r.get('/suggest', asyncHandler(search.suggest));
r.get('/', asyncHandler(search.fullSearch));

export default r;
