let CASdb = require('../src/index.js');
const db = new CASdb('data.cdb');
const fs = require('fs');
console.log("===== TEST 2 =====\n")
const { size } = fs.statSync('data.cdb');

console.log(`Current size: ${size/1000} KB`)

const len = 1024*1024*6.5
const File = new Array(len).fill('a')
const fileSize = Buffer.from(File.join('')).byteLength / (1024 * 1024);
console.log(`File size: ${fileSize} MB`);

db.saveData([ { file: File } ]);
console.log(`Updated size: ${size/1000} KB`)
console.log(`Retrieved file size: ${Buffer.from(db.getData("file").join('')).byteLength / (1024 * 1024)}`)
console.log(db.getData("file"))