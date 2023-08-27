const axios = require('axios');

function search() {
    return axios.get("http://127.0.0.1:3000/chat/8410faab-be66-4a10-8505-5cce0c1b3b3c", {
        data: {
            query: "tell me about that volunteer state",
        }
        
    }).then((res) => {
        console.log(res)
    }).catch(err => {
        console.log(err)
    });

}

function load() {
    return axios.post("http://127.0.0.1:3000/chat/load", {
        data: {
            filePath: "src/example.pdf",
        }
        
    }).then((res) => {
        console.log(res)
    }).catch(err => {
        console.log(err)
    });

}

function getMessages() {
    return axios.get("http://127.0.0.1:3000/chat/8410faab-be66-4a10-8505-5cce0c1b3b3c/messages", {
        data: {
            numOfMessages: 10,
            indexLast: 3
        }
    }).then((res) => {
        console.log(res.data.elements.length)
    }).catch(err => {
        console.log(err)
    });

}

getMessages()