import * as dotenv from 'dotenv';
import { embedQuery } from '../src/utils'
import { returnTopResult, ObsidianFactory } from '../src/obsidian/index'
import _ from 'lodash'
import { PrismaClient } from '@prisma/client'
dotenv.config();

const apiKey = process.env.API_KEY;
const obsidianRootPath = process.env.OBSIDIAN_ROOT_PATH;
const DEBUG = true

const queries = ['goku', 'cool website']

const main = async () => {
    const prismaClient = new PrismaClient();
    await updateObsidianDoc(prismaClient);
    await findDocs(prismaClient);
    
}

const writeAndSearch = async (prismaClient: PrismaClient) => {
    const obsDaily1225 = await ObsidianFactory(apiKey!, obsidianRootPath + 'Daily/2021-12-25.md', 'babbage-search-document')

    
    prismaClient.obsidian.create({
        data: {
            doc: obsDaily1225.doc,
            filename: obsDaily1225.doc.filename,
        }
    }).then(async (result) => {
        const doc = result.doc as {
            filename: string;
            chunks: string[][];
            embeddingsResponse: {
                embeddings: number[][];
                text: string[];
            };
        }
        const obsDevPortfolios = await ObsidianFactory(apiKey!, obsidianRootPath + 'Cool Creative Developer Portfolios.md', 'babbage-search-document')
        const doc2 = obsDevPortfolios.doc

        const queryEmbedding = await embedQuery(queries, 'babbage-search-query', apiKey!)
        returnTopResult([doc, doc2], queryEmbedding!, queries)
    })
    .catch((error) => {
        console.log(error)
    })
}

main()

async function findDocs(prismaClient: PrismaClient) {
    return prismaClient.obsidian.findMany({
        where: {
            filename: '/Users/bram/Desktop/Obsidian/To Go Brain/Daily/2021-12-25.md'
        }
    }).then(async (result) => {
        console.log(result);
    })
        .catch((error) => {
            console.log(error);
        });
}

async function updateObsidianDoc(prismaClient: PrismaClient) {
    return prismaClient.obsidian.update({
        where: {
            id: 3
        },
        data: {
            doc: 'new doc update: ' + new Date(),
            updatedAt: new Date() 
        }
    }).then(async (result) => {
        console.log(result);
    }
    ).catch((error) => {
        console.log(error);
    });
}
