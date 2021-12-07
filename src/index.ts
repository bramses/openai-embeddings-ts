import { createEndpoint } from './utils'
import axios from 'axios';

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
    ) => {
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
        const data = await response.data;
        return data;
    }
}