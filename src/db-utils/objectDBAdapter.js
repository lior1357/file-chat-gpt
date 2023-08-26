const IDBAdapter = require('./IDBadapter');
const Mapper = require('./data-structures/hashMap');
const ListMapper = require('./data-structures/listHashMap');
const MapperAdapter = require('./mapperAdapter');
const VectorIndex = require('../vectorSimilaritySearch');


class ObjectDBAdapter extends IDBAdapter {
    constructor (embeddingTransform) {
        super();
        const vectorToSentenceMapper = new Mapper();
        const chatToVectorIndexMapper = new Mapper();
        
        this.embeddingTransform = embeddingTransform;
        this.messageStorage = new ListMapper();
        this.vectorToSentenceMapperAdapter = new MapperAdapter(vectorToSentenceMapper, true);
        this.chatToVectorIndexMapperAdapter = new MapperAdapter(chatToVectorIndexMapper);
    }


    async createChatIndex(chatID) {
        const vectorIndex =  new VectorIndex(this.embeddingTransform);
        this.chatToVectorIndexMapperAdapter.add(chatID, vectorIndex);
        return vectorIndex;
    }

    async getVectorIndex(chatID) {
        if (this.chatToVectorIndexMapperAdapter.hasKey(chatID))
            return this.chatToVectorIndexMapperAdapter.get(chatID);
        
        return await this.createChatIndex(chatID);
    }

    async addVector(chatID, embeddingObject) {        
        const {embeddedSentence, sentence} = embeddingObject;
        const vectorIndex = await this.getVectorIndex(chatID)

        await vectorIndex.add(embeddedSentence);
        
        if (!this.chatToVectorIndexMapperAdapter.hasKey(chatID)) {
            await this.chatToVectorIndexMapperAdapter.add(chatID, vectorIndex)
        }
        
        return this.vectorToSentenceMapperAdapter.add(embeddedSentence, sentence); //map sentence to vector
    }

    async addChatMessage(chatID, message) {
        this.messageStorage.add(chatID, message); //adding user query to the message storage
    }

    async findAnswerForQuery(stringQuery, chatID, numberOfResults) {
        const vectorIndex = await this.getVectorIndex(chatID);
        console.log(vectorIndex);
        const vectorSearchResults =  await vectorIndex.search(stringQuery, numberOfResults); //searching for answer to query
        const stringifiedSearchResults = vectorSearchResults.map((embedding) => this.vectorToSentenceMapperAdapter.get(embedding));
        const answerArray = await Promise.all(stringifiedSearchResults);
        const stringAnswer = answerArray.join('\n');
        return stringAnswer;
    }

    async getMessagesByMessageIndex(chatID,  indexLast, numberOfMessages) {
        return this.messageStorage.getByIndex(chatID, indexLast, numberOfMessages);
    }
}

module.exports = ObjectDBAdapter;


