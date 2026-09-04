const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add import for CustomerHome
code = code.replace("import { CustomerCampaignView } from './components/campaign/CustomerCampaignView';", "import { CustomerCampaignView } from './components/campaign/CustomerCampaignView';\nimport { CustomerHome } from './components/customer/CustomerHome';");

// Update CustomerRoute to grab id from params
code = code.replace(/const CustomerRoute = \(\) => \{\s*const \[searchParams\] = useSearchParams\(\);\s*const campSlug = searchParams\.get\('campaign'\) || 'delhi-collection-spin';/, `import { useParams } from 'react-router-dom';\n\nconst CustomerRoute = () => {\n  const { id } = useParams<{id: string}>();\n  const campSlug = id;`);

// Remove the Admin Login section from CustomerRoute
code = code.replace(/<div className="text-center mt-6 mb-4">[\s\S]*?<\/div>/, '');

// Update routing
code = code.replace('<Route path="/" element={<CustomerRoute />} />', '<Route path="/" element={<CustomerHome />} />\n        <Route path="/campaign/:id" element={<CustomerRoute />} />');

fs.writeFileSync('src/App.tsx', code);
