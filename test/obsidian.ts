import * as dotenv from 'dotenv';
import { chunkDocument, EmbeddingsResponse, readFile, embedQuery, search } from '../src/utils'
import Embeddings from '../src/index';
import _ from 'lodash'
dotenv.config();

const apiKey = process.env.API_KEY;
const obsidianRootPath = process.env.OBSIDIAN_ROOT_PATH;

const queries = ['what is art?', 'powerpoint']

const main = async () => {
    const filename = obsidianRootPath + 'Daily/2021-12-25.md'
    const txt = await readFile(filename, true)
    const chunks = txt
        .split('\n')
        .filter(line => line.length > 0)
        .map(line => line.trim())
        .map(doc => JSON.stringify(chunkDocument(doc)))
    
    const flattenedChunks = _.flatten(chunks)
    
    const embeddings_s: (EmbeddingsResponse| null)[] = []
    const embeddings = new Embeddings(apiKey!)
    embeddings.setEngine('babbage-search-document')
    const docEmbeddings = await embeddings.createEmbeddings(flattenedChunks!)
    embeddings_s.push(docEmbeddings)
    
    
    const doc = {
        'filename': filename,
        'chunks': chunks,
        'embeddings_s': embeddings_s
    }
    console.log(doc.embeddings_s)
    console.log(doc.embeddings_s[0]?.text[22])

    const mappedDocEmbeddings = doc.embeddings_s.map(embedding => embedding!.embeddings)
    const queryEmbedding = await embedQuery(queries, 'babbage-search-query', apiKey!)

    const searchResults = []
    for (let i = 0; i < mappedDocEmbeddings.length; i++) {
        const results = search(mappedDocEmbeddings[0]!, queryEmbedding!.embeddings, 1)

        results.forEach((result, idx: number) => {
        console.log(`qry: ${queries[idx]}`)
        console.log('Index: ', result[0]?.index)
        console.log('Similarity: ', result[0]?.similarity)
        })
    }
}

main()