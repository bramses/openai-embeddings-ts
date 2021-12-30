/* DO NOT RUN UNLESS YOU WANT ALL FILES INDEXED */
import fs, { PathLike } from 'fs'
import path from 'path'
import * as dotenv from 'dotenv';
import axios from 'axios'
const { encode } = require('gpt-3-encoder')
dotenv.config();

// https://coderrocketfuel.com/article/recursively-list-all-the-files-in-a-directory-using-node-js
const getAllFiles = function (dirPath: string, arrayOfFiles: string[] = []) {
    if (dirPath.includes('.obsidian')) return []

    const files = fs.readdirSync(dirPath)

    arrayOfFiles = arrayOfFiles || []

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
        } else {
            if (file.includes('.md')) {
                const removeRootPath = dirPath.replace(process.env.OBSIDIAN_ROOT_PATH!, '')
                const cleanedDirPath = removeRootPath.startsWith('/') ? removeRootPath.slice(1) : removeRootPath
                arrayOfFiles.push(path.join(cleanedDirPath, file))
            }
        }
    })

    return arrayOfFiles
}

const main = async () => {
    try {

        const arrayOfFiles = getAllFiles(process.env.OBSIDIAN_ROOT_PATH!)

        for (let i = 1093; i < arrayOfFiles.length; i++) {
            const filename = arrayOfFiles[i]
            console.log(`inserting ${filename}`)
            await axios.post(`http://localhost:8080/obsidian`, {filename, dontUpdate: true})
            console.log(`inserted ${filename}`)
        }

    } catch (e) {
        console.log(e)
    }
}

// main()


// if faucet gets halted this will be the last file indexed
// const arrayOfFiles = getAllFiles(process.env.OBSIDIAN_ROOT_PATH!)
// console.log(arrayOfFiles.length)
// for (let i = 0; i < arrayOfFiles.length; i++) { // faucet got halted here
//     if (arrayOfFiles[i]!.includes('turndown.md')) console.log(i)
// }
