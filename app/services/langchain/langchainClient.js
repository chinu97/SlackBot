const { ChatOpenAI } = require('@langchain/openai');
const { ChatPromptTemplate } = require('@langchain/core/prompts');
const { RunnableSequence, RunnablePassthrough } = require('@langchain/core/runnables');

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
        console.log('LangChainClient initialized.');
    }

    static getInstance(vectorDbStore) {
        if (!LangchainClient.instance) {
            LangchainClient.instance = new LangchainClient(vectorDbStore);
        }
        return LangchainClient.instance;
    }

    async getResponse(query) {
        console.log('Starting response generation for query:', query);

        const ragChain = RunnableSequence.from([
            {
                question: new RunnablePassthrough(),
                context: async (input) => {
                    try {
                        const results = await this.vectorDbStore.similaritySearch(input.question, 10);
                        console.log('Similarity search completed. Number of results:', results.length);
                        const context = results.map(match => match.pageContent).join('\n');
                        return context;
                    } catch (error) {
                        console.error('Error during similarity search:', error.message);
                        return "Error retrieving information from the knowledge base.";
                    }
                },
            },
            async (input) => {
                return { ...input, question: input?.question?.question };
            },
            this.prompt,
            this.llm
        ]);

        try {
            const response = await ragChain.invoke({ question: query });
            console.log('Response generated successfully from ragchain.');
            const content = response?.content;
            return content;
        } catch (error) {
            console.error('Error during response generation:', error.message);
            return "Error generating response.";
        }
    }

    async saveData(data, metadata, params) {
        console.log('Saving data to vector store with metadata:', metadata);

        try {
            const document = { pageContent: data, metadata: metadata };
            await this.vectorDbStore.addDocuments([document], params);
            console.log('Data saved successfully.');
        } catch (error) {
            console.error('Error saving data to vector store:', error.message);
        }
    }
}

module.exports = LangchainClient;
