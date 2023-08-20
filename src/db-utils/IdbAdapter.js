
class IDBAdapter {

    async connect(userName, password){
        throw new Error('initialize() function is not implemented');
    }

    async add(key, value) {
        throw new Error('add() function is not implemented');
    }   

    async get(key) {
        throw new Error('get() function is not implemented');
    }

    async set(key) {
        throw new Error('set() function is not implemented');
    }

    async search(key) {
        throw new Error('search() function is not implemented');
    }

    async delete(key) {
        throw new Error('delete() function is not implemented');
    }
}

module.exports = IDBAdapter;