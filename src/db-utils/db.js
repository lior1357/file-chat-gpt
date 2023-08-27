const { createClient }  = require('redis');
const redisURL = require('../config/config.json').redisURL;

class RedisDB {
    constructor() {
        this.client = createClient( {url: redisURL});
        this.client.on('error', err => console.log('Redis Client Error', err));
    }

    async connect() {
        try {
            await this.client.connect();
            console.log('Connected')
        } 
        catch(e) {
            console.error("Error connecting Redis Client", e);
        }
    }

    async addToHash(key, hashKey, hashValue) {
        await this.client.hSet(key, hashKey, hashValue)
    }

    async addToList(key, element) {
        await this.client.rPush(key, element)
    }

    async getFromListByIndex(messageStorageKey, numOfElements, indexLast=undefined) {
        let indexStart

        if (indexLast === -1) {
            return {elements: [], lastElementIndex: -1}
        }

        if (indexLast === undefined) {
            indexLast = await this.client.lLen(messageStorageKey);    
        }

        indexStart = indexLast - numOfElements < 0 ? 0 : indexLast - numOfElements
        
        console.log(indexStart, indexLast)
        const elements = await this.client.lRange(messageStorageKey, indexStart, indexLast);
        const lastElementIndex = indexStart - 1

        return { elements, lastElementIndex }
    }
    
    async createIndex(indexName, indexParams, indexAdditionalParams) {
        await this.client.ft.create(indexName, indexParams, indexAdditionalParams);
    }

    async isExists(key) {
        return await this.client.exists(key);
    }
    

    async vectorSearch(float64ArrayBufferVector,  indexKey, numberOfResults, vectorHashField, fieldsToReturn) {
        const results = this.client.ft.search(indexKey, `*=>[KNN ${numberOfResults} @${vectorHashField} $BLOB AS dist]`, {
            PARAMS: {
              BLOB: float64ArrayBufferVector
            },
            SORTBY: 'dist',
            DIALECT: 2,
            RETURN: ['dist', ...fieldsToReturn]
          });

          return results
    }

    quit() {
        this.client.quit();
    }
}


module.exports = RedisDB;