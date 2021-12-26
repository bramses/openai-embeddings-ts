import * as dotenv from 'dotenv';
import { chunkDocument, readFile } from '../src/utils'
dotenv.config();

const main = async () => {
    const txt = await readFile('../../src/obsidian/12-25-21.md')
    console.log(txt
        .split('\n')
        .filter(line => line.length > 0)
        .map(line => line.trim())
        .map(doc => chunkDocument(doc))
        .forEach(chunk => console.log(chunk[0]))
    )
}

main()