const fs = require('fs');
const { execSync } = require('child_process');

const mdFile = 'Resume_Dokumentasi_Proyek.md';

console.log('Installing markdown-pdf temporarily...');
try {
  // Using npx to run markdown-pdf without installing globally
  execSync(`npx -y markdown-pdf ${mdFile}`, { stdio: 'inherit' });
  console.log('PDF generated successfully!');
} catch (e) {
  console.error('Failed to generate PDF:', e.message);
}
