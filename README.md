# openai-embeddings-ts

In its current state, the project sits alongside the Obsidian folder. Meaning, I'm using node.js to go to my Obsidian root folder and read all the markdown files. From there it chunks and embeds them as vectors with OpenAI embeddings (https://beta.openai.com/docs/guides/embeddings/what-are-embeddings). Then I store those vectors in a local database (I went with Postgres https://www.postgresql.org/ but you could do anything that holds data like Mongo, Firebase, etc). To query, I wrote an endpoint that is like a Google Search Bar. You type what you want, and it gets converted into a vector itself (using OpenAI for this as well) and then it uses cosine similarity (https://en.wikipedia.org/wiki/Cosine_similarity) to find the best matches

**very much WIP state!**

## installation

git clone this repo -> `npm install` -> copy values from `.env.example` into `.env`

## usage

`POST /obsidian` - add a new Obsidian Markdown file to the database
`POST /query` - search all vectors in the database
`GET /files` - list all files in database

## what is semantic search

semantic similarity is kind of like searching with a thesaurus, but instead of looking for synonyms you are looking for similar items. An example: the word "apple" can refer to the fruit or the technology, it depends on the context you feed it. If I said "pass me an apple" 9 times out of 10 I'd expect the fruit instead of a computer. If I said "Can I borrow your charger for my apple device?" you'd know I'm referring to the technology, even though the word "apple" is the same. 

The critical thing here is context. Semantic search understands how things are related (CS PHDs call it clustering). This search opens the door to searching for items contextually, meaning people no longer need to know an exact term in a database just something like "laptop" or "fruit" to get all instances of "apple" in the database
