import { PrismaClient } from '@prisma/client'
import { EmbeddingsResponse, search } from '../utils'
import Obsidian from './index';
import _ from 'lodash'

export async function findObsidianDocumentByFilename(prismaClient: PrismaClient, filename: string) {
    return prismaClient.obsidian.findUnique({
        where: {
            filename
        }
    }).then((result) => {
        return result;
    })
    .catch((error) => {
        console.log(error);
        return null
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

export async function updateObsidianDocument(prismaClient: PrismaClient, filename: string, obsidianDocument: {
    filename: string;
    chunks: string[][];
    embeddingsResponse: {
        embeddings: number[][];
        text: string[];
    };
}, oldFilename?: string) {
    return prismaClient.obsidian.update({
        where: {
            filename: oldFilename ? oldFilename : filename
        },
        data: {
            doc: obsidianDocument,
            filename: obsidianDocument.filename,
            updatedAt: new Date()
        }
    }).then((result) => {
        return result;
    }).catch((error) => {
        console.log(error);
        return error;
    });
}

export async function findAllObsidianDocuments(prismaClient: PrismaClient) {
    const rawQuery = await prismaClient.$queryRaw`SELECT * FROM obsidian`
    console.log(rawQuery) // TODO: Cant fetch all docs, need some sort of cache or pagination
    return prismaClient.obsidian.findMany({
        take: 10
    })
        .then((result) => {
            console.log(result);
            return result;
        })
        .catch((error) => {
            console.log(error);
            return []
        });
}

export function returnTopResult(obsidianDocuments: ObsidianDocumentWithEmbeddings[], queryEmbeddings: EmbeddingsResponse, queries: string[], numTopResults: number = 3) {
    const searchResults = []
    let offset = 0
    for (let i = 0; i < obsidianDocuments.length; i++) {
        const doc = obsidianDocuments[i];
        
        if (doc && doc.embeddingsResponse) searchResults.push(search(doc!.embeddingsResponse!.embeddings, queryEmbeddings.embeddings, 1))
        else offset++ // used for empty documents, not sure how to handle them yet
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

        const results = []
        for (let j = 0; j < Math.min(sortedBySimilarity.length, numTopResults); j++) {
            results.push({
                query: queries[i],
                result: obsidianDocuments[sortedBySimilarity[j]!.docNum - offset]?.embeddingsResponse?.text[sortedBySimilarity[j]!.searchResult!.index],
                filename: obsidianDocuments[sortedBySimilarity[j]!.docNum - offset]?.filename,
                tag: 'obsidian'
            })
        }

        topResults.push(results)
    }

    return topResults
}

export async function ObsidianFactory(apiKey: string, documentFilePath: string, engine: string = 'babbage-search-document') {
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