import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.PENAI_API_KEY || process.env.OPENAI_API_KEY,
});

/**
 * Generate speech from text using OpenAI TTS
 * @route POST /api/tts
 * @access Private
 */
export async function generateSpeech(req, res) {
  try {
    const { text } = req.body;

    // Validate input
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({
        error: {
          message: 'Text is required and must be a non-empty string',
          code: 'VALIDATION_ERROR',
        },
      });
    }

    // Check if OpenAI API key is configured
    if (!process.env.PENAI_API_KEY && !process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: {
          message: 'OpenAI API key is not configured. Please set PENAI_API_KEY or OPENAI_API_KEY in environment variables.',
          code: 'CONFIGURATION_ERROR',
        },
      });
    }

    // Limit text length to avoid token limits (OpenAI TTS has a limit of 4096 characters)
    const textToSpeak = text.length > 4096 
      ? text.substring(0, 4096)
      : text.trim();

    // Generate speech using OpenAI TTS
    console.log(`🔊 Generating speech for text (${textToSpeak.length} characters)`);
    
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1-hd-1106',
      voice: 'coral',
      input: textToSpeak,
    });

    // Convert the response to a buffer
    const buffer = Buffer.from(await mp3.arrayBuffer());
    
    console.log(`✅ Audio generated successfully (${buffer.length} bytes)`);

    // Set appropriate headers for audio response
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Accept-Ranges', 'bytes');
    
    // CORS headers (if needed)
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Send the audio buffer
    res.send(buffer);
  } catch (error) {
    console.error('TTS generation error:', error);
    
    // Handle OpenAI API errors
    if (error?.status || error?.response) {
      return res.status(500).json({
        error: {
          message: `OpenAI API error: ${error.message || 'Unknown error'}`,
          code: 'OPENAI_ERROR',
          details: error.response?.data || null,
        },
      });
    }

    res.status(500).json({
      error: {
        message: error.message || 'Failed to generate speech',
        code: 'TTS_ERROR',
      },
    });
  }
}

