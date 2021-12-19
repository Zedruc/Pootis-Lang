const fs = require('fs');

const string = fs.readFileSync('./src/util/dev/string.txt').toString();
const chars = string.split('');
var PootisScript = '';
for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    PootisScript += `{+:${char.charCodeAt(0)}}c>`;
}

fs.writeFileSync('./src/tests/generated.pootis', PootisScript);