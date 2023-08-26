const FileParserFactory = require('../parsers/fileParserFactory');
const { v4: uuidv4 } = require('uuid');


class ChatOperationsController {
    constructor(dependencies, chatID = undefined) {
        this.chatID = chatID ? chatID : uuidv4() // if chatID is not passed, create a unique ID 
        this.fileParserFactory = new FileParserFactory();
        this.embeddingTransform = dependencies.embeddingTransform;
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


    async addVector (embedPromise)  {
        const { embeddedSentence, sentence} = await embedPromise;
        return await this.dbAdapter.addVector(this.chatID, {embeddedSentence, sentence}) // redis implementation
    };


    async vectorSearchAnswerForQuery(stringQuery) {
        const stringAnswer = await this.dbAdapter.findAnswerForQuery(stringQuery, this.chatID, 3);

        this.dbAdapter.addChatMessage(this.chatID, stringQuery);
        this.dbAdapter.addChatMessage(this.chatID, stringAnswer);

        return {stringQuery, stringAnswer}
    }

    async getChatMessages(lastMessageIndex, numberOfMessages) {
        return await this.dbAdapter.getMessagesByMessageIndex(this.chatID, lastMessageIndex, numberOfMessages)
    }
}

module.exports = ChatOperationsController;
;





