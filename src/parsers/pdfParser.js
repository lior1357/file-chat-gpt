const FileParser = require('./fileParser')
const pdf = require('pdf-parse')


class PDFFileParser extends FileParser {
    constructor(filePath, chatID) {
        super(filePath, chatID)
    }
    
    async read() {
        try {
            const data = await pdf(this.buffer)
            return data.text
        }
        catch(e) {      
            throw new Error(e)
        }      
    }
}

module.exports = PDFFileParser