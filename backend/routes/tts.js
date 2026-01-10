import express from 'express';
import { generateSpeech } from '../controllers/ttsController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/tts
 * @desc    Generate speech from text using OpenAI TTS
 * @access  Private
 */
router.post('/', authenticate, generateSpeech);

export default router;

