const PDFParser = require('./parsers/pdfParser')
const config = require('./config')


file = new PDFParser(config.filePath)

file.splitStringToList()