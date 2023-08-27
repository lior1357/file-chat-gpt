
const DBAdapter = require('./db-utils/dbAdapter');
const ObjectDBAdapter = require('./db-utils/objectDBAdapter');
const config = require('./config/config.json');
const toggleManager = require('./config/toggleManager.json');
const universalSentenceEncoder = require('@tensorflow-models/universal-sentence-encoder');
const EmbeddingTransform = require('./transformers/embeddingTransform');
const ChatOperationsController = require('./controllers/chatOperationsController');
const {loadFile, findAnswerForQuery, getMessages} = require('./routes/chat');


const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({extended: true})) 
app.use(bodyParser.json())

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`)
})

initRoutes().then(console.log("routes initizalized"))



async function loadModel() {
    const universalSentenceEncoderModel = await universalSentenceEncoder.load()
    return universalSentenceEncoderModel
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
        dbAdapter = new ObjectDBAdapter(embeddingTransform);
    }

    return { embeddingTransform, dbAdapter } 
}


async function initRoutes() {
    const dependencies = await initializeChatDependencies();
    app.post('/chat/load', loadFile(dependencies));
    app.get('/chat/:chatID', findAnswerForQuery(dependencies));
    app.get('/chat/:chatID/messages', getMessages(dependencies));
}


// searchTest();

// async function search(chatDependencies, chatID, query) {
//     const chatOperationsController = new ChatOperationsController(chatDependencies, chatID);
//     await chatOperationsController.findAnswerForQuery(query);
// }



// async function loadFileTest(chatDependencies, chatID, filePath) {
//     const chatOperationsController = new ChatOperationsController(chatDependencies, chatID);
//     return await chatOperationsController.loadFile(filePath);
// }


// async function searchTest() {
//     const chatDependencies = await initializeChatDependencies();
//     const chat1 = new ChatOperationsController(chatDependencies);
//     const chat2 = new ChatOperationsController(chatDependencies);

//     console.log(config.filePath2)

//     await loadFileTest(chatDependencies, chat1.chatID, config.filePath);
//     await loadFileTest(chatDependencies, chat2.chatID, config.filePath2);
    
//     await search(chatDependencies, chat1.chatID, "tell me about that volunteer state");
//     await search(chatDependencies, chat2.chatID, "What are the essays based on?");
//     const chatMessagesChat1 = await chat1.getChatMessages(1, 2);
//     console.log(chatMessagesChat1);
    
//     const chatMessagesChat2 = await chat2.getChatMessages(1, 2);
//     console.log(chatMessagesChat2);

//     if(toggleManager.redisToggle) {
//         chatDependencies.dbAdapter.quit()
//     }
// }
