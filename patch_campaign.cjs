const fs = require('fs');
let code = fs.readFileSync('src/components/campaign/CustomerCampaignView.tsx', 'utf8');

// Update state initialization
code = code.replace(
  "const [customerName, setCustomerName] = useState('');\n  const [phoneNumber, setPhoneNumber] = useState('');",
  "const [customerName, setCustomerName] = useState(localStorage.getItem('dc_customer_name') || '');\n  const [phoneNumber, setPhoneNumber] = useState(localStorage.getItem('dc_customer_phone') || '');"
);

// Skip identity step if we already have it
code = code.replace(
  "const [step, setStep] = useState<'identity' | 'wheel'>('identity');",
  "const [step, setStep] = useState<'identity' | 'wheel'>((localStorage.getItem('dc_customer_name') && localStorage.getItem('dc_customer_phone')) ? 'wheel' : 'identity');"
);

// Update Result Modal to include WhatsApp and Instagram sharing
const whatsappShare = `
              <div className="flex gap-2 mb-4 w-full">
                <a
                  href={\`https://wa.me/?text=\${encodeURIComponent('I just spun the wheel at ' + design.brandName + ' and won ' + wonPrize.label + '! 🎉')}\`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 px-3 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md"
                >
                  <MessageCircle className="w-4 h-4" /> Share on WhatsApp
                </a>
                <a
                  href={design.socialLinks?.instagram || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 px-3 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md"
                >
                  <Instagram className="w-4 h-4" /> Tag on Instagram
                </a>
              </div>
`;

code = code.replace(/\{!\!wonPrize\.isWinning[^]*?\{!\* Action Buttons \*\}/g, match => {
  return match.replace('{/* Action Buttons */}', whatsappShare + '\n            {/* Action Buttons */}');
});

// Update "Close Window" to go back
code = code.replace(
  "onClick={() => setShowResultModal(false)}",
  "onClick={() => { setShowResultModal(false); window.location.href = '/'; }}"
);

fs.writeFileSync('src/components/campaign/CustomerCampaignView.tsx', code);
