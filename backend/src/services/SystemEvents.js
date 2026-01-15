const EventEmitter = require('events');

class SystemEvents extends EventEmitter {
    constructor() {
        super();
        this.clients = [];
    }

    addClient(req, res) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        const clientId = Date.now();
        const newClient = {
            id: clientId,
            res
        };

        this.clients.push(newClient);

        req.on('close', () => {
            console.log(`📡 SSE: Client ${clientId} disconnected`);
            this.clients = this.clients.filter(c => c.id !== clientId);
        });

        console.log(`📡 SSE: Client ${clientId} connected`);
        return clientId;
    }

    broadcast(event, data) {
        console.log(`📢 Broadcasting event: ${event}`);
        this.clients.forEach(client => {
            client.res.write(`event: ${event}\n`);
            client.res.write(`data: ${JSON.stringify(data)}\n\n`);
        });
    }
}

module.exports = new SystemEvents();
