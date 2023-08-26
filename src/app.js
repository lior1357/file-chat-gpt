
const DBAdapter = require('./db-utils/dbAdapter');
const ObjectDBAdapter = require('./db-utils/objectDBAdapter');
const config = require('./config/config.json');
const toggleManager = require('./config/toggleManager.json');
const universalSentenceEncoder = require('@tensorflow-models/universal-sentence-encoder');
const EmbeddingTransform = require('./transformers/embeddingTransform');
const ChatOperationsController = require('./controllers/chatOperationsController');

// const express = require('express');
// const bodyParser = require('body-parser');

// const app = express();
// const PORT = 3000;

// app.use(bodyParser.urlencoded({extended: true})) 
// app.use(bodyParser.json())

// app.listen(PORT, () => {
//     console.log(`Listening on port ${PORT}...`)
// })

// initRoutes().then(console.log("routes initizalized"))



// console.log(embeddedFile)
async function loadFile(chatDependencies, chatID, filePath) {
    const chatOperationsController = new ChatOperationsController(chatDependencies, chatID);
    return await chatOperationsController.loadFile(filePath);
}

async function loadModel() {
    const universalSentenceEncoderModel = await universalSentenceEncoder.load()
    return universalSentenceEncoderModel
}

async function search(chatDependencies, chatID, query) {
    const chatOperationsController = new ChatOperationsController(chatDependencies, chatID);
    await chatOperationsController.vectorSearchAnswerForQuery(query);
}

async function initializeChatDependencies() {
    const loadedModel = await loadModel()
    const embeddingTransform = new EmbeddingTransform(loadedModel);
    let dbAdapter

    if (toggleManager.redisToggle === true) {
        dbAdapter = new DBAdapter(embeddingTransform);
        await dbAdapter.connect()
    }
    else {
        dbAdapter = new ObjectDBAdapter(embeddingTransform)
    }

    return { embeddingTransform, dbAdapter } 
}

async function searchTest() {
    const chatDependencies = await initializeChatDependencies();
    const chat1 = new ChatOperationsController(chatDependencies);
    // const chat2 = new ChatOperationsController(chatDependencies);

    await loadFile(chatDependencies, chat1.chatID, config.filePath);
    // await loadFile(chat1.chatID, config.filePath2);
    
    await search(chatDependencies, chat1.chatID, "tell me about that volunteer state");
    await search(chatDependencies, chat1.chatID, "What are the essays based on?");
    const chatMessages = await chat1.getChatMessages(3, 2);
    console.log(chatMessages);
    
    if(toggleManager.redisToggle) {
        chatDependencies.dbAdapter.quit()
    }
}

async function initRoutes() {
    const dependencies = await initializeChatDependencies();
    app.post('/chat/load', loadFileReq(dependencies));

}


searchTest();
