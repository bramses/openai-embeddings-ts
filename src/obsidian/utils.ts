import { PrismaClient } from '@prisma/client'

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