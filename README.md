Slack Bot with LangChain Integration
Overview
This project is a Slack bot that integrates with LangChain to provide intelligent responses based on a knowledge base stored in Pinecone. The bot listens to messages in Slack, processes them using LangChain, and creates Jira tickets if it cannot provide a relevant answer.

Features
Slack Integration: Listens to and responds to messages in Slack.
LangChain Integration: Uses LangChain to process queries and generate responses.
Pinecone for Vector Search: Stores and retrieves embeddings from Pinecone.
Jira Integration: Creates Jira tickets when relevant information is not found.

Prerequisites
Node.js (v18 or higher)
MongoDB
Pinecone Account
Jira Account
Slack App with Bot Token and App Token
Installation
Clone the Repository:

bash
Copy code
git clone https://github.com/chinu97/SlackBot.git
cd SlackBot
Install Dependencies:

bash
Copy code
npm install
Set Up Environment Variables:

Create a .env file in the root directory and add the following environment variables:

env
Copy code
SLACK_BOT_TOKEN=your-slack-bot-token
SLACK_APP_TOKEN=your-slack-app-token
OPENAI_API_KEY=your-openai-api-key
OPENAI_GPT_MODEL=your-openai-model
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX=your-pinecone-index
MONGODB_URI=your-mongodb-uri
Initialize Pinecone Index

Make sure to initialize your Pinecone index by running the appropriate script or command.

Usage
Start the Server:

bash
Copy code
npm start
Interact with the Bot:

Send messages to the Slack channel where the bot is active.
The bot will process the messages and respond with answers or create Jira tickets if necessary.
During processing, the bot will display a loading message to inform users that their request is being handled.
Code Structure
src/: Contains the main source code for the bot.
services/: Service layer handling business logic and interactions with external APIs.
slack/: Slack-related services and functionalities.
langchain/: LangChain integration and processing logic.
jira/: Jira ticket creation and management.
repository/: Repository layer for data access and storage.
vectorStores/: Implementations for vector databases like Pinecone.
slack/: MongoDB interactions related to Slack messages.
utils/: Utility functions and helpers.
index.js: Entry point for starting the bot.
Contributing
If you want to contribute to this project, please follow these steps:

Fork the repository.
Create a new branch (git checkout -b feature/YourFeature).
Commit your changes (git commit -am 'Add new feature').
Push to the branch (git push origin feature/YourFeature).
Create a new Pull Request.
License
This project is licensed under the MIT License - see the LICENSE file for details.

Acknowledgements
LangChain
Pinecone
Jira
Slack API
