const Mapper = require('./db-utils/data-structures/hashMap');
const ListMapper = require('./db-utils/data-structures/listHashMap');
const MapperAdapter = require('./db-utils/mapperAdapter');
const DBAdapter = require('./db-utils/dbAdapter');
const config = require('./config/config.json');
const toggleManager = require('./config/toggleManager.json');
const universalSentenceEncoder = require('@tensorflow-models/universal-sentence-encoder');
const EmbeddingTransform = require('./transformers/embeddingTransform');
const ChatOperationsController = require('./controllers/chatOperationsController');
const express = require('express');

const app = express();
const PORT = 3000;


app.get("/", (req, res) => {
    res.send("Hi")
})



app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`)
})
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

    const vectorToSentenceMapper = new Mapper();
    const chatToVectorIndexMapper = new Mapper();
    const messageStorage = new ListMapper();

    const vectorToSentenceMapperAdapter = new MapperAdapter(vectorToSentenceMapper, isVectorKey=true);
    const chatToVectorIndexMapperAdapter = new MapperAdapter(chatToVectorIndexMapper);
    const loadedModel = await loadModel()
    const embeddingTransform = new EmbeddingTransform(loadedModel);

    if (toggleManager.redisToggle === true) {
        const dbAdapter = new DBAdapter(embeddingTransform);
        await dbAdapter.connect()

        return { embeddingTransform, dbAdapter, redisToggle: toggleManager.redisToggle }
    }

    return { messageStorage, vectorToSentenceMapperAdapter, chatToVectorIndexMapperAdapter, embeddingTransform, redisToggle: toggleManager.redisToggle }
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

    else{
        console.log(chatDependencies.messageStorage)
    }
    
}

searchTest();
