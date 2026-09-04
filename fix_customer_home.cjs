const fs = require('fs');
let code = fs.readFileSync('src/components/customer/CustomerHome.tsx', 'utf8');

const oldCards = `                  activeCampaigns.map(camp => (
                    <div 
                      key={camp.id}
                      onClick={() => navigate(\`/campaign/\${camp.id}\`)}
                      className="group bg-white/95 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:scale-[1.02] transition-transform shadow-xl border-2 border-transparent"
                    >
                      <div className="flex-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-1">
                          {camp.type.replace('_', ' ')}
                        </span>
                        <h3 className="text-lg font-bold text-stone-900 leading-tight mb-1">{camp.name}</h3>
                        <p className="text-xs text-stone-500 line-clamp-1">{camp.description}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 ml-3 shadow-md" style={{ backgroundColor: settings.primaryColor, color: settings.accentColor }}>
                        <ChevronRight className="w-5 h-5 ml-0.5" />
                      </div>
                    </div>
                  ))`;

const newCards = `                  activeCampaigns.map(camp => (
                    <div 
                      key={camp.id}
                      onClick={() => navigate(\`/campaign/\${camp.id}\`)}
                      className="group bg-white rounded-3xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform shadow-2xl flex flex-col mb-5 border border-stone-200/50"
                    >
                      <div 
                        className="h-36 w-full relative"
                        style={{ backgroundColor: camp.design?.primaryColor || settings.primaryColor }}
                      >
                        {(camp.design?.bannerImageUrl || settings.backgroundImageUrl) && (
                          <div 
                            className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-60"
                            style={{ backgroundImage: \`url(\${camp.design?.bannerImageUrl || settings.backgroundImageUrl})\` }}
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white/90 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-sm flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-yellow-400" />
                            {camp.type.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-5 flex-1 flex flex-col">
                        <h3 className="text-xl font-bold text-stone-900 leading-tight mb-2 group-hover:text-amber-700 transition-colors">{camp.name}</h3>
                        <p className="text-sm text-stone-500 line-clamp-2 mb-4 leading-relaxed">{camp.description}</p>
                        
                        <div className="mt-auto pt-4 border-t border-stone-100 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                             <Gift className="w-4 h-4" />
                             <span>Win Prizes Instantly</span>
                          </div>
                          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-md transition-all group-hover:shadow-lg group-hover:scale-110" style={{ backgroundColor: settings.primaryColor, color: settings.accentColor }}>
                            <ChevronRight className="w-5 h-5 ml-0.5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))`;

code = code.replace(oldCards, newCards);
if(!code.includes("Sparkles")) {
   code = code.replace("import { Lock, User, Phone, Play, Gift, History, ChevronRight } from 'lucide-react';", "import { Lock, User, Phone, Play, Gift, History, ChevronRight, Sparkles } from 'lucide-react';");
}

fs.writeFileSync('src/components/customer/CustomerHome.tsx', code);
