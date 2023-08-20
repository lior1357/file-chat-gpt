const ChatOperationsControllerCache = require('./chatCache');
const Mapper = require('./db-utils/data-structures/hashMap');
const ListMapper = require('./db-utils/data-structures/listHashMap');
const MapperAdapter = require('./db-utils/mapperAdapter');
const DBAdapter = require('./db-utils/dbAdapter')
const config = require('./config');
const universalSentenceEncoder = require('@tensorflow-models/universal-sentence-encoder');
const EmbeddingTransform = require('./transformers/embeddingTransform');

let chatOperationsControllerCache;


// console.log(embeddedFile)
async function loadFile(chatID, filePath) {
    const chatOperationsController = chatOperationsControllerCache.getController(chatID);
    return await chatOperationsController.loadFile(filePath);
}

async function loadModel() {
    const universalSentenceEncoderModel = await universalSentenceEncoder.load()
    return universalSentenceEncoderModel
}

async function search(chatID, query) {
    const chatOperationsController = chatOperationsControllerCache.getController(chatID);
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
    const dbAdapter = new DBAdapter(embeddingTransform);
    await dbAdapter.connect()

    return { messageStorage, vectorToSentenceMapperAdapter, chatToVectorIndexMapperAdapter, embeddingTransform, dbAdapter }
}

async function searchTest() {
    const chatDependencies = await initializeChatDependencies();
    chatOperationsControllerCache = new ChatOperationsControllerCache(chatDependencies);
    const chat1 = chatOperationsControllerCache.getController();
    // const chat2 = chatOperationsControllerCache.getController();

    await loadFile(chat1.chatID, config.filePath);
    // await loadFile(chat1.chatID, config.filePath2);
    
    await search(chat1.chatID, "tell me about that volunteer state");
    await search(chat1.chatID, "What are the essays based on?");
    chatDependencies.dbAdapter.quit()
}




searchTest();