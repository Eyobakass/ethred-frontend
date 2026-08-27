
const fs = require('fs');

const missingRoutes = [];
const filesToCheck = [
  'src/app/[lang]/seller/dashboard/page.tsx',
  'src/app/[lang]/admin/dashboard/page.tsx',
  'src/app/[lang]/agencies/page.tsx',
  'src/app/[lang]/buyer/inquiries/page.tsx',
  'src/app/[lang]/properties/compare/page.tsx',
  'src/app/[lang]/admin/properties/page.tsx',
  'src/app/[lang]/seller/listings/page.tsx',
];

filesToCheck.forEach(f => {
  if (!fs.existsSync(f)) {
    missingRoutes.push(f);
  }
});

console.log('=== Missing Expected Routes ===');
missingRoutes.forEach(r => console.log('MISSING: ' + r));

console.log('\n=== Frontend API Calls ===');
const apiServiceFiles = fs.readdirSync('src/services').filter(f => f.endsWith('.ts'));

const frontendEndpoints = new Set();
apiServiceFiles.forEach(file => {
  if (file === 'api.ts') return;
  const content = fs.readFileSync('src/services/' + file, 'utf8');
  const matches = content.match(/apiClient\.(get|post|put|patch|delete)\((['\].*?['\])/g) || [];
  matches.forEach(m => {
    const pathMatch = m.match(/['\](.*?)['\]/);
    if (pathMatch) {
      let path = pathMatch[1].split('?')[0];
      path = path.replace(/\$\{[^}]+\}/g, ':id'); 
      frontendEndpoints.add('[' + file + '] ' + m.substring(10, 15).replace('(', '').toUpperCase().trim() + ' ' + path);
    }
  });
});

[...frontendEndpoints].sort().forEach(e => console.log(e));

