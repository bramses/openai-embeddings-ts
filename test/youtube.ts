import * as dotenv from 'dotenv';
import Youtube from '../src/youtube';

dotenv.config();

const apiKey = process.env.API_KEY;


const transcript = [{'text': 'Everybody buonasera, good evening,\nit is a pleasure, honor to host and', 'start': 6.54, 'duration': 9.15}, {'text': 'present this event for Algorand tonight.\nThank you very much for being here. My', 'start': 15.69, 'duration': 5.13}, {'text': "name is Nicola Santoni, I'm principal\nof Lemniscap is a blockchain", 'start': 20.82, 'duration': 4.64}, {'text': "investments and advisory firm out of Hong\nKong. I'm so excited to listen what the", 'start': 25.46, 'duration': 7.15}, {'text': "speaker of tonight is gonna tell us so\nI'm gonna be very, very brief. If we, we", 'start': 32.61, 'duration': 5.58}, {'text': 'are here for sure we share the same\nvision. We believe the in the social and', 'start': 38.19, 'duration': 10.619}, {'text': 'societal impact that this technology\nwill enable. I think we we all believe', 'start': 48.809, 'duration': 7.371}, {'text': 'this is the second business model for\nInternet, where the value, the wealth is', 'start': 56.18, 'duration': 7.29}, {'text': 'gonna be distributed to the network.\nOwners to the network actors, we', 'start': 63.47, 'duration': 9.61}, {'text': 'believe in expanding the design space\nallowing is us to accrue from this', 'start': 73.08, 'duration': 7.65}]


const main2 = async () => {
    const yt = new Youtube(apiKey!)
    yt.setTranscript(transcript)
    yt.setVideoId('_Y8dQOcYBhM')
    await yt.setTranscriptEmbeddings()
    console.log(yt.embeddings.embeddings.length)
    console.log(yt.videoId)
  }
  
  main2()