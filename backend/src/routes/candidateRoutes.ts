import { Router } from 'express';
import { addCandidate } from '../controllers/candidateController';

const router = Router();

router.post('/', addCandidate);

export default router;
