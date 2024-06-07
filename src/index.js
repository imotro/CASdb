const fs = require('fs');
const zlib = require('zlib');

class CASdb {
    constructor(filePath, xorKey = null) {
        this.filePath = filePath.endsWith('.cdb') ? filePath : `${filePath}.cdb`;
        this.xorKey = xorKey;
        this.requiresKey = xorKey !== null;
        this._ensureFileExists();
    }

    // Ensure the file exists, create it with a default structure if it doesn't
    _ensureFileExists() {
        if (!fs.existsSync(this.filePath)) {
            const emptyCSV = 'id,name,age\n';
            this._writeFile(emptyCSV);
        }
    }

    // XOR encode/decode data with the provided key
    _xorEncodeDecode(data, key) {
        const keyLength = key.length;
        let result = '';
        for (let i = 0; i < data.length; i++) {
            result += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % keyLength));
        }
        return result;
    }

    // Read and ungzip the file
    _readFile() {
        const gzippedData = fs.readFileSync(this.filePath);
        const data = zlib.gunzipSync(gzippedData).toString();

        if (this.requiresKey) {
            return this._xorEncodeDecode(data, this.xorKey);
        }
        return data;
    }

    // Write and gzip the file
    _writeFile(data) {
        if (this.requiresKey) {
            data = this._xorEncodeDecode(data, this.xorKey);
        }
        const gzippedData = zlib.gzipSync(data);
        fs.writeFileSync(this.filePath, gzippedData);
    }

    // Convert CSV string to JSON array
    _csvToJson(csv) {
        const lines = csv.trim().split('\n');
        const headers = lines[0].split(',');

        const result = lines.slice(1).map(line => {
            const values = line.split(',');
            const obj = {};
            headers.forEach((header, index) => {
                obj[header] = values[index];
            });
            return obj;
        });

        return result;
    }

    // Convert JSON array to CSV string
    _jsonToCsv(json) {
        if (json.length === 0) {
            return 'id,name,age\n';
        }

        const headers = Object.keys(json[0]);
        const lines = json.map(obj => headers.map(header => obj[header] ?? '').join(','));

        return [headers.join(','), ...lines].join('\n');
    }

    // Get the data as JSON
    getData(key = null) {
        if (this.requiresKey && key !== this.xorKey) {
            throw new Error('Invalid XOR key. Unable to read data.');
        }
        const csvData = this._readFile();
        return this._csvToJson(csvData);
    }

    // Save JSON data back to the file
    saveData(jsonData, key = null) {
        if (this.requiresKey && key !== this.xorKey) {
            throw new Error('Invalid XOR key. Unable to save data.');
        }
        const csvData = this._jsonToCsv(jsonData);
        this._writeFile(csvData);
    }

    // Update a specific record in the JSON data
    updateRecord(index, newData, key = null) {
        if (this.requiresKey && key !== this.xorKey) {
            throw new Error('Invalid XOR key. Unable to update record.');
        }
        const data = this.getData(key);
        if (index >= 0 && index < data.length) {
            data[index] = { ...data[index], ...newData };
            this.saveData(data, key);
        } else if (index === data.length) {
            // Add new record if index is equal to the length of the data
            data.push(newData);
            this.saveData(data, key);
        } else {
            throw new Error('Index out of bounds');
        }
    }

    // Add a new record to the JSON data
    addRecord(newData, key = null) {
        if (this.requiresKey && key !== this.xorKey) {
            throw new Error('Invalid XOR key. Unable to add record.');
        }
        const data = this.getData(key);
        data.push(newData);
        this.saveData(data, key);
    }
}

module.exports = CASdb;