import Embeddings from '../src/index';
import * as dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.API_KEY;


const main = async () => {
    const embeddings = new Embeddings(apiKey!)
    embeddings.setEngine('babbage-search-document')

    const queryEmbedding = new Embeddings(apiKey!)
    queryEmbedding.setEngine('babbage-search-query')

    const embeddingsRes = await embeddings.createEmbeddings(['hello', 'bye', 'see ya later'])
    const queryEmbeddingRes = await queryEmbedding.createEmbeddings('hello')
    console.log(embeddingsRes['embeddings']!.length)
    console.log(queryEmbeddingRes['embeddings']!.length)

    const searchResults = await embeddings.search(embeddingsRes['embeddings']!, queryEmbeddingRes['embeddings']!)
    console.log(searchResults)
}

main()
// embeddings.createEmbeddings(['hello', 'hi']) | cosineSimilarity 0.9328000335526373
// embeddings.createEmbeddings(['hello', 'bye']) | cosineSimilarity 0.8489772595319628
// embeddings.createEmbeddings(['hello', 'hello']) | cosineSimilarity 1.0000000000000142

/* 
embeddings.search (await embeddings.createEmbeddings(['hello', 'bye', 'see ya later']), await embeddings.createEmbeddings('whats up'))
[
  { score: 0, text: 0.24513052775511313 },
  { score: 2, text: 0.22330884859033295 },
  { score: 1, text: 0.20145681247050942 }
]
*/