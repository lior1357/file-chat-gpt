const fs = require('fs')
const crypto = require('crypto')


class FileParser {
    constructor (filePath, chatID) {
        this.buffer = fs.readFileSync(filePath) //TODO: replace the readFileSyncwith a stream that returns an async generator
        this.hash = this.hash()
        this.chatID = chatID
    }


    async *splitFileToSentenceAsyncGenerator() {
        let fileText = await this.read()
        fileText = this.removeEscapeSequences(fileText)

        const symbolsToSplit = ['.', '!', '?'];   
        const regex = new RegExp(`[${symbolsToSplit.join('')}]`, 'g');

        let lastIndex = 0;
        let match;
      
        while ((match = regex.exec(fileText)) !== null) {
          const splitPart = fileText.substring(lastIndex, match.index);
          lastIndex = regex.lastIndex;
          yield splitPart;
        }
      
        if (lastIndex < fileText.length) {
          yield fileText.substring(lastIndex);
        }
    }

    async read() {
        throw new Error ('read() method is not implemented!')
    }

    removeEscapeSequences(string) {
        return string.replace(/(\r\n|\n|\r|\t)/gm, "");
    }

    hash() {
        const hash = crypto.createHash('sha256')
        hash.update(this.buffer)
        return hash.digest('hex')
    }

}

module.exports = FileParser