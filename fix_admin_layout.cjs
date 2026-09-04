const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminLayout.tsx', 'utf8');

// Replace top navigation
const oldNavStart = `{/* Top Global Navigation Bar */}`;
const oldNavEnd = `{/* Primary View Switcher Tabs */}`;
// we'll regex replace to make it easier

