import * as dotenv from 'dotenv';
import { chunkDocument, EmbeddingsResponse, readFile } from '../src/utils'
import Embeddings from '../src/index';
dotenv.config();

const apiKey = process.env.API_KEY;
const obsidianRootPath = process.env.OBSIDIAN_ROOT_PATH;

const main = async () => {
    const filename = obsidianRootPath + 'Daily/2021-12-25.md'
    const txt = await readFile(filename, true)
    const chunks = txt
        .split('\n')
        .filter(line => line.length > 0)
        .map(line => line.trim())
        .map(doc => chunkDocument(doc))
    
    
    const embeddings_s: (EmbeddingsResponse| null)[] = []
    for (let i = 0; i < 5; i++) {
        const embeddings = new Embeddings(apiKey!)
        embeddings.setEngine('babbage-search-document')
        const docEmbeddings = await embeddings.createEmbeddings(chunks![i]!)
        embeddings_s.push(docEmbeddings)
    }
    
    const doc = {
        'filename': filename,
        'chunks': chunks,
        'embeddings_s': embeddings_s
    }

    console.log(doc.embeddings_s)
    
    
}

main()