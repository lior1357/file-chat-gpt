const { IndexFlatL2 } = require('faiss-node');

class VectorIndex {
    constructor(embeddingTrannsform, dimension=512) {
        this.index = new IndexFlatL2(dimension);
        this.vectorList = [];
        this.embeddingTrannsform = embeddingTrannsform;
    }

    async add(embeddedSentence) {
        const arrayVector = embeddedSentence.arraySync()[0]
        try {
            this.index.add(arrayVector);
            this.vectorList.push(embeddedSentence);
        }
        catch(e) {
            console.log('Empty Array')
        }
        
        return arrayVector;
    }

    async search(stringQuery, kNearest) {
        const { embeddedSentence } = await this.embeddingTrannsform.embed(stringQuery);
        const arrayVector = embeddedSentence.arraySync()[0];
        const { labels } = this.index.search(arrayVector, kNearest);
        const searchResults = labels.map((element) => this.vectorList[element]);
        return searchResults;
    }
}


module.exports = VectorIndex;
