import { PrismaClient } from '@prisma/client'
import { EmbeddingsResponse, search } from '../utils'
import Obsidian from './index';
import _ from 'lodash'

export async function findObsidianDocumentByFilename(prismaClient: PrismaClient, filename: string) {
    return prismaClient.obsidian.findMany({
        where: {
            filename
        }
    }).then((result) => {
        return result;
    })
    .catch((error) => {
        console.log(error);
        return {}
    });
}

export async function writeObsidianDocumentToPostgres(prismaClient: PrismaClient, obsidianDocument: {
    filename: string;
    chunks: string[][];
    embeddingsResponse: {
        embeddings: number[][];
        text: string[];
    };
}) {
    return prismaClient.obsidian.create({
        data: {
            doc: obsidianDocument,
            filename: obsidianDocument.filename,
        }
    }).then((result) => {
        return result;
    })
    .catch((error) => {
        console.log(error);
        return error;
    });
}


export async function findAllObsidianDocuments(prismaClient: PrismaClient) {
    return prismaClient.obsidian.findMany({})
        .then((result) => {
            return result;
        })
        .catch((error) => {
            console.log(error);
            return []
        });
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

    const topResults = []
    for (let i = 0; i < similarityPerDocument.length; i++) {
        const groupedByQuery = similarityPerDocument[i]
        const sortedBySimilarity = _.reverse(_.sortBy(groupedByQuery, 'searchResult.similarity'))
        
        topResults.push({
            query: queries[i],
            result: obsidianDocuments[sortedBySimilarity[0]!.docNum]?.embeddingsResponse?.text[sortedBySimilarity[0]!.searchResult!.index],
            filename: obsidianDocuments[sortedBySimilarity[0]!.docNum]?.filename,
            tag: 'obsidian'
        })
    }

    return topResults
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