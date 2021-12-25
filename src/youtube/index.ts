// youtube transcript search
import Embeddings from '../../src/index';
import { processData, EmbeddingsResponse } from '../../src/utils'


export default class Youtube {
  private apiKey: string;
  tag: string;
  videoId: string;
  transcript:{ text: string, start: number, duration: number }[] = [];
  transcriptText: string[];
  embeddingsObj: Embeddings;
  embeddings: EmbeddingsResponse;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.tag = 'youtube';
    
    this.embeddingsObj = new Embeddings(this.apiKey);
    this.embeddingsObj.setEngine('babbage-search-document');
  }


  setVideoId(videoId: string) {
    this.videoId = videoId;
  }

  setTranscript(transcript: { text: string, start: number, duration: number }[]) {
    this.transcript = transcript;
    this.setTranscriptText();
  }

  private setTranscriptText () {
    const processed = processData(this.transcript, 'text');
    this.transcriptText = processed.text;
  }

  async setTranscriptEmbeddings () {
    const res = await this.embeddingsObj.createEmbeddings(this.transcriptText);
    if (res) {
      this.embeddings = res;
    }
  }
}

