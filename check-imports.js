const fs = require('fs');

// Check page imports to find the broken one causing 404
const pages = [
  'src/app/[lang]/properties/page.tsx',
  'src/app/[lang]/auth/login/page.tsx',
  'src/app/[lang]/buyer/favorites/page.tsx',
  'src/app/[lang]/seller/dashboard/page.tsx',
  'src/app/[lang]/seller/listings/[id]/page.tsx',
];

for (const p of pages) {
  try {
    const content = fs.readFileSync(p, 'utf8');
    // Find all import statements
    const importLines = content.split('\n').filter(l => l.trim().startsWith('import'));
    console.log('=== ' + p + ' ===');
    importLines.forEach(l => console.log('  ' + l.trim()));
    
    // Check if all @/ imports exist
    const atImports = importLines.filter(l => l.includes('@/'));
    for (const imp of atImports) {
      const match = imp.match(/from ['"](@\/[^'"]+)['"]/);
      if (match) {
        const importPath = match[1].replace('@/', 'src/');
        const withTs = importPath + '.tsx';
        const withTsx = importPath + '/index.tsx';
        const withTsBase = importPath + '.ts';
        const exists = 
          fs.existsSync(importPath) || 
          fs.existsSync(withTs) || 
          fs.existsSync(withTsx) || 
          fs.existsSync(withTsBase) ||
          fs.existsSync(importPath + '.ts') ||
          fs.existsSync(importPath + '/index.ts');
        if (!exists) {
          console.log('  MISSING IMPORT:', match[1], '-> resolved to', importPath);
        }
      }
    }
  } catch(e) { console.log('READ ERROR: ' + p, e.message); }
}
