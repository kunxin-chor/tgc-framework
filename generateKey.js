const crypto = require('crypto');

function generateSecret() {
    return crypto.randomBytes(32).toString('hex');
}

console.log(generateSecret());