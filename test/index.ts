import Embeddings from '../src/index';
import * as dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.API_KEY;

const embeddings = new Embeddings(apiKey!)
embeddings.setEngine('davinci-similarity')
embeddings.createEmbeddings(['hello', 'hello'])
.then(res => {
    console.log(JSON.stringify(res, null, 4));
    console.log(res['data'][0]['embedding'].length);
    console.log(embeddings.cosineSimilarity(res['data'][0]['embedding'], res['data'][1]['embedding']));
})
.catch(err => {
    console.log(err);
})

// embeddings.createEmbeddings(['hello', 'hi']) | 0.9328000335526373
// embeddings.createEmbeddings(['hello', 'bye']) | 0.8489772595319628
// embeddings.createEmbeddings(['hello', 'hello']) | 1.0000000000000142