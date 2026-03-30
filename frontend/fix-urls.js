const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace exact "http://localhost:3001" and io calls
    content = content.replace(/io\("http:\/\/localhost:3001"\)/g, 'io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001")');
    
    // Replace "http://localhost:3001/..." with `...`
    content = content.replace(/"http:\/\/localhost:3001([^"]*)"/g, '`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}$1`');
    
    // Replace `http://localhost:3001/...` with `...`
    content = content.replace(/`http:\/\/localhost:3001([^`]*)`/g, '`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}$1`');
    
    fs.writeFileSync(filePath, content);
    console.log(`Replaced URLs in ${filePath}`);
}

const files = [
    'src/app/page.tsx',
    'src/app/login/page.tsx',
    'src/app/profiles/new/page.tsx',
    'src/app/profiles/[id]/page.tsx',
    'src/app/profiles/[id]/send/page.tsx'
];

files.forEach(f => replaceInFile(path.join(__dirname, f)));

// Create .env.local
fs.writeFileSync(path.join(__dirname, '.env.local'), 'NEXT_PUBLIC_API_URL=http://localhost:3001\n');
console.log('Created .env.local');
