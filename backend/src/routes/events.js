const express = require('express');
const systemEvents = require('../services/SystemEvents');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// SSE endpoint for system events
router.get('/stream', authMiddleware, adminMiddleware, (req, res) => {
    systemEvents.addClient(req, res);
});

module.exports = router;
