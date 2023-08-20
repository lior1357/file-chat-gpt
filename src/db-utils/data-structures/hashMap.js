const IMapper = require('./IMapper')

class Mapper extends IMapper{
    constructor() {
        super();
    }

    add(key, value) {
        if (!this.map.has(key))
            this.map.set(key, value);
    }

    get(key) {
        return this.map.get(key)
    }

    hasKey(key) {
        return this.map.has(key)
    }
}

module.exports = Mapper