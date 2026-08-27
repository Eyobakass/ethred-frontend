
const fs = require('fs');
let code = fs.readFileSync('src/services/property.service.ts', 'utf8');

const target = 
  async uploadDocument(propertyId: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('document', file);
    return apiClient.post(\/properties/\/media/documents\, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
    return res?.data ?? res;
  }
;

const replacement = 
  async uploadDocument(propertyId: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('document', file);
    const res: any = await apiClient.post(\/properties/\/media/documents\, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
    return res?.data ?? res;
  }
;

code = code.replace(target.trim(), replacement.trim());
fs.writeFileSync('src/services/property.service.ts', code);
console.log('Fixed');

