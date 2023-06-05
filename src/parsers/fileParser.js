const fs = require('fs')

class FileParser {

    constructor (filePath) {
        this.buffer = fs.readFileSync(filePath)
    }
    parse() {
        throw new Error('parse() method is not implemented!')
    }
}


module.exports = FileParser