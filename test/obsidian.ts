import * as dotenv from 'dotenv';
import { embedQuery } from '../src/utils'
import _ from 'lodash'
import { PrismaClient } from '@prisma/client'
import { findAllObsidianDocuments, findObsidianDocumentByFilename, writeObsidianDocumentToPostgres, returnTopResult, ObsidianFactory } from '../src/obsidian/utils'

dotenv.config();

const apiKey = process.env.API_KEY;
const obsidianRootPath = process.env.OBSIDIAN_ROOT_PATH;
const queries = ['henry ford industry', 'samuel morse', 'water bottle', 'apple watch', 'new experiences', 'habits', 'dwayne johnson']

const main = async () => {
    const prismaClient = new PrismaClient();
    const res = await findAllObsidianDocuments(prismaClient);
    console.log(res);

    const queryEmbedding = await embedQuery(queries, 'babbage-search-query', apiKey!)
    
    const docs = res!.map((doc) => {
        const d2 = doc.doc as {
            filename: string;
            chunks: string[][];
            embeddingsResponse: {
                embeddings: number[][];
                text: string[];
            };
        }
        return d2
    })

    const top_results = returnTopResult(docs, queryEmbedding!, queries)
    console.log(top_results);
}

main()