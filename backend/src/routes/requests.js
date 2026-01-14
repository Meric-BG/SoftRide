const express = require('express');
const { v4: uuidv4 } = require('uuid');
const requestRepo = require('../repositories/RequestRepository');
const aiService = require('../services/AIService');
const whisperController = require('../controllers/WhisperController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

// User: Create a new request
router.post('/', authMiddleware, async (req, res) => {
    console.log(`📩 New request submission attempt by user ${req.user.id}`);
    try {
        const { type, subject, description, priority } = req.body;

        if (!type || !subject || !description) {
            return res.status(400).json({ error: 'Type, sujet et description sont requis' });
        }

        // Generate AI analysis immediately for admin/dev assistance
        const aiAnalysis = await aiService.analyzeRequest(subject, description, type);

        const newRequest = {
            request_id: 'req-' + Date.now(),
            user_id: req.user.id,
            type,
            subject,
            description,
            priority: priority || 'MEDIUM',
            status: 'OPEN',
            ai_analysis: aiAnalysis,
            created_at: new Date().toISOString()
        };

        const created = await requestRepo.create(newRequest);
        console.log(`✅ Request ${newRequest.request_id} created successfully`);
        res.status(201).json(created);
    } catch (error) {
        console.error('Create request error:', error);
        res.status(500).json({ error: 'Erreur lors de la création de la requête' });
    }
});

// User: Get their own requests
router.get('/my', authMiddleware, async (req, res) => {
    try {
        const requests = await requestRepo.findByUser(req.user.id);
        res.json(requests);
    } catch (error) {
        console.error('Get user requests error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Admin: Get all requests
router.get('/all', authMiddleware, adminMiddleware, async (req, res) => {
    console.log(`🧐 Admin ${req.user.id} (Role: ${req.user.role}) fetching all requests`);
    try {
        const requests = await requestRepo.findAll();
        console.log(`📊 Found ${requests.length} requests in database`);
        res.json(requests);
    } catch (error) {
        console.error('Get all requests error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Admin: Update request (status, notes)
router.patch('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    console.log(`📝 Admin ${req.user.id} updating request ${req.params.id}`);
    try {
        const { id } = req.params;
        const { status, admin_notes } = req.body;

        const updated = await requestRepo.update(id, { status, admin_notes });
        res.json(updated);
    } catch (error) {
        console.error('Update request error:', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour' });
    }
});

// AI Assistant Chatbot Endpoint
router.post('/chat', authMiddleware, async (req, res) => {
    try {
        const { message, context } = req.body;
        if (!message) return res.status(400).json({ error: 'Message requis' });

        const response = await aiService.getAssistantResponse(message, context);
        res.json({ response });
    } catch (error) {
        console.error('AI Chat error:', error);
        res.status(500).json({ error: 'L\'assistant a rencontré une erreur' });
    }
});

// Admin: Whisper Voice-to-Text
router.post('/whisper', authMiddleware, adminMiddleware, upload.single('audio'), whisperController.transcribeAudio);

// Admin: Real-time AI Analysis Stream (SSE)
router.get('/analyze-stream/:id', authMiddleware, adminMiddleware, async (req, res) => {
    const { id } = req.params;
    console.log(`🧬 Starting AI Analysis Stream for request ${id}`);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        const request = await requestRepo.findById(id);
        if (!request) {
            res.write(`data: ${JSON.stringify({ error: 'Requête introuvable' })}\n\n`);
            return res.end();
        }

        const query = `Type: ${request.type}\nSujet: ${request.subject}\nDescription: ${request.description}`;
        const aiResponse = await aiService.getStreamingAssistantResponse(query);

        aiResponse.data.on('data', chunk => {
            const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
            for (const line of lines) {
                try {
                    const parsed = JSON.parse(line);
                    const content = parsed.response || '';
                    if (content) {
                        res.write(`data: ${JSON.stringify({ content })}\n\n`);
                    }
                    if (parsed.done) {
                        res.write('data: [DONE]\n\n');
                        res.end();
                    }
                } catch (e) {
                    // Ignore partial JSON chunks
                }
            }
        });

        aiResponse.data.on('end', () => {
            // End is handled by parsed.done
        });

    } catch (error) {
        console.error('SSE AI Stream error:', error.message);
        res.write(`data: ${JSON.stringify({ error: 'Erreur stream IA' })}\n\n`);
        res.end();
    }
});

// Admin: Regenerate AI Analysis for a specific request
router.post('/:id/analyze', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const request = await requestRepo.findById(id);

        if (!request) return res.status(404).json({ error: 'Requête introuvable' });

        console.log(`🧠 Regenerating AI Analysis for request ${id} (${request.subject})`);
        const aiAnalysis = await aiService.analyzeRequest(request.subject, request.description, request.type);

        const updated = await requestRepo.update(id, { ai_analysis: aiAnalysis });
        res.json(updated);
    } catch (error) {
        console.error('Regenerate AI analysis error:', error);
        res.status(500).json({ error: 'Erreur lors de la régénération de l\'analyse' });
    }
});

module.exports = router;
