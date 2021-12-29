import express from "express";
const app = express();
const port = 8080; // default port to listen
import { writeObsidianDocumentToPostgres } from '../src/obsidian/utils'
import { ObsidianFactory } from '../src/obsidian/index'

import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client'
const prismaClient = new PrismaClient();

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
        const doc = await ObsidianFactory(process.env.API_KEY!, obsidianRootPath + filename);
        const saved = await writeObsidianDocumentToPostgres(prismaClient, doc.doc);
        res.send(saved);
    } catch (err) {
        res.status(500).send(err);
    }
})

// start the express server
app.listen( port, () => {
    // tslint:disable-next-line:no-console
    console.log( `server started at http://localhost:${ port }` );
} );