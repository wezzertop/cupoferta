'use client';
import { useUIStore } from '@/lib/store';
import { TrendingDown, Percent, ExternalLink } from 'lucide-react';
import { getDealImages } from '@/lib/utils';

interface TopDealsWidgetProps {
  deals: any[];
  type: 'amount' | 'percentage';
}

export function TopDealsWidget({ deals, type }: TopDealsWidgetProps) {
  const { isDarkMode, setSelectedDeal, setDrawerMode } = useUIStore();
  
  if (!deals || deals.length === 0) return null;

  // Derive the Top 5
  const topDeals = [...deals]
    .map(deal => {
      const amountSaved = deal.old_price - deal.price;
      const percentSaved = Math.round((amountSaved / deal.old_price) * 100);
      return { ...deal, amountSaved, percentSaved };
    })
    .filter(deal => deal.amountSaved > 0)
    .sort((a, b) => {
      if (type === 'amount') return b.amountSaved - a.amountSaved;
      return b.percentSaved - a.percentSaved;
    })
    .slice(0, 5);

  if (topDeals.length === 0) return null;

  const cardBg = isDarkMode ? 'bg-[#141414] border-white/5' : 'bg-white border-slate-100';
  const textColor = isDarkMode ? 'text-gray-300' : 'text-slate-700';
  const titleColor = isDarkMode ? 'text-white' : 'text-slate-900';
  const itemBorder = isDarkMode ? 'border-white/5' : 'border-slate-100';

  return (
    <div className={`rounded-xl border shadow-sm p-4 ${cardBg}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-orange-500/10' : 'bg-orange-50'}`}>
          {type === 'amount' ? (
            <TrendingDown className="w-4 h-4 text-orange-500" />
          ) : (
            <Percent className="w-4 h-4 text-orange-500" />
          )}
        </div>
        <h3 className={`font-heading font-bold text-[14px] ${titleColor}`}>
          {type === 'amount' ? 'Mayor Ahorro ($)' : 'Mayor Ahorro (%)'}
        </h3>
      </div>
      
      <div className="flex flex-col gap-3">
        {topDeals.map((deal, idx) => (
          <div 
            key={deal.id} 
            className={`flex items-start gap-3 pb-3 cursor-pointer group ${idx !== topDeals.length - 1 ? `border-b ${itemBorder}` : ''}`}
            onClick={() => {
              setSelectedDeal(deal);
              setDrawerMode('details');
            }}
          >
            <div className={`w-12 h-12 rounded-lg border overflow-hidden shrink-0 flex items-center justify-center ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100'}`}>
              <img 
                src={getDealImages(deal.image_url)[0]} 
                alt={deal.title} 
                className="w-full h-full object-contain p-1 group-hover:scale-110 transition-transform" 
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className={`text-[12px] font-heading font-bold line-clamp-2 leading-tight mb-1 group-hover:text-[#009ea8] transition-colors ${textColor}`}>
                {deal.title}
              </h4>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-[13px] font-numbers font-black text-[#009ea8]">
                  ${deal.price.toLocaleString()}
                </span>
                <span className={`text-[10px] font-numbers font-bold px-1.5 py-0.5 rounded ${isDarkMode ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-600'}`}>
                  {type === 'amount' ? `-$${deal.amountSaved.toLocaleString()}` : `-${deal.percentSaved}%`}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
