const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const aiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;

/**
 * Handles audio transcription using OpenAI-compatible Whisper APIs (OpenAI or Groq)
 */
exports.transcribeAudio = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Fichier audio manquant' });
    }

    if (!aiKey) {
        return res.status(500).json({ error: 'Clé API AI manquante pour la transcription' });
    }

    const filePath = req.file.path;
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    formData.append('model', 'whisper-large-v3');
    formData.append('language', 'fr');

    const whisperUrl = process.env.AI_PROVIDER === 'groq'
        ? 'https://api.groq.com/openai/v1/audio/transcriptions'
        : 'https://api.openai.com/v1/audio/transcriptions';

    try {
        const response = await axios.post(whisperUrl, formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': `Bearer ${aiKey}`
            }
        });

        fs.unlinkSync(filePath);
        res.json({ text: response.data.text });
    } catch (error) {
        console.error('Transcription error:', error.response?.data || error.message);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        res.status(500).json({ error: 'Erreur lors de la transcription audio' });
    }
};
