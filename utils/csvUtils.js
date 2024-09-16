const csv = require('csv-parser');
const fs = require('fs');

const parseCSV = (filePath, callback) => {
    const results = [];
    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => callback(null, results))
        .on('error', (error) => callback(error));
};

module.exports = { parseCSV };
