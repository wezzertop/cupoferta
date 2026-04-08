'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUIStore } from '@/lib/store';
import { ChevronUp, ChevronDown, Loader2, AlertTriangle, MessageCircle } from 'lucide-react';

export function CommentSection({ dealId }: { dealId: string }) {
  const { user, setAuthModalOpen, isDarkMode, dealComments, setDealComment, setReportModalOpen, setReportTargetId, setReportTargetType } = useUIStore();
  const supabase = createClient();
  
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // User votes maps for comments: { [comment_id]: vote_type }
  const [userVotes, setUserVotes] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchComments();
  }, [dealId]);

  const fetchComments = async () => {
    setLoading(true);
    // Fetch comments and author info
    const { data: commentsData } = await supabase
      .from('comments')
      .select('*, profiles!comments_user_id_fkey(username, avatar_url)')
      .eq('deal_id', dealId)
      .order('created_at', { ascending: false });

    if (commentsData) setComments(commentsData);

    // Fetch user votes for these comments
    if (user && commentsData) {
      const commentIds = commentsData.map(c => c.id);
      if (commentIds.length > 0) {
        const { data: votesData } = await supabase
          .from('comment_votes')
          .select('comment_id, vote_type')
          .eq('user_id', user.id)
          .in('comment_id', commentIds);
          
        if (votesData) {
          const votesMap: Record<string, number> = {};
          votesData.forEach(v => { votesMap[v.comment_id] = v.vote_type; });
          setUserVotes(votesMap);
        }
      }
    }
    setLoading(false);
  };

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const diffInHours = Math.max(0, Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60)));
    if (diffInHours < 1) return 'hace poco';
    if (diffInHours < 24) return `hace ${diffInHours}h`;
    return `hace ${Math.floor(diffInHours / 24)}d`;
  };

  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const handlePost = async (parentId: string | null = null) => {
    if (!user) { setAuthModalOpen(true); return; }
    if (!newContent.trim()) return;
    
    setIsSubmitting(true);
    const { data, error } = await supabase.from('comments').insert({
      deal_id: dealId,
      user_id: user.id,
      parent_id: parentId,
      content: newContent.trim()
    }).select('*, profiles!comments_user_id_fkey(username, avatar_url)').single();
    
    if (data) {
      setComments([data, ...comments]);
      setNewContent('');
      setReplyingTo(null);
      // Actualizar el conteo local para las tarjetas y tabs
      const currentCount = dealComments[dealId] ?? comments.length;
      setDealComment(dealId, currentCount + 1);
    }
    setIsSubmitting(false);
  };

  const handleVote = async (commentId: string, type: 1 | -1) => {
    if (!user) { setAuthModalOpen(true); return; }
    
    const currentVote = userVotes[commentId] || null;
    let tempDiff = 0;
    
    if (currentVote === type) {
      // eliminate vote
      setUserVotes(prev => ({...prev, [commentId]: 0}));
      tempDiff = -type;
      const { error } = await supabase.from('comment_votes').delete().eq('comment_id', commentId).eq('user_id', user.id);
      if (error) console.error('Error delete comment_vote:', error);
    } else {
      // switch vote
      setUserVotes(prev => ({...prev, [commentId]: type}));
      // Si currentVote es null o 0, el salto es de 'type'. Si cambia de -1 a 1, el salto es 'type * 2'
      tempDiff = (!currentVote || currentVote === 0) ? type : type * 2;
      
      const { error: delError } = await supabase.from('comment_votes').delete().eq('comment_id', commentId).eq('user_id', user.id);
      if (delError) console.error('Error del before ins comment_vote:', delError);
      
      const { error: insError } = await supabase.from('comment_votes').insert({
        comment_id: commentId,
        user_id: user.id,
        vote_type: type
      });
      if (insError) console.error('Error ins comment_vote:', insError);
    }

    setComments(prev => prev.map(c => c.id === commentId ? { ...c, likes: (c.likes || 0) + tempDiff } : c));
  };

  const themeClasses = {
    textStrong: isDarkMode ? 'text-white' : 'text-slate-900',
    textMuted: isDarkMode ? 'text-gray-500' : 'text-slate-500',
    textDesc: isDarkMode ? 'text-gray-400' : 'text-slate-600',
  };

  const openReport = (id: string) => {
    setReportTargetId(id);
    setReportTargetType('comment');
    setReportModalOpen(true);
  };

  return (
    <div>
      <h3 className={`text-lg font-heading font-bold mb-4 ${themeClasses.textStrong}`}>Comunidad ({comments.length})</h3>
      
      <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-[#141414] border-[#262626]' : 'bg-slate-100 border-slate-200'}`}>
        <textarea 
          placeholder="¿Qué opinas de este chollo?" 
          className={`w-full bg-transparent border-none resize-none outline-none font-body text-sm ${themeClasses.textStrong}`} 
          rows={2}
          value={replyingTo === null ? newContent : ''}
          onChange={e => { setReplyingTo(null); setNewContent(e.target.value); }}
        ></textarea>
        <div className="flex justify-end mt-2">
           <button 
             onClick={() => handlePost(null)}
             disabled={isSubmitting || (replyingTo === null && !newContent.trim())}
             className={`px-4 py-1.5 rounded-lg text-[12px] font-heading font-bold bg-[#009ea8] text-white shadow-md shadow-[#009ea8]/20 hover:-translate-y-0.5 transition-all disabled:opacity-50`}
           >
             {isSubmitting && replyingTo === null ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publicar'}
           </button>
        </div>
      </div>
      
      <div className="mt-8 space-y-6">
         {loading ? (
           <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-[#009ea8]" /></div>
         ) : comments.length === 0 ? (
           <div className={`text-center p-8 border-dashed border-2 rounded-xl flex flex-col items-center justify-center ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
             <MessageCircle size={48} className={`mb-3 ${isDarkMode ? 'text-gray-600' : 'text-slate-300'}`} />
             <p className={`font-heading font-bold ${themeClasses.textStrong}`}>Aún no hay comentarios</p>
             <p className="text-sm font-body mt-1 text-gray-500">Sé el primero en comentar.</p>
             <button onClick={() => { document.querySelector('textarea')?.focus(); }} className="mt-4 px-4 py-2 rounded-lg text-sm font-heading font-bold bg-[#009ea8]/10 text-[#009ea8] hover:bg-[#009ea8]/20 transition-colors">
                Me gustaría opinar
             </button>
           </div>
         ) : comments.filter(c => !c.parent_id).map((c) => (
           <div key={c.id} className="flex gap-4 group">
              <img src={c.profiles?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Anon"} alt="Avatar" className={`w-8 h-8 rounded-full border ${isDarkMode ? 'border-[#333333]' : 'border-slate-200'} flex-shrink-0`} />
              <div className="flex-1">
                 <div className="flex items-center justify-between mb-1">
                   <div className="flex items-center gap-2">
                     <span className={`text-[13px] font-heading font-bold ${themeClasses.textStrong}`}>{c.profiles?.username}</span>
                     <span className={`text-[11px] font-body ${themeClasses.textMuted}`}>{getTimeAgo(c.created_at)}</span>
                   </div>
                 </div>
                 <p className={`text-[13px] font-body leading-relaxed ${themeClasses.textDesc} mb-2`}>{c.content}</p>
                 <div className="flex items-center gap-4 mt-2">
                    <div className={`flex items-center rounded-lg overflow-hidden border ${isDarkMode ? 'border-[#333333] bg-[#1a1a1a]' : 'border-slate-200 bg-slate-100'}`}>
                       <button onClick={() => handleVote(c.id, 1)} className={`px-2 py-1 transition-colors outline-none focus:outline-none ${userVotes[c.id] === 1 ? 'text-orange-500 bg-orange-500/10' : `text-gray-500 ${isDarkMode ? 'hover:bg-[#333333] hover:text-white' : 'hover:bg-slate-200 hover:text-slate-900'}`}`}>
                          <ChevronUp className="w-3.5 h-3.5" />
                       </button>
                       <span className={`px-1.5 text-[11px] font-numbers font-bold ${userVotes[c.id] === 1 ? 'text-orange-500' : userVotes[c.id] === -1 ? 'text-blue-500' : themeClasses.textMuted}`}>{c.likes || 0}</span>
                       <button onClick={() => handleVote(c.id, -1)} className={`px-2 py-1 transition-colors outline-none focus:outline-none ${userVotes[c.id] === -1 ? 'text-blue-500 bg-blue-500/10' : `text-gray-500 ${isDarkMode ? 'hover:bg-[#333333] hover:text-white' : 'hover:bg-slate-200 hover:text-slate-900'}`}`}>
                          <ChevronDown className="w-3.5 h-3.5" />
                       </button>
                    </div>
                    <button onClick={() => { setReplyingTo(replyingTo === c.id ? null : c.id); setNewContent(''); }} className={`text-[11px] font-heading font-bold transition-colors ${replyingTo === c.id ? 'text-[#009ea8]' : `${themeClasses.textMuted} hover:text-[#009ea8]`}`}>
                      Responder
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); openReport(c.id); }} className={`text-[11px] font-heading font-bold transition-colors ${themeClasses.textMuted} hover:text-red-500 flex items-center gap-1`}>
                      <AlertTriangle className="w-3 h-3" /> Reportar
                    </button>
                 </div>
                 
                 {/* Reply Textbox */}
                 {replyingTo === c.id && (
                   <div className="mt-3 flex gap-2">
                     <input type="text" autoFocus value={newContent} onChange={e => setNewContent(e.target.value)} placeholder="Escribe tu respuesta..." className={`flex-1 bg-transparent border-b text-sm font-body px-2 py-1 outline-none transition-colors ${isDarkMode ? 'border-white/10 text-white focus:border-[#009ea8]' : 'border-slate-200 text-slate-800 focus:border-[#009ea8]'}`} />
                     <button onClick={() => handlePost(c.id)} disabled={isSubmitting || !newContent.trim()} className="text-[11px] font-heading font-bold text-white bg-[#009ea8] px-3 rounded-lg disabled:opacity-50">Enviar</button>
                   </div>
                 )}

                 {/* Recursive Nested Comments Render */}
                 {comments.filter(child => child.parent_id === c.id).map(child => (
                    <div key={child.id} className={`flex gap-3 mt-4 pt-4 border-t ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                       <img src={child.profiles?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Anon"} alt="Avatar" className={`w-6 h-6 rounded-full border ${isDarkMode ? 'border-[#333333]' : 'border-slate-200'} flex-shrink-0`} />
                       <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[12px] font-heading font-bold ${themeClasses.textStrong}`}>{child.profiles?.username}</span>
                            <span className={`text-[10px] font-body ${themeClasses.textMuted}`}>{getTimeAgo(child.created_at)}</span>
                          </div>
                          <p className={`text-[12px] font-body leading-relaxed ${themeClasses.textDesc} mb-2`}>{child.content}</p>
                          <div className="flex items-center gap-3">
                            <div className={`inline-flex items-center rounded-lg overflow-hidden border ${isDarkMode ? 'border-[#333333] bg-[#1a1a1a]' : 'border-slate-200 bg-slate-100'}`}>
                               <button onClick={() => handleVote(child.id, 1)} className={`px-2 py-0.5 transition-colors outline-none focus:outline-none ${userVotes[child.id] === 1 ? 'text-orange-500 bg-orange-500/10' : `text-gray-500 ${isDarkMode ? 'hover:bg-[#333333] hover:text-white' : 'hover:bg-slate-200 hover:text-slate-900'}`}`}><ChevronUp className="w-3 h-3" /></button>
                               <span className={`px-1 text-[10px] font-numbers font-bold ${userVotes[child.id] === 1 ? 'text-orange-500' : userVotes[child.id] === -1 ? 'text-blue-500' : themeClasses.textMuted}`}>{child.likes || 0}</span>
                               <button onClick={() => handleVote(child.id, -1)} className={`px-2 py-0.5 transition-colors outline-none focus:outline-none ${userVotes[child.id] === -1 ? 'text-blue-500 bg-blue-500/10' : `text-gray-500 ${isDarkMode ? 'hover:bg-[#333333] hover:text-white' : 'hover:bg-slate-200 hover:text-slate-900'}`}`}><ChevronDown className="w-3 h-3" /></button>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); openReport(child.id); }} className={`text-[10px] font-heading font-bold transition-colors ${themeClasses.textMuted} hover:text-red-500`}>
                               Reportar
                            </button>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
         ))}
      </div>
    </div>
  );
}
