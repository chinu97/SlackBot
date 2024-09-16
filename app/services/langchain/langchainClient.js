const { ChatOpenAI } = require('@langchain/openai');
const { ChatPromptTemplate } = require('@langchain/core/prompts');
const { RunnableSequence, RunnablePassthrough } = require('@langchain/core/runnables');
const jiraService = require('../../services/jira/jiraService');

class LangchainClient {
    static instance = null;

    constructor(vectorDbStore) {
        if (LangchainClient.instance) {
            return LangchainClient.instance;
        }
        this.vectorDbStore = vectorDbStore;
        this.llm = new ChatOpenAI({ model: process.env.OPENAI_GPT_MODEL, temperature: 0 });
        this.prompt = ChatPromptTemplate.fromMessages([
            ["system", "You are a helpful Slack assistant. Use the following context to answer the user's question. If you can't find a relevant answer in the context, respond with 'JIRA_TICKET_NEEDED' followed by a brief explanation of why a Jira ticket should be created."],
            ["human", "Context: {context}\n\nQuestion: {question}"]
        ]);
        LangchainClient.instance = this;
    }

    static getInstance(vectorDbStore) {
        if (!LangchainClient.instance) {
            LangchainClient.instance = new LangchainClient(vectorDbStore);
        }
        return LangchainClient.instance;
    }

    async getResponse(query) {
        const ragChain = RunnableSequence.from([
            {
                question: new RunnablePassthrough(),
                context: async (input) => {
                    try {
                        const results = await this.vectorDbStore.similaritySearch(input.question, 10);
                        const context = results.map(match => match.pageContent).join('\n');
                        return context;
                    } catch (error) {
                        console.error('Error during similarity search:', error);
                        return "Error retrieving information from the knowledge base.";
                    }
                },
            },
            async (input) => {
                return { ...input, question: input.question.question };
            },
            this.prompt,
            this.llm
        ]);

        const response = await ragChain.invoke({ question: query });
        const content = response?.content;
        return content;
    }

    async saveData(data, metadata, params) {
        const document = { pageContent: data, metadata: metadata };
        await this.vectorDbStore.addDocuments([document], params);
    }
}

module.exports = LangchainClient;