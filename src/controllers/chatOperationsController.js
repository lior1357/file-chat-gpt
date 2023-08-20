const FileParserFactory = require('../parsers/fileParserFactory');
const VectorIndex = require('../vectorSimilaritySearch');
const { v4: uuidv4 } = require('uuid');


class ChatOperationsController {
    constructor(dependencies, chatID = undefined) {
        this.chatID = chatID ? chatID : uuidv4() // if chatID is not passed, create a unique ID 
        this.fileParserFactory = new FileParserFactory();
        this.embeddingTransform = dependencies.embeddingTransform;
        this.vectorToSentenceMapperAdapter = dependencies.vectorToSentenceMapperAdapter;
        this.chatToVectorIndexMapperAdapter = dependencies.chatToVectorIndexMapperAdapter;
        this.redisFlag = dependencies.redisToggle;
        this.vectorIndex = dependencies.redisToggle ?  undefined: this.getVectorIndex();
        this.messageStorage = dependencies.messageStorage;
        this.dbAdapter = dependencies.dbAdapter;
    }

    async loadFile(filePath) {
        const file = this.fileParserFactory.getParser(filePath, this.chatID);
        const splittedFileAsyncGenerator = file.splitFileToSentenceAsyncGenerator();
        const loadingPromises = []
        
        for await(const stringSentence of splittedFileAsyncGenerator) {
            const embedPromise = this.embeddingTransform.embed(stringSentence);
            const dbInsertionPromise = this.addVector(embedPromise);
            loadingPromises.push(dbInsertionPromise);
        }
                
        await Promise.all(loadingPromises);
    }

    getVectorIndex() {
        if (this.chatToVectorIndexMapperAdapter.hasKey(this.chatID))
            return this.chatToVectorIndexMapperAdapter.get(this.chatID);
        
        return new VectorIndex(this.embeddingTransform);
    }


    async addVector (embedPromise)  {
        const { embeddedSentence, sentence} = await embedPromise;
        if (this.redisFlag) {
            return await this.dbAdapter.addVector(this.chatID, {embeddedSentence, sentence}) // redis implementation
        }
        
        await this.vectorIndex.add(embeddedSentence);
        
        if (!this.chatToVectorIndexMapperAdapter.hasKey(this.chatID)) {
            await this.chatToVectorIndexMapperAdapter.add(this.chatID, this.vectorIndex)
        }
        
        return this.vectorToSentenceMapperAdapter.add(embeddedSentence, sentence); //map sentence to vector
    };


    async vectorSearchAnswerForQuery(stringQuery) {
        if(this.redisFlag) {
            const vectorSearchResults = await this.dbAdapter.findAnswerForQuery(stringQuery, this.chatID, 3);
            const documents = vectorSearchResults.documents;
            const stringAnswerArray = documents.map((document) => document['value']['text'])
            const stringAnswer = stringAnswerArray.join('\n')
            this.dbAdapter.addChatMessage(this.chatID, stringQuery);
            this.dbAdapter.addChatMessage(this.chatID, stringAnswer);
            return {stringQuery, stringAnswer}
        }

        const vectorSearchResults =  await this.vectorIndex.search(stringQuery, 2); //searching for answer to query
        const stringifiedSearchResults = vectorSearchResults.map((embedding) => this.vectorToSentenceMapperAdapter.get(embedding));
        const answerArray = await Promise.all(stringifiedSearchResults);
        const stringAnswer = answerArray.join('\n');
        this.messageStorage.add(this.chatID, stringQuery); //adding user query to the message storage
        this.messageStorage.add(this.chatID, stringAnswer);
        
        return {stringQuery, stringAnswer};
    }
}

module.exports = ChatOperationsController
;





