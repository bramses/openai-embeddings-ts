import express from "express";
const app = express();
const port = 8080; // default port to listen
import { writeObsidianDocumentToPostgres, findAllObsidianDocuments, ObsidianFactory, returnTopResult, findObsidianDocumentByFilename, updateObsidianDocument } from '../src/obsidian/utils'
import { embedQuery } from '../src/utils'
import moment from "moment";

import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client'
const prismaClient = new PrismaClient({
    log: [
      {
        emit: 'event',
        level: 'query',
      },
      {
        emit: 'stdout',
        level: 'error',
      },
      {
        emit: 'stdout',
        level: 'info',
      },
      {
        emit: 'stdout',
        level: 'warn',
      },
    ],
  });

prismaClient.$on('query', (e:any) => {
    console.log('Query: ' + e.query)
    console.log('Duration: ' + e.duration + 'ms')
  })

const obsidianRootPath = process.env.OBSIDIAN_ROOT_PATH;

app.use(express.json());

// define a route handler for the default home page
app.get( "/", ( req, res ) => {
    // render the index template
    res.send( "Hello world!" );
} );

app.post('/obsidian', async (req, res) => {
    try {
        const filename = req.body.filename;
        const oldFilename = req.body.oldFilename;
        const dontUpdate = req.body.dontUpdate; // a flag to not update existing files
        let document
        if (oldFilename) {
            document = await findObsidianDocumentByFilename(prismaClient, obsidianRootPath + oldFilename)
        } else {   
            document = await findObsidianDocumentByFilename(prismaClient, obsidianRootPath + filename)
        }
        if (document) {
            if (dontUpdate) res.status(201).send(document);
            const obsidianInstance = await ObsidianFactory(process.env.API_KEY!, obsidianRootPath + filename);
            let saved
            if (oldFilename) {
                saved = await updateObsidianDocument(prismaClient, obsidianRootPath + filename, obsidianInstance.doc, obsidianRootPath + oldFilename);
            } else {
                saved = await updateObsidianDocument(prismaClient, obsidianRootPath + filename, obsidianInstance.doc);
            }
            
            res.send(saved);
        } else {
            const obsidianInstance = await ObsidianFactory(process.env.API_KEY!, obsidianRootPath + filename);
            const saved = await writeObsidianDocumentToPostgres(prismaClient, obsidianInstance.doc);
            res.send(saved);
        }
    } catch (err) {
        console.error(err)
        res.status(500).send(err);
    }
})

app.get('/files', async (req, res) => {
    try {
        const files = await findAllObsidianDocuments(prismaClient);
        res.send(files.map((file) => {
            return {
                filename: file.filename,
                updatedAt: moment(file.updatedAt).format('LLLL')
            }
        }));
    } catch (err) {
        res.status(500).send(err);
    }
})

app.post('/query', async (req, res) => {
    try {
        const queries = [req.body.query];
        const queryEmbedding = await embedQuery(queries, 'babbage-search-query', process.env.API_KEY!)
        const allDocsDB = await findAllObsidianDocuments(prismaClient);
        console.log(allDocsDB.length)
        const docs = allDocsDB!.map((doc) => {
            const remappedTypeForTS = doc.doc as {
                filename: string;
                chunks: string[][];
                embeddingsResponse: {
                    embeddings: number[][];
                    text: string[];
                };
            }
            return remappedTypeForTS
        }).filter((doc) => {
            return doc.embeddingsResponse && doc.embeddingsResponse.embeddings.length > 0
        })
        const top_result = returnTopResult(docs, queryEmbedding!, queries)
        res.status(200).send(top_result);
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
})

// start the express server
app.listen( port, () => {
    // tslint:disable-next-line:no-console
    console.log( `server started at http://localhost:${ port }` );
} );