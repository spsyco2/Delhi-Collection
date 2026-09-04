const fs = require('fs');
let code = fs.readFileSync('src/components/campaign/CustomerCampaignView.tsx', 'utf8');

const whatsappShare = `
              {/* WhatsApp and Instagram Share Buttons */}
              {wonPrize.isWinning && (
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
              )}
`;

code = code.replace(/\{\/\* Action Buttons \*\/\}/g, match => whatsappShare + '\n            ' + match);

fs.writeFileSync('src/components/campaign/CustomerCampaignView.tsx', code);
