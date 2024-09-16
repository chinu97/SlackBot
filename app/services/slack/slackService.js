const slackRepository = require("../../repository/slack/slackRepository");
const langchainService = require("../langchain/langchainService");
const jiraService = require("../jira/jiraService");
async function isMessageProcessed(messageId) {
    const message = await slackRepository.findMessageById(messageId)
    return !!message;
}

async function saveProcessedMessage(message) {
    await slackRepository.saveMessage(message);
}

const handleLLMResponse = async (response, messageText) => {
    if (response.startsWith('JIRA_TICKET_NEEDED')) {
        const ticketReason = response.replace('JIRA_TICKET_NEEDED', '').trim();
        const jiraTicket = await jiraService.createJiraTicket(messageText, ticketReason);
        return `I don't have enough information to answer that question. A Jira ticket has been created to address this: ${jiraTicket.key}. Reason: ${ticketReason}`;
    }
    return response;
};

const processMessage = async (message, client) => {
    try {
        // Check if the message has already been processed
        const processed = await isMessageProcessed(message.ts);
        if (processed) {
            console.log('Message already processed:', message.ts);
            return;
        }

        const loadingMessage = await client.chat.postMessage({
            channel: message.channel,
            text: 'Processing your request... Please hold on.',
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: 'Processing your request... Please hold on.'
                    }
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: ':hourglass_flowing_sand: Please wait while we process your request.'
                    }
                }
            ]
        });

        // Process the message with LangChain
        let llmResponse = await langchainService.processQuery(message.text);

        // Handle Jira ticket creation if needed
        llmResponse = await handleLLMResponse(llmResponse, message.text);

        // Update the initial message with the final response
        await client.chat.update({
            channel: message.channel,
            ts: loadingMessage.ts,
            text: llmResponse,
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: llmResponse
                    }
                }
            ]
        });

        // Save the processed message
        await saveProcessedMessage(message);

    } catch (error) {
        console.error('Error handling message:', error);
        await client.chat.update({
            channel: message.channel,
            ts: message.ts,
            text: 'An error occurred while processing your request.',
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: 'An error occurred while processing your request.'
                    }
                }
            ]
        });
    }
};

module.exports = {
    processMessage : processMessage
}
