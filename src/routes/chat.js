const express = require('express');
const router = express.Router();
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

router.get('/:chatID', (dependencies) => {
    return async function(req, res) {
        try {
            const controller = new ChatOperationsController(dependencies, req.params.chatID);
            await controller.getChatMessages(3, 2);
            res.status(200);
        } catch(err) {
            res.status(500);
        }
    }
});

module.exports = loadFile;