const DB =require('./db');
const crypto =  require('crypto');
const { SchemaFieldTypes, VectorAlgorithms } = require('redis');
const KeyStructureManager = require('./keyStructureManager')

class DBAdapter  {
    constructor(embeddingTransform) {
        this.db = new DB();
        this.keyStructureManager = new KeyStructureManager();
        this.embeddingTransform = embeddingTransform;
    }

    async connect(){
        await this.db.connect();
    }

    async createChatIndex(chatID) {
        const indexName = this.keyStructureManager.getVectorIndexKey(chatID);
        const keyPrefix = this.keyStructureManager.getVectorKeysPrefix(chatID);

        console.log(indexName, keyPrefix)
        const vectorIndexFieldParams = {
            'text': {
                type: SchemaFieldTypes.TEXT,
                AS: 'text',
              },
              
            'vector': {
                type: SchemaFieldTypes.VECTOR,
                ALGORITHM: VectorAlgorithms.HNSW,
                TYPE: 'FLOAT64',
                DIM:512,
                DISTANCE_METRIC: 'COSINE'
            }};
        const vectorIndexAdditionalParams = {
            ON: 'HASH',
            PREFIX: keyPrefix
         }

        await this.db.createIndex(indexName, vectorIndexFieldParams, vectorIndexAdditionalParams);
    }

    async addVector(chatID, embeddingObject) {        
        const { embeddedSentence, sentence } = embeddingObject;
        const arrayVector = this.convertEmbeddingToFloat64(embeddedSentence);
        const vectorHash = this._hashVector(embeddedSentence);
        const vectorKey = this.keyStructureManager.getVectorKey(chatID, vectorHash);
        
        try {
            await this.createChatIndex(chatID);
        }

        catch(e) {
            console.log(e);
        }

        await this.db.addToHash(vectorKey, 'vector', arrayVector);
        await this.db.addToHash(vectorKey, 'text', sentence);
    }

    convertEmbeddingToFloat64(vectorEmbedding) {
        const arrayFloat64 = vectorEmbedding.arraySync()[0];
        return Buffer.from(new Float64Array(arrayFloat64).buffer);
    }

    async addChatMessage(chatID, message) {
        const key = this.keyStructureManager.getMessageStorageKey(chatID);
        await this.db.addToList(key, message); 
    }

    async findAnswerForQuery(stringQuery, chatID, numberOfResults) {
        const indexKey =  this.keyStructureManager.getVectorIndexKey(chatID);
        const { embeddedSentence } = await this.embeddingTransform.embed(stringQuery);
        const searchableVector = this.convertEmbeddingToFloat64(embeddedSentence);

        return await this.db.vectorSearch(searchableVector, indexKey, numberOfResults, 'vector', ['text'])
    }

    async getMessagesByMessageIndex(chatID,  indexLast, numberOfMessages) {
        const messageKeyStorage = this.keyStructureManager.getMessageStorageKey(chatID);
        const messages = await this.db.getFromListByIndex(messageKeyStorage, indexLast, numberOfMessages);
        return messages;
    }

    quit() {
        this.db.quit();
    }

    _hashVector(vectorEmbedding) {
        const buffer = vectorEmbedding.dataSync();
        const hashedValue = crypto.createHash('sha256').update(buffer).digest('hex');
        return hashedValue;
    }

}

module.exports = DBAdapter;