import similarity from 'compute-cosine-similarity';
import Embeddings from './index';
const { encode } = require('gpt-3-encoder')
import fs from 'fs'
import path from 'path';


export function readFile(filePath: string): Promise<string> {
    const fullPath = path.join(__dirname, filePath) 
    return new Promise((resolve, reject) => {
        fs.readFile(fullPath, 'utf-8', (err, data) => {
            if (err) {
                reject(err)
            }
            resolve(data.toString())
        })
    })
}

function checkLength(text: string, maxChunkLength: number = 2000) {
    const encoded = encode(text)
    if (encoded.length > maxChunkLength) {
        return true
    }
    return false
}

/**
 * a chunking algorithm that splits a string into chunks of a maximum length as dictated by max tokens allowed by the API 
 * Does not respect spaces, so it is not suitable for splitting text into sentences
 * @param document document to be chunked
 * @returns chunks of the document
 */
export function chunkDocument (document: string): string[] {
    const chunks: string[] = []
    let chunksAboveTokenLimit = [] // [true, false, etc] want all to be false
    let numOfSubdivisions = 0
    chunksAboveTokenLimit.push(checkLength(document))
    while (chunksAboveTokenLimit.includes(true)) {
        numOfSubdivisions++
        chunksAboveTokenLimit = []
        let maxChunkLength = Math.floor(document.length / numOfSubdivisions)
        for (let i = 0; i < numOfSubdivisions; i++) {
            const chunk = document.slice(i * maxChunkLength, (i + 1) * maxChunkLength)
            chunksAboveTokenLimit.push(checkLength(chunk))
        }
    }

    if(numOfSubdivisions > 1) {
        let maxChunkLength = Math.floor(document.length / numOfSubdivisions)
        for (let i = 0; i < numOfSubdivisions; i++) {
            const chunk = document.slice(i * maxChunkLength, (i + 1) * maxChunkLength)
            chunks.push(chunk)
        }
    } else {
        chunks.push(document)
    }
    
    console.log('Number of subdivisions: ', numOfSubdivisions)

    return chunks
}

/**
 * 
 * @param engine engine to be used for embedding
 * @returns http endpoint for embedding
 */
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

export function cleanString(str: string): string {
    return str.replace(/\n/g, " ").trim() // new lines should be replaced with spaces as per https://beta.openai.com/docs/guides/embeddings/use-cases
}

/**
 * example https://github.com/openai/openai-python/blob/main/examples/embeddings/Obtain_dataset.ipynb
 * @param data any json object
 * @param indexedField field to be indexed from json object, like title, text, etc.
 * @returns an object with text and original data for linking
 */
export function processData(data: any[], indexedField: string): ProcessedData {
    const result: string[] = [];
    data.forEach((item: any) => {
        result.push(item[indexedField]);
    });

    return {
        text: result,
        original: data
    };
}

/**
 * fetch index from ProcessedData
 * @param data ProcessedData object
 * @param idx number of index to be fetched from original data
 * @returns single item from original data
 */
export function fetchDataFromOriginal(data: ProcessedData, idx: number) {
    return {
        original: data.original[idx],
        text: data.text[idx]
    };
}

/**
 * use the openai api to embed a query
 * @param query query|queries to be searched
 * @param engine what engine to encode query with
 * @param apiKey api key for openai api 
 * @returns Embeddings object
 */
export async function embedQuery(query: string | string[], engine: string, apiKey: string): Promise<EmbeddingsResponse | null> {
    try {
        const queryEmbedding = new Embeddings(apiKey!)
        queryEmbedding.setEngine(engine)
        if (!Array.isArray(query)) {
            query = [query];
        }
        return queryEmbedding.createEmbeddings(query)
    } catch (err) {
        console.error(err)
        return null
    }
}

/**
 * Run cosine similarity search on all documents in the database against a list of queries, and return the top {numResults} results
 * @param documentEmbeddings number[][] - embeddings of source document
 * @param queryEmbeddings number[][] - embeddings of queries (queries are a list)
 * @param numResults number - number of results to be returned
 * @returns SearchResult[][] - list of results
 */
export function search(documentEmbeddings: number[][], queryEmbeddings: number[][], numResults: number = 3): SearchResults[][] {
    const results: SearchResults[][] = [];
    queryEmbeddings.map((queryEmbedding) => {
        const similarityRankings = documentEmbeddings.map((vector, i) => {
            const similarity = cosineSimilarity(vector, queryEmbedding);
            return { 
                index: i,
                similarity,
                vector
            }
        })
        .sort((a, b) => b.similarity - a.similarity);
        
        const slicedRankings = similarityRankings.slice(0, numResults);
        results.push(slicedRankings)
    });
    return results;
}

/**
 * run cosine similarity on two vectors
 * @param vector1 number[]
 * @param vector2 number[]
 * @returns number
 */
export function cosineSimilarity(vector1: number[], vector2: number[]): number {
    return similarity(vector1, vector2)
}

/* INTERFACES */

interface SearchResults {
    index: number,
    similarity: number,
    vector: number[]
}

export interface OpenAIResponse {
    data: {
        embedding: number[]
    }[]
}

export interface EmbeddingsResponse {
    embeddings: number[][]
    text: string[]
}

interface ProcessedData {
    text: string[]
    original: any
}