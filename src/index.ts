import { createEndpoint, OpenAIResponse, EmbeddingsResponse } from './utils'
import axios from 'axios';
import similarity from 'compute-cosine-similarity';
// const createCsvWriter = require('csv-writer').createObjectCsvWriter;


interface RankingThing { [key: string]: any | undefined }

export default class Embeddings {

    apiKey: string;
    endpoint: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
        this.endpoint = this.setEngine('ada-similarity')
    }

    setEngine = (engine: string) => {
        this.endpoint = createEndpoint(engine)
        return this.endpoint
    }

    createEmbeddings = async (
        input: string | string[],
    ): Promise<EmbeddingsResponse> => {
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

        return { embeddings };
    }

    cosineSimilarity = (vector1: number[], vector2: number[]) => {
        return similarity(vector1, vector2)
    }

    

    search = async (embeddings: number[][], queryEmbeddings: number[][], numResults: number = 3) => {
        const results: RankingThing  = [];
        queryEmbeddings.map((queryEmbedding, idx: number) => {
            const similarityRankings = embeddings.map((vector, i) => {
                const similarity = this.cosineSimilarity(vector, queryEmbedding);
                return {
                    index: i,
                    similarity,
                    vector
                }
            }).sort((a, b) => b.similarity - a.similarity);
             similarityRankings.slice(0, numResults);
             results.push({
                 [idx]: similarityRankings
             })
        });
        return results;
    }
}