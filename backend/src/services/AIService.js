const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration from Environment
const aiProvider = process.env.AI_PROVIDER || 'openai';
const aiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
const aiBaseUrl = process.env.AI_BASE_URL || 'https://api.openai.com/v1';
const aiModel = process.env.AI_MODEL || (aiProvider === 'groq' ? 'llama-3.3-70b-versatile' : 'gpt-4o');

console.log(`🤖 Kemet AI Service initialized | Provider: ${aiProvider} | Model: ${aiModel} | Key: ${aiKey ? aiKey.substring(0, 10) + '...' : 'MISSING'}`);

class AIService {
    /**
     * Loads context from the docs folder for RAG, prioritizing instructions.md
     */
    async _getKnowledgeBaseContext() {
        try {
            const docsDir = path.join(__dirname, '../../../docs');
            if (!fs.existsSync(docsDir)) return { instructions: "", knowledgeContext: "" };

            const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.md'));

            let instructions = "";
            if (fs.existsSync(path.join(docsDir, 'instructions.md'))) {
                instructions = fs.readFileSync(path.join(docsDir, 'instructions.md'), 'utf8');
            }

            let knowledgeContext = "";
            for (const file of files) {
                if (file === 'instructions.md') continue;
                const content = fs.readFileSync(path.join(docsDir, file), 'utf8');
                knowledgeContext += `\n--- DOCUMENT: ${file} ---\n${content}\n`;
                if (knowledgeContext.length > 10000) break;
            }

            return { instructions, knowledgeContext };
        } catch (error) {
            console.error('Error loading knowledge base:', error);
            return { instructions: "", knowledgeContext: "" };
        }
    }

    /**
     * Responds to user queries
     */
    async getAssistantResponse(query, context = {}) {
        if (!aiKey) return "Erreur : Clé API manquante.";

        const { instructions, knowledgeContext } = await this._getKnowledgeBaseContext();

        const systemMessage = `Tu es Kemet AI, l'assistant officiel du système SoftRide.
REPSPECTE SCRUPULEUSEMENT CES INSTRUCTIONS :
${instructions}

BASE DE CONNAISSANCES TECHNIQUE :
${knowledgeContext}

IMPORTANT : Si l'utilisateur pose une question sur l'interface (profil, requêtes, etc.), réfère-toi TOUJOURS aux instructions ci-dessus.`;

        try {
            const response = await axios.post(`${aiBaseUrl}/chat/completions`, {
                model: aiModel,
                messages: [
                    { role: "system", content: systemMessage },
                    { role: "user", content: query }
                ],
                temperature: 0.6
            }, {
                headers: {
                    'Authorization': `Bearer ${aiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data.choices[0].message.content;
        } catch (error) {
            console.error(`${aiProvider.toUpperCase()} Error:`, error.response?.data || error.message);
            return `Erreur technique (${aiProvider}).`;
        }
    }

    /**
     * Returns a streaming response
     */
    async getStreamingAssistantResponse(query, context = {}) {
        if (!aiKey) throw new Error("Clé API manquante");

        const { instructions, knowledgeContext } = await this._getKnowledgeBaseContext();

        const systemMessage = `Tu es un ingénieur expert SoftRide.
INSTRUCTIONS À SUIVRE IMPÉRATIVEMENT :
${instructions}

CONTEXTE :
${knowledgeContext}`;

        return axios.post(`${aiBaseUrl}/chat/completions`, {
            model: aiModel,
            messages: [
                { role: "system", content: systemMessage },
                { role: "user", content: query }
            ],
            stream: true,
            temperature: 0.4
        }, {
            headers: {
                'Authorization': `Bearer ${aiKey}`,
                'Content-Type': 'application/json'
            },
            responseType: 'stream'
        });
    }

    /**
     * Generates technical solutions for developers
     */
    async analyzeRequest(subject, description, type) {
        if (!aiKey) return JSON.stringify({ solution: "Clé API manquante." });

        const { instructions, knowledgeContext } = await this._getKnowledgeBaseContext();

        const systemMessage = `Analyse cette requête technique et réponds EXCLUSIVEMENT en JSON {"solution": "..."}.
INSTRUCTIONS :
${instructions}

CONTEXTE :
${knowledgeContext}`;

        try {
            const response = await axios.post(`${aiBaseUrl}/chat/completions`, {
                model: aiModel,
                messages: [
                    { role: "system", content: systemMessage },
                    { role: "user", content: `Type: ${type}\nSujet: ${subject}\nDescription: ${description}` }
                ],
                response_format: { type: "json_object" }
            }, {
                headers: {
                    'Authorization': `Bearer ${aiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data.choices[0].message.content;
        } catch (error) {
            console.error(`${aiProvider.toUpperCase()} Analyze Error:`, error.response?.data || error.message);
            return JSON.stringify({ solution: "Erreur d'analyse via le Cloud." });
        }
    }
}

module.exports = new AIService();
