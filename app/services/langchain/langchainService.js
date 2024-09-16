const LangChainClient = require("./langchainClient");
const PineconeStore = require("../../repository/vectorStores/pineconeStore");
const {OpenAIEmbeddings} = require("@langchain/openai");
const pineconeService = require("../pinecone/pineconeService");
const LangchainClient = require("./langchainClient");
let langchainInstance = null;

const initLangchainClient = async () => {
    const pineconeStore = new PineconeStore(new OpenAIEmbeddings({ apiKey: process.env.OPENAI_API_KEY }));

    await pineconeService.checkAndCreatePineconeIndex(process.env.PINECONE_INDEX);

    langchainInstance = LangchainClient.getInstance(pineconeStore);
    return langchainInstance;
};

const processQuery = async function (query) {
    try {
        return await langchainInstance.getResponse(query);
    } catch (error) {
        console.error('Error processing query:', error);
        return "An error occurred while processing the query.";
    }
}

const storeWebsiteContentInPinecone = async function (normalizedUrl, title, paragraphs) {
    try {
        const content = [normalizedUrl, title].concat(paragraphs).join("\n");
        const metadata = { title, url: normalizedUrl, text: paragraphs.join("\n") };
        await langchainInstance.saveData(content, metadata, {ids : [normalizedUrl]});
        console.log('Stored embedding for:', normalizedUrl);
    } catch (error) {
        console.error('Error storing website content in Pinecone:', error);
    }
}

module.exports = {
    processQuery: processQuery,
    storeWebsiteContentInPinecone: storeWebsiteContentInPinecone,
    initLangchainClient : initLangchainClient
}
