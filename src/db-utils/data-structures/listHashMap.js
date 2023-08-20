const IMapper = require('./IMapper');

class ListMapper extends IMapper {
    constructor() {
        super();
    }

    add(key, value) {
        if (!this.map.has(key))
            this.map.set(key, [value]);
        else {
            let list = this.get(key);
            list.push(value);
            this.map.set(key, list)
        }
    }

    get(key) {
        if (this.map.has(key))
            return this.map.get(key)
    }

    getByIndex(key, lastMessageIndex, numOfElements) {
        const list = this.get(key);
        const indexFrom = lastMessageIndex - numOfElements > 0 ? lastMessageIndex - numOfElements: 0;
        lastMessageIndex = lastMessageIndex === -1 ? list.length : lastMessageIndex;
        return list.slice(indexFrom, lastMessageIndex);
    }
}


module.exports = ListMapper;