import * as dotenv from 'dotenv';
import { chunkDocument, readFile } from '../utils'
import Embeddings from '../index';
import _ from 'lodash'
dotenv.config();

export default class Obsidian {
    private apiKey: string;
    tag: string;
    embeddingsObj: Embeddings;
    documentWithEmbeddings: {
        filename: any;
        chunks: string[][];
        embeddings: any;
    }


    constructor(apiKey: string, engine: string = 'babbage-search-document') {
        this.apiKey = apiKey;
        this.tag = 'obsidian';
        this.embeddingsObj = new Embeddings(this.apiKey);
        this.embeddingsObj.setEngine(engine);
        this.documentWithEmbeddings = {
            filename: '',
            chunks: [],
            embeddings: {}
        }
    }

    async embedObsidianDocument(filename: string) {
        const txt = await readFile(filename, true)
        const chunks = txt
            .split('\n')
            .filter(line => line.length > 0)
            .map(line => JSON.stringify(line.trim()))
            .map(doc => chunkDocument(doc))

        const flattenedChunks = _.flatten(chunks)

        const docEmbeddings = await this.embeddingsObj.createEmbeddings(flattenedChunks!)

        const doc = {
            'filename': filename,
            'chunks': chunks,
            'embeddings': docEmbeddings
        }

        this.documentWithEmbeddings = doc // TODO: for classes do I need to set this or just return as normal?
        return doc
    }
}