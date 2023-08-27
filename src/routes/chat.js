const ChatOperationsController = require('../controllers/chatOperationsController');

function loadFile (dependencies) {
    console.log(dependencies)
    return async function (req, res) {
        try {
            console.log(req.body);
            const controller = new ChatOperationsController(dependencies, req.body.chatID);
            await controller.loadFile(req.body.filePath);
            res.status(200);
        } catch(err) {
            console.log(err);
            res.status(500).send(err);
        }
    }
}

function findAnswerForQuery(dependencies) {
    return async function(req, res) {
        // try {
    
        console.log(req);
        const controller = new ChatOperationsController(dependencies, req.params.chatID);
        const responseData = await controller.findAnswerForQuery(req.body.query);
        console.log('good')
        res.status(200).send({responseData});
        // } catch(err) {
        //     res.status(500);
        // }
    }
}

function getMessages(dependencies) {
    return async function(req, res) {
        try {
        console.log(req.params.chatID);
        const controller = new ChatOperationsController(dependencies, req.params.chatID);
        const responseData = await controller.getChatMessages(req.body.numOfMessages, req.body.indexLast);
        res.status(200).send(responseData);
        } catch(err) {
            res.status(500);
            console.log(err);
        }
    }
}




module.exports = {loadFile, findAnswerForQuery, getMessages};