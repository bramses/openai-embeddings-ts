import { PrismaClient } from '@prisma/client'
import { EmbeddingsResponse, search } from '../utils'
import Obsidian from './index';
import _ from 'lodash'
import { prismaOffsetPagination } from 'prisma-offset-pagination';


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
    
    try {
        // offset method ~ 13 seconds for 1000 documents
        const count = await prismaClient.obsidian.count()
        const pages = Math.ceil(count / 100)
        const allDocsPromises = []
        for (let i = 0; i < pages; i++) {
            const page = prismaClient.obsidian.findMany({
                skip: i * 100,
                take: 100
            })
            allDocsPromises.push(page)
        }
        const allDocs = await Promise.all(allDocsPromises)
        return _.flatten(allDocs)
    
        // cursor method ~25 seconds for 1000 documents
        // const allDocs = []
        // let queryResults = await prismaClient.obsidian.findMany({
        //     take: 100
        // })
        // while (queryResults.length > 0) {
        //     allDocs.push(...queryResults)
        //     console.log(queryResults[queryResults.length - 1]!.id)
        //     queryResults = await prismaClient.obsidian.findMany({
        //         take: 100,
        //         skip: 1,
        //         cursor: {
        //             id: queryResults[queryResults.length - 1]!.id
        //         }
        //     })
        // }
        // console.log(allDocs.length)
        // return allDocs
    
        // prisma-offset-pagination method fails with: Invalid `prismaModel.findMany()` invocation
        // const result = await prismaOffsetPagination({
        //     model: { name: 'obsidian' },
        //     size: 100,
        //     orderBy: 'id',
        //     orderDirection: 'desc',
        //     buttonNum: 11,
        //     prisma: prismaClient
        // });
        // console.log(result)
        // return [{
        //     doc: { filename: 'string', chunks: [['q']], embeddingsResponse: { embeddings: [[0]], text: ['hi'] } },
        //     id: 1,
        //     filename: 'blah',
        //     updatedAt: new Date(),
        //     createdAt: new Date()
        // }];
    } catch (err) {
        console.error(err)
        return [{
            doc: { filename: 'string', chunks: [['q']], embeddingsResponse: { embeddings: [[0]], text: ['hi'] } },
            id: 1,
            filename: 'blah',
            updatedAt: new Date(),
            createdAt: new Date()
        }];
    }
}

export function returnTopResult(obsidianDocuments: ObsidianDocumentWithEmbeddings[], queryEmbeddings: EmbeddingsResponse, queries: string[], numTopResults: number = 3) {
    try {
        const searchResults = []
        let offset = 0
        for (let i = 0; i < obsidianDocuments.length; i++) {
            const doc = obsidianDocuments[i];
            
            if (doc && doc.embeddingsResponse) searchResults.push(search(doc!.embeddingsResponse!.embeddings, queryEmbeddings.embeddings, 1))
            else {
                console.log(`No embeddings for ${doc!.filename}`)
                offset++ // used for empty documents, not sure how to handle them yet
            }
        }
    
        const similarityPerDocument = []
        for (let i = 0; i < queries.length; i++) {
            const forQuery = []
            for (let j = 0; j < searchResults.length - offset; j++) {
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
    } catch (err) {
        console.log(err)
        return []
    }
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