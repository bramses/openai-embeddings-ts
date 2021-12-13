import Embeddings from '../src/index';
import * as dotenv from 'dotenv';
import { embedQuery, processData, search, fetchDataFromOriginal } from '../src/utils'
dotenv.config();

const apiKey = process.env.API_KEY;
const transcript = [{'text': 'Everybody buonasera, good evening,\nit is a pleasure, honor to host and', 'start': 6.54, 'duration': 9.15}, {'text': 'present this event for Algorand tonight.\nThank you very much for being here. My', 'start': 15.69, 'duration': 5.13}, {'text': "name is Nicola Santoni, I'm principal\nof Lemniscap is a blockchain", 'start': 20.82, 'duration': 4.64}, {'text': "investments and advisory firm out of Hong\nKong. I'm so excited to listen what the", 'start': 25.46, 'duration': 7.15}, {'text': "speaker of tonight is gonna tell us so\nI'm gonna be very, very brief. If we, we", 'start': 32.61, 'duration': 5.58}, {'text': 'are here for sure we share the same\nvision. We believe the in the social and', 'start': 38.19, 'duration': 10.619}, {'text': 'societal impact that this technology\nwill enable. I think we we all believe', 'start': 48.809, 'duration': 7.371}, {'text': 'this is the second business model for\nInternet, where the value, the wealth is', 'start': 56.18, 'duration': 7.29}, {'text': 'gonna be distributed to the network.\nOwners to the network actors, we', 'start': 63.47, 'duration': 9.61}, {'text': 'believe in expanding the design space\nallowing is us to accrue from this', 'start': 73.08, 'duration': 7.65}]
const queries = ['algorand', 'italy']

const main = async () => {
    const embeddings = new Embeddings(apiKey!)
    embeddings.setEngine('babbage-search-document')
    const transcriptData = processData(transcript, 'text');
    const docEmbeddings = await embeddings.createEmbeddings(transcriptData.text)
    embeddings.writeEmbeddings(docEmbeddings!, './test/test.json')
    const queryEmbedding = await embedQuery(queries, 'babbage-search-query', apiKey!)
    const results = await search(docEmbeddings!.embeddings, queryEmbedding!.embeddings, 3)

    results.forEach((result, idx: number) => {
      console.log(`qry: ${queries[idx]}`)
      const highest = fetchDataFromOriginal(transcriptData, result![0]!['index'])
      console.log(highest)
    })
}

main()