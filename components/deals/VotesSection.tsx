'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUIStore } from '@/lib/store';
import { Loader2, Flame, Snowflake } from 'lucide-react';

export function VotesSection({ dealId }: { dealId: string }) {
  const [votes, setVotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isDarkMode, dealVotes } = useUIStore();
  const supabase = createClient();

  useEffect(() => {
    async function loadVotes() {
      setLoading(true);
      const { data, error } = await supabase
        .from('deal_votes')
        .select('vote_type, created_at, user_id, profiles(username, avatar_url)')
        .eq('deal_id', dealId)
        .order('created_at', { ascending: false });
        
      if (data) setVotes(data);
      setLoading(false);
    }
    loadVotes();
  }, [dealId, dealVotes[dealId]]);

  const themeClasses = {
    textStrong: isDarkMode ? 'text-white' : 'text-slate-900',
    textMuted: isDarkMode ? 'text-gray-500' : 'text-slate-500',
    card: isDarkMode ? 'bg-[#141414] border-[#262626]' : 'bg-slate-100 border-slate-200',
  };

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const diffInHours = Math.max(0, Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60)));
    if (diffInHours < 1) return 'hace poco';
    if (diffInHours < 24) return `hace ${diffInHours}h`;
    return `hace ${Math.floor(diffInHours / 24)}d`;
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-[#009ea8]" /></div>;
  if (votes.length === 0) return <div className="text-center p-8 text-gray-500 font-body text-sm">Nadie ha votado aún. ¡Sé el primero!</div>;

  return (
    <div className="space-y-3">
      {votes.map((v) => (
        <div key={`${v.user_id}-${v.created_at}`} className={`flex items-center justify-between p-3 rounded-xl border ${themeClasses.card}`}>
           <div className="flex items-center gap-3">
              <img src={v.profiles?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Anon"} alt="" className={`w-8 h-8 rounded-full border ${isDarkMode ? 'border-[#333333]' : 'border-slate-200'}`} />
              <div className="flex flex-col">
                 <span className={`text-[13px] font-heading font-bold ${themeClasses.textStrong}`}>{v.profiles?.username}</span>
                 <span className={`text-[10px] font-body ${themeClasses.textMuted}`}>{getTimeAgo(v.created_at)}</span>
              </div>
           </div>
           
           <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${v.vote_type === 1 ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'}`}>
              {v.vote_type === 1 ? <Flame className="w-4 h-4" /> : <Snowflake className="w-4 h-4" />}
           </div>
        </div>
      ))}
    </div>
  );
}
