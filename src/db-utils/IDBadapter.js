
class IDBAdapter {

    constructor(embeddingTransform) {
        this.embeddingTransform = embeddingTransform;
    }

    async  addVector() {
        throw new Error("addVector() method is not implemented")
    }

    async createChatIndex(chatID) {
        throw new Error("createChatIndex() method is not implemented")
    }

    async addVector(chatID, embeddingObject) {        
        throw new Error("addVector() method is not implemented")
       
    }

    async addChatMessage(chatID, message) {
        throw new Error("addChatMessage() method is not implemented")
    }

    async findAnswerForQuery(stringQuery, chatID, numberOfResults) {
        throw new Error("findAnswerForQuery() method is not implemented")
    }

    async getMessagesByMessageIndex(chatID,  indexLast, numberOfMessages) {
        throw new Error("getMessagesByMessageIndex() method is not implemented")
    }

    _hashVector(vectorEmbedding) {
        const buffer = vectorEmbedding.dataSync();
        const hashedValue = crypto.createHash('sha256').update(buffer).digest('hex');
        return hashedValue;
    }
}

module.exports = IDBAdapter;