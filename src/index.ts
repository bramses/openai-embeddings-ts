import { createEndpoint, OpenAIResponse, EmbeddingsResponse } from './utils'
import axios from 'axios';
import * as fs from 'fs/promises';
// const createCsvWriter = require('csv-writer').createObjectCsvWriter;

export default class Embeddings {

    apiKey: string;
    endpoint: string;
    embeddings: EmbeddingsResponse;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
        this.endpoint = this.setEngine('ada-similarity');
        this.embeddings = {};
    }

    setEngine = (engine: string) => {
        this.endpoint = createEndpoint(engine)
        return this.endpoint
    }

    writeEmbeddings = async (embeddings: EmbeddingsResponse, filename: string) => {
        const writer = await fs.writeFile(filename, JSON.stringify(embeddings))
        return writer
    }

    createEmbeddings = async (
        input: string | string[],
    ): Promise<EmbeddingsResponse|null> => {
        try {
            input = Array.isArray(input) ? input.map(inp => inp.replace(/\n/g, ' ')) : input.replace(/\n/g, ' ')
            const body = { input };
    
            const response = await axios.post(this.endpoint, JSON.stringify(body),
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`
                    }
                }
            );
            const data: OpenAIResponse = await response.data;
            const embeddings = data.data.map(d => d.embedding);
    
            this.embeddings = { embeddings };
            return { embeddings };
        } catch (err) {
            console.error(err);
            return null;
        }
    }
}