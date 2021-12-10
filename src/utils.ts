import similarity from 'compute-cosine-similarity';

export function createEndpoint(engine: string): string {
    switch (engine) {
        case 'ada-similarity':
            engine = 'ada-similarity';
            break;
        case 'babbage-similarity':
            engine = 'babbage-similarity';
            break;
        case 'curie-similarity':
            engine = 'curie-similarity';
            break;
        case 'davinci-similarity':
            engine = 'davinci-similarity';
            break;
        case 'ada-search-document':
            engine = 'ada-search-document';
            break;
        case 'ada-search-query':
            engine = 'ada-search-query';
            break;
        case 'babbage-search-document':
            engine = 'babbage-search-document';
            break;
        case 'babbage-search-query':
            engine = 'babbage-search-query';
            break;
        case 'curie-search-document':
            engine = 'curie-search-document';
            break;
        case 'curie-search-query':
            engine = 'curie-search-query';
            break;
        case 'ada-code-search-code':
            engine = 'ada-code-search-code';
            break;
        case 'ada-code-search-text':
            engine = 'ada-code-search-text';
            break;
        case 'babbage-code-search-code':
            engine = 'babbage-code-search-code';
            break;
        case 'babbage-code-search-text':
            engine = 'babbage-code-search-text';
            break;
        default:
            engine = 'ada-similarity';
            break;
    }
    return `https://api.openai.com/v1/engines/${engine}/embeddings`;
}

export function processData (data: any[], indexedField: string): ProcessedData {
    const result: string[] = [];
    data.forEach((item: any) => {
        result.push(item[indexedField]);
    });

    return {
        text: result,
        original: data
    };
}

export function fetchDataFromOriginal (data: ProcessedData, idx: number) {
    return {
        original: data.original[idx],
        text: data.text[idx]
    };
}

export async function search(embeddings: number[][], queryEmbeddings: number[][], numResults: number = 3) {
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

export function cosineSimilarity (vector1: number[], vector2: number[]) {
    return similarity(vector1, vector2)
}

/** INTERFACES **/

interface RankingThing { 
    [key: string]: any | undefined 
}

export interface OpenAIResponse {
    data: {
        embedding: number[]
    }[]
}

export interface EmbeddingsResponse {
    [key: string]: number[][]
}

interface ProcessedData {
    text: string[]
    original: any
}