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

    const obsDaily1225 = await ObsidianFactory(apiKey!, obsidianRootPath + 'Daily/2021-12-25.md', 'babbage-search-document')

    const prismaClient = new PrismaClient();
    prismaClient.obsidian.create({
        data: {
            doc: obsDaily1225.doc,
            filename: obsDaily1225.doc.filename,
        }
    }).then((result) => {
        console.log(result)
    })
    .catch((error) => {
        console.log(error)
    })

    

    // const obsDaily1225 = await ObsidianFactory(apiKey!, obsidianRootPath + 'Daily/2021-12-25.md', 'babbage-search-document')
    // // const obsDevPortfolios = await ObsidianFactory(apiKey!, obsidianRootPath + 'Cool Creative Developer Portfolios.md', 'babbage-search-document')

    // prismaClient.obsidian.create({
    //     data: {
    //         embeddings: obsDaily1225.doc.embeddings!.embeddings.map(embedding => JSON.stringify(embedding)),
    //         text: obsDaily1225.doc.embeddings!.text,
    //         tag: 'obsidian'
    //     }
    // }).then(user => {
    //     console.log(user)
    // })
    // .catch(err => {
    //     console.log(err)
    // })

    // const doc = obsDaily1225.doc
    // const doc2 = obsDevPortfolios.doc

    // const queryEmbedding = await embedQuery(queries, 'babbage-search-query', apiKey!)
    // returnTopResult([doc, doc2], queryEmbedding!, queries)
}

main()