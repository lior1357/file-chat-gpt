
const chatOperationsController = require('./controllers/chatOperationsController');

class chatOperationsControllerCache {
    constructor(controllerDependencies) {
        this.cacheMap = new Map();
        this.chatDependencies = controllerDependencies;        
    }

    createController() {

        this.cacheMap.add(key, value)
    }

    getController(chatID=undefined) {
        if(!chatID) {
            const controller = new chatOperationsController(this.chatDependencies);
            this.cacheMap.set(controller.chatID, controller);    
            return controller;
        }
            
        let controller = this.cacheMap.get(chatID)
        controller = controller || new chatOperationsController(this.chatDependencies, chatID);
        this.cacheMap.set(chatID, controller)
        
        return controller
    }

    hasKey(key) {
        return this.cacheMap.hasKey(key)
    }
 }

 module.exports = chatOperationsControllerCache;