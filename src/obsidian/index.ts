import * as dotenv from 'dotenv';
import { chunkDocument, readFile, EmbeddingsResponse, search } from '../utils'
import Embeddings from '../index';
import _ from 'lodash'
import { PrismaClient } from '@prisma/client'

dotenv.config();

export default class Obsidian {
    private apiKey: string;
    tag: string;
    embeddingsObj: Embeddings;
    documentWithEmbeddings: {
        filename: any;
        chunks: string[][];
        embeddings: any;
    }
    prismaClient: PrismaClient;

    constructor(apiKey: string, engine: string = 'babbage-search-document') {
        this.apiKey = apiKey;
        this.tag = 'obsidian';
        this.embeddingsObj = new Embeddings(this.apiKey);
        this.prismaClient = new PrismaClient();
        this.embeddingsObj.setEngine(engine);
        this.documentWithEmbeddings = {
            filename: '',
            chunks: [],
            embeddings: {}
        }
    }

    async embedObsidianDocument(filename: string) {
        const txt = await readFile(filename, true)
        const chunks = txt
            .split('\n')
            .filter(line => line.length > 0)
            .map(line => JSON.stringify(line.trim()))
            .map(doc => chunkDocument(doc))

        const flattenedChunks = _.flatten(chunks)

        const docEmbeddings = await this.embeddingsObj.createEmbeddings(flattenedChunks!)

        const doc = {
            'filename': filename,
            'chunks': chunks,
            'embeddings': docEmbeddings as {
                embeddings: number[][]
                text: string[]
            }
        }

        this.documentWithEmbeddings = doc // TODO: for classes do I need to set this or just return as normal?
        return doc
    }
}

export function returnTopResult(obsidianDocuments: ObsidianDocumentWithEmbeddings[], queryEmbeddings: EmbeddingsResponse, queries: string[]) {
    const searchResults = []
    for (let i = 0; i < obsidianDocuments.length; i++) {
        const doc = obsidianDocuments[i];
        searchResults.push(search(doc!.embeddingsResponse!.embeddings, queryEmbeddings.embeddings, 1))
    }

    const similarityPerDocument = []
    for (let i = 0; i < queries.length; i++) {
        const forQuery = []
        for (let j = 0; j < searchResults.length; j++) {
            const searchResult = searchResults[j]
            forQuery.push({
                searchResult: searchResult![i]![0],
                docNum: j
            })
        }
        similarityPerDocument.push(forQuery)
    }

    for (let i = 0; i < similarityPerDocument.length; i++) {
        const groupedByQuery = similarityPerDocument[i]
        const sortedBySimilarity = _.reverse(_.sortBy(groupedByQuery, 'searchResult.similarity'))
        console.log(
            `query :: ${queries[i]}
            result :: ${obsidianDocuments[sortedBySimilarity[0]!.docNum]?.embeddingsResponse?.text[sortedBySimilarity[0]!.searchResult!.index]}` )   
    }
}

export async function ObsidianFactory (apiKey: string, documentFilePath: string, engine: string = 'babbage-search-document') {
    const obsidian = new Obsidian(apiKey, engine)
    const doc = await obsidian.embedObsidianDocument(documentFilePath)
    return {
        obsidian,
        doc
    }
}

// INTERFACES

export interface ObsidianDocumentWithEmbeddings {
    filename: string;
    chunks: string[][];
    embeddingsResponse: {
        embeddings: number[][]
        text: string[]
    } | null;
}