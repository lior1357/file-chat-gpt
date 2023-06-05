const FileParser = require('./fileParser')
const fs = require('fs')
const pdf = require('pdf-parse')
const config = require('../config')

class PDFFileParser extends FileParser {
    constructor(filePath) {
        super(filePath)
    }
    

    async read() {
        try {
            const data = await pdf(this.buffer)
            return data
        }
        catch(e) {      
            console.log('error reading file', e)
        }      
    }
    
    async splitStringToList() {
        const textFile = this.read()
        console.log(await textFile)
        const symbolsToSplit = [',', ';', ':', '.', '!', '?', '-', ''];
          
          // Splitting the string by symbols
          const splitText = textFile.split(new RegExp(`[${symbolsToSplit.join('')}]`));
          console.log(splitText);
          
    }

    parse() {

         
    }
}

module.exports = PDFFileParser