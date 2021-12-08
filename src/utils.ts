export function createEndpoint(engine: string): string {
    switch (engine) {
        case 'ada-similarity':
            engine = 'ada-similarity';
            break;
        case 'babbage-similarity':
            engine = 'babbage-similarity';
            break;
        case 'curie-similarity':
            engine = 'curie-similarity';
            break;
        case 'davinci-similarity':
            engine = 'davinci-similarity';
            break;
        case 'ada-search-document':
            engine = 'ada-search-document';
            break;
        case 'ada-search-query':
            engine = 'ada-search-query';
            break;
        case 'babbage-search-document':
            engine = 'babbage-search-document';
            break;
        case 'babbage-search-query':
            engine = 'babbage-search-query';
            break;
        case 'curie-search-document':
            engine = 'curie-search-document';
            break;
        case 'curie-search-query':
            engine = 'curie-search-query';
            break;
        case 'ada-code-search-code':
            engine = 'ada-code-search-code';
            break;
        case 'ada-code-search-text':
            engine = 'ada-code-search-text';
            break;
        case 'babbage-code-search-code':
            engine = 'babbage-code-search-code';
            break;
        case 'babbage-code-search-text':
            engine = 'babbage-code-search-text';
            break;
        default:
            engine = 'ada-similarity';
            break;
    }
    return `https://api.openai.com/v1/engines/${engine}/embeddings`;
}