class KeyStructureManager {
    getVectorIndexKey(chatID) {
        return `chat:${chatID}:vectors`
    }

    getMessageStorageKey(chatID) {
        return `chat:${chatID}:messages`;
    }

    getVectorKey(chatID, vectorHash) {

        return `chat:${chatID}:vector:${vectorHash}`;
    }

    getVectorKeysPrefix(chatID) {
        return `chat:${chatID}:vector:`
    }

 }

 module.exports = KeyStructureManager;