let CASdb = require('../src/index.js');
const db = new CASdb('data.cdb');
console.log("===== TEST 1 =====\n")
// Get the data
try {
    let data = db.getData('my-secret-key');
    console.log('Data:', data);
    
    // Update the first record
    if (data.length > 0) {
        db.updateRecord(0, { name: 'John Doe', age: 30 });
    } else {
        db.addRecord({ id: 1, name: 'John Doe', age: 30 });
    }

        // Verify the update
    data = db.getData('my-secret-key');
    console.log('Updated Data:', data);
} catch (error) {
    console.error(error.message);
}