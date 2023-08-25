const express = require('express');
const router = express.Router();
const ChatOperationsController = require('../controllers/chatOperationsController');



router.get('/chat', async (req, res) => {
    chatController = new ChatOperationsController()
})

router.get('/chat', (req, res) => {

})