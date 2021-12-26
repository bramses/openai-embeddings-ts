import * as dotenv from 'dotenv';
import { chunkDocument, readFile } from '../src/utils'
dotenv.config();
const obsidianRootPath = process.env.OBSIDIAN_ROOT_PATH;

const main = async () => {
    const txt = await readFile(obsidianRootPath + 'Daily/2021-12-25.md', true)
    console.log(txt
        .split('\n')
        .filter(line => line.length > 0)
        .map(line => line.trim())
        .map(doc => chunkDocument(doc))
        .forEach(chunk => console.log(chunk[0]))
    )
}

main()