const FileParserFactory = require('../parsers/fileParserFactory');
const EmbeddingTransform = require('../transformers/embeddingTransform');
const VectorIndex = require('../vectorSimilaritySearch');
const { v4: uuidv4 } = require('uuid');


class ChatOperationsController {
    constructor(dependencies, chatID = undefined) {
        this.chatID = chatID ? chatID : uuidv4() // if chatID is not passed, create a unique ID 
        this.fileParserFactory = new FileParserFactory();
        this.embeddingTransform = dependencies.embeddingTransform;
        // this.vectorToSentenceMapperAdapter = dependencies.vectorToSentenceMapperAdapter;
        // this.chatToVectorIndexMapperAdapter = dependencies.chatToVectorIndexMapperAdapter;
        // this.vectorIndex = this.getVectorIndex();
        // this.messageStorage = dependencies.messageStorage;
        this.dbAdapter = dependencies.dbAdapter;
    }

    async loadFile(filePath) {
        const file = this.fileParserFactory.getParser(filePath, this.chatID);
        const splittedFileAsyncGenerator = file.splitFileToSentenceAsyncGenerator();
        const loadingPromises = []
        
        for await(const stringSentence of splittedFileAsyncGenerator) {
            const embedPromise = this.embeddingTransform.embed(stringSentence);
            const dbInsertionPromise = this.mapVectorToString(embedPromise);
            // const addVectorToIndexPromise = this.addVectorToIndex(embedPromise);
            loadingPromises.push(dbInsertionPromise);
            // loadingPromises.push(addVectorToIndexPromise);
        }
                
        await Promise.all(loadingPromises);
    }

    getVectorIndex() {
        if (this.chatToVectorIndexMapperAdapter.hasKey(this.chatID))
            return this.chatToVectorIndexMapperAdapter.get(this.chatID);
        
        return new VectorIndex(this.embeddingTransform);
    }


    async mapVectorToString (embedPromise)  {
        const { embeddedSentence, sentence} = await embedPromise;
        return await this.dbAdapter.addVector(this.chatID, {embeddedSentence, sentence}) // redis implementation
        
        // return this.vectorToSentenceMapperAdapter.add(embeddedSentence, sentence);
    };

    // async addVectorToIndex(embedPromise) { 
    //     const { embeddedSentence } = await embedPromise;
        
    //     const vectorToAdd = await this.vectorIndex.add(embeddedSentence);
        
    //     if (!this.chatToVectorIndexMapperAdapter.hasKey(this.chatID)) {
    //         await this.chatToVectorIndexMapperAdapter.add(this.chatID, this.vectorIndex)
    //     }
        
    //     return vectorToAdd;
    // }

    async vectorSearchAnswerForQuery(stringQuery) {
        // const vectorSearchResults =  await this.vectorIndex.search(stringQuery, 2); //searching for answer to query
        const redisVectorSearchResults = await this.dbAdapter.findAnswerForQuery(stringQuery, this.chatID, 3);
        const documents = redisVectorSearchResults.documents;
        console.log(documents)
        console.log(redisVectorSearchResults)
        for (let a in redisVectorSearchResults) {
            console.log(a, redisVectorSearchResults[a])
        }

        // const stringifiedSearchResults = redisVectorSearchResults.map(() => redisVectorSearchResults['value'])
        // const stringifiedSearchResults = vectorSearchResults.map((embedding) => this.vectorToSentenceMapperAdapter.get(embedding));

        const answerArray = await Promise.all(stringifiedSearchResults);
        const stringAnswer = answerArray.join('\n');

        // this.messageStorage.add(this.chatID, stringQuery); //adding user query to the message storage
        // this.messageStorage.add(this.chatID, stringAnswer);

        this.dbAdapter.addChatMessage(this.chatID, stringQuery);
        this.dbAdapter.addChatMessage(this.chatID, stringAnswer);

        return stringAnswer;
    }
}

module.exports = ChatOperationsController
;





