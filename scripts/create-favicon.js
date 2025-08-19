// Simple script to copy the SVG as favicon.ico (browsers will handle SVG as ICO)
const fs = require('fs');
const path = require('path');

try {
  const svgPath = path.join(__dirname, '..', 'public', 'queen-favicon.svg');
  const icoPath = path.join(__dirname, '..', 'public', 'favicon.ico');
  
  // Copy SVG content to ICO file (modern browsers support SVG as ICO)
  const svgContent = fs.readFileSync(svgPath, 'utf8');
  fs.writeFileSync(icoPath, svgContent);
  
  console.log('✅ Favicon.ico created successfully!');
} catch (error) {
  console.error('❌ Error creating favicon:', error);
}
