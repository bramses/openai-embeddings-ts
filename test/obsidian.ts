import * as dotenv from 'dotenv';
import { chunkDocument, readFile, embedQuery, search } from '../src/utils'
import Embeddings from '../src/index';
import Obsidian from '../src/obsidian/index'
import _ from 'lodash'
dotenv.config();

const apiKey = process.env.API_KEY;
const obsidianRootPath = process.env.OBSIDIAN_ROOT_PATH;
const DEBUG = true

const queries = ['goku', 'cool website']

const main = async () => {
    const obsidian = new Obsidian(apiKey!, 'babbage-search-document')
    const obsidian2 = new Obsidian(apiKey!, 'babbage-search-document')
    const doc = await obsidian.embedObsidianDocument(obsidianRootPath + 'Daily/2021-12-25.md')
    const doc2 = await obsidian2.embedObsidianDocument(obsidianRootPath + 'Cool Creative Developer Portfolios.md')

    const queryEmbedding = await embedQuery(queries, 'babbage-search-query', apiKey!)
    const results = search(doc.embeddings?.embeddings!, queryEmbedding!.embeddings, 1)
    const results2 = search(doc2.embeddings?.embeddings!, queryEmbedding!.embeddings, 1)

    if(DEBUG) {
        results.forEach((result, idx: number) => {
            console.log(`qry: ${queries[idx]}`)
            console.log('Index: ', result[0]?.index)
            console.log('Similarity: ', result[0]?.similarity)
            console.log('Text: ', doc.embeddings?.text[result[0]!.index])
        }) 
        
        console.log('--------')
    
        results2.forEach((result, idx: number) => {
            console.log(`qry: ${queries[idx]}`)
            console.log('Index: ', result[0]?.index)
            console.log('Similarity: ', result[0]?.similarity)
            console.log('Text: ', doc2.embeddings?.text[result[0]!.index])
        })
    }

    for (let i = 0; i < queries.length; i++) {
        console.log(`qry: ${queries[i]}`)
        if (results2[i]![0]!.similarity > results[i]![0]!.similarity) {
            console.log('Better result is second doc: ', doc2.embeddings?.text[results2[i]![0]!.index])
        } else {
            console.log('Better result is first doc: ', doc.embeddings?.text[results[i]![0]!.index])
        }
    }
}

main()