import express from 'express';
import { aiController } from '../controllers/ai_controller'; // ודאי שזה הנתיב הנכון

const router = express.Router();

router.post('/ai/challenge', aiController.askGemini);

export default router;
