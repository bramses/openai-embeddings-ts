import Embeddings from '../src/index';
import * as dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.API_KEY;

const embeddings = new Embeddings(apiKey!)
embeddings.createEmbeddings('hello')
.then(res => {
    console.log(JSON.stringify(res, null, 4));
})
.catch(err => {
    console.log(err);
})