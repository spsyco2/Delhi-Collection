const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminLayout.tsx', 'utf8');

// Add import
code = code.replace("import { AnalyticsDashboard } from './AnalyticsDashboard';", "import { AnalyticsDashboard } from './AnalyticsDashboard';\nimport { BrandSettingsAdmin } from './BrandSettingsAdmin';");

// Add Tab to type
code = code.replace(/type AdminTab = 'campaigns' \| 'participants' \| 'analytics' \| 'wizard' \| 'customer_preview';/, "type AdminTab = 'campaigns' | 'participants' | 'analytics' | 'wizard' | 'customer_preview' | 'brand';");

// Add Tab button
const brandTabBtn = `
          <button
            onClick={() => setActiveTab('brand')}
            className={\`pb-4 px-1 border-b-2 font-medium text-sm transition-colors \${activeTab === 'brand' ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-500 hover:text-stone-700'}\`}
          >
            Brand Settings
          </button>
`;
code = code.replace(/<button[^>]*onClick=\{\(\) => setActiveTab\('analytics'\)\}[^>]*>[\s\S]*?<\/button>/, match => match + brandTabBtn);

// Add Tab panel
const brandPanel = `
            {/* BRAND SETTINGS */}
            {activeTab === 'brand' && (
              <BrandSettingsAdmin />
            )}
`;
code = code.replace(/\{(\/\* ANALYTICS DASHBOARD \*\/)[\s\S]*?(<\/>\s*\)\s*\}\s*<\/div>)/, match => brandPanel + match);

fs.writeFileSync('src/components/admin/AdminLayout.tsx', code);
