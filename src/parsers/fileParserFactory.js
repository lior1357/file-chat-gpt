const PDFFileParser = require('./pdfParser') 


class FileParserFactory {
    getParser (filePath, chatID) {
        this.fileExt = filePath.split('.').pop().toLowerCase();

        if (this.fileExt === 'pdf') {
            return new PDFFileParser(filePath, chatID);
        }

        throw new Error('Unsupported file type')
    }
}

module.exports = FileParserFactory