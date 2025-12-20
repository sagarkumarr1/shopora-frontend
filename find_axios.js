
const fs = require('fs');
const content = fs.readFileSync('package-lock.json', 'utf8');
const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('"node_modules/follow-redirects": {')) {
        console.log(`Found follow-redirects at line ${i + 1}`);
        for (let j = 0; j < 20; j++) {
            console.log(lines[i + j]);
        }
        break;
    }
}
