const { Transform } = require('stream');
require('@tensorflow/tfjs-node');  // Import the backend
const tfBackend = require('../config').tensorFlowBackend;
const tf = require('@tensorflow/tfjs');

tf.setBackend(tfBackend);

class EmbeddingTransform  {
    constructor(model) {
        this.model = model;
    }

    async _transform (sentence) {
        const embeddings = await this.model.embed(sentence);
        return embeddings
    }


    async embed (sentence) {   
        const embeddedSentence = await this._transform(sentence);  
        return  { embeddedSentence, sentence };   
    }
}

module.exports = EmbeddingTransform;

