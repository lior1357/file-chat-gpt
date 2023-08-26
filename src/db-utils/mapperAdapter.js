const crypto = require('crypto');

class MapperAdapter {
    constructor(mapperObject, isVectorKey=false) {
        this.mapper = mapperObject;
        this.isVectorKey = isVectorKey;
    }

    add(key, value) {
        key = this.isVectorKey ? this._hashVector(key) : key;
        this.mapper.add(key, value)
    }

    get(key) {
        key = this.isVectorKey ? this._hashVector(key) : key;
        return this.mapper.get(key)
    }

    hasKey(key) {
        return this.mapper.hasKey(key)
    }

    _hashVector(vectorEmbedding) {
        const buffer = vectorEmbedding.dataSync();
        const hashedValue = crypto.createHash('sha256').update(buffer).digest('hex');
        return hashedValue;
    }
}

module.exports = MapperAdapter;