class IMapper {

    constructor() {
        this.map = new Map();
    }

    async add() {
        throw new Error('add() function is not implemented');
    }   

    async get() {
        throw new Error('get() function is not implemented');
    }
}

module.exports = IMapper;