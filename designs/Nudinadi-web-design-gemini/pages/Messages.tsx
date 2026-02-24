
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

interface MessageItem {
  id: string;
  name: string;
  item: string;
  snippet: string;
  time: string;
  isSaved?: boolean;
  isQuestion?: boolean;
  avatar?: string;
  online?: boolean;
}

interface ChatMessage {
    id: string;
    text: string;
    sender: 'me' | 'them';
    time: string;
    type?: 'text' | 'image' | 'offer';
}

const INITIAL_MESSAGES: MessageItem[] = [
  { id: '1', name: 'Alex', item: 'Samsung Galaxy S25 Ultra', snippet: 'Može li zamjena za iPhone?', time: '18:31', isSaved: true, avatar: 'https://picsum.photos/seed/alex/100/100', online: true },
  { id: '2', name: 'Ivana', item: 'Skuter 125cc', snippet: 'Je li još dostupno?', time: '11:04', isSaved: false, avatar: 'https://picsum.photos/seed/ivana/100/100', online: false },
  { id: '3', name: 'Marko', item: 'Bušilica + set', snippet: 'Koliko je staro?', time: '08:12', isSaved: true, avatar: 'https://picsum.photos/seed/marko/100/100', online: true },
  { id: 'q1', name: 'Zoran', item: 'Porsche Panamera', snippet: 'Koja je zadnja cijena za keš?', time: 'Jučer', isQuestion: true, avatar: 'https://picsum.photos/seed/zoran/100/100', online: false },
  { id: 'q2', name: 'Edin', item: 'iPhone 15 Pro', snippet: 'Slike ekrana?', time: 'Uto', isQuestion: true, avatar: 'https://picsum.photos/seed/edin/100/100', online: true },
  { id: '4', name: 'Ana', item: 'Dječja Kolica', snippet: 'Može li dostava brzom poštom?', time: 'Pon', avatar: 'https://picsum.photos/seed/ana/100/100', online: false },
  { id: '5', name: 'Darko', item: 'PlayStation 5', snippet: 'Nudim 400€ odmah.', time: 'Pon', avatar: 'https://picsum.photos/seed/darko/100/100', online: true },
];

const MOCK_CHAT_HISTORY: Record<string, ChatMessage[]> = {
    '1': [
        { id: 'm1', text: 'Pozdrav, zanima me zamjena.', sender: 'them', time: '18:30' },
        { id: 'm2', text: 'Imam iPhone 14 Pro Max, stanje 10/10.', sender: 'them', time: '18:30' },
        { id: 'm3', text: 'Pozdrav! Koja boja i koliko GB?', sender: 'me', time: '18:31' },
        { id: 'm4', text: 'Space Black, 256GB. Kutija i sve.', sender: 'them', time: '18:32' },
    ],
    'default': [
        { id: 'd1', text: 'Pozdrav, je li artikal dostupan?', sender: 'them', time: '10:00' },
        { id: 'd2', text: 'Da, još uvijek je u prodaji.', sender: 'me', time: '10:15' },
    ]
};

const ContactRow: React.FC<{ 
  message: MessageItem; 
  isActive: boolean;
  isPinned: boolean;
  onClick: () => void;
  onPin: (e: React.MouseEvent) => void;
  onSave: (e: React.MouseEvent) => void;
}> = ({ message, isActive, isPinned, onClick, onPin, onSave }) => (
  <div 
    onClick={onClick}
    className={`
      group relative flex items-center gap-3 p-3 rounded-[16px] cursor-pointer transition-all duration-200 border overflow-hidden
      ${isActive 
        ? 'bg-blue-600/10 border-blue-500/50 shadow-[inset_0_0_20px_rgba(37,99,235,0.1)]' 
        : isPinned
            ? 'bg-[#15202B] border-blue-500/20'
            : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/5'
      }
    `}
  >
    {/* Pinned Indicator Strip */}
    {isPinned && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 shadow-[0_0_10px_#3B82F6]"></div>}

    {/* Avatar */}
    <div className="relative shrink-0">
        <div className={`w-12 h-12 rounded-[14px] p-[2px] ${isActive ? 'bg-blue-500' : 'bg-white/10 group-hover:bg-white/20'} transition-colors`}>
            <img src={message.avatar} alt={message.name} className="w-full h-full object-cover rounded-[12px] bg-[#0B151E]" />
        </div>
        {message.online && (
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#060E14] rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
        )}
    </div>

    {/* Text Info */}
    <div className="flex-1 min-w-0 hidden md:block pr-6 group-hover:pr-14 transition-all">
        <div className="flex justify-between items-baseline mb-0.5">
            <div className="flex items-center gap-1.5">
                <h4 className={`text-[13px] font-bold truncate ${isActive ? 'text-white' : 'text-gray-300'}`}>{message.name}</h4>
                {isPinned && <i className="fa-solid fa-thumbtack text-[8px] text-blue-400 rotate-45"></i>}
            </div>
            <span className="text-[9px] text-gray-600 font-mono">{message.time}</span>
        </div>
        <p className={`text-[11px] truncate ${isActive ? 'text-blue-400 font-medium' : 'text-gray-500'}`}>
            {message.isQuestion && <span className="text-amber-500 font-bold mr-1">?</span>}
            {message.snippet}
        </p>
    </div>

    {/* Quick Actions (Pin/Save) - Visible on Hover */}
    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex">
         <button 
            onClick={onPin}
            className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-colors ${isPinned ? 'bg-blue-500 text-white border-blue-400' : 'bg-[#0B151E] text-gray-400 border-white/10 hover:text-white'}`}
            title="Pin Chat"
         >
             <i className="fa-solid fa-thumbtack text-[10px]"></i>
         </button>
         <button 
            onClick={onSave}
            className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-colors ${message.isSaved ? 'bg-rose-500 text-white border-rose-400' : 'bg-[#0B151E] text-gray-400 border-white/10 hover:text-white'}`}
            title="Save Chat"
         >
             <i className="fa-solid fa-heart text-[10px]"></i>
         </button>
    </div>
  </div>
);

const ChatBubble: React.FC<{ msg: ChatMessage }> = ({ msg }) => {
    const isMe = msg.sender === 'me';
    return (
        <div className={`flex w-full mb-4 ${isMe ? 'justify-end' : 'justify-start'}`}>
            <div className={`
                max-w-[75%] rounded-[20px] p-4 relative text-[13px] leading-relaxed font-medium shadow-lg
                ${isMe 
                    ? 'bg-blue-600 text-white rounded-tr-sm' 
                    : 'bg-[#1A2633] text-gray-200 border border-white/5 rounded-tl-sm'
                }
            `}>
                <p>{msg.text}</p>
                <span className={`text-[9px] absolute bottom-1 ${isMe ? 'left-2 text-blue-200' : 'right-2 text-gray-500'}`}>{msg.time}</span>
            </div>
        </div>
    );
};

const Messages: React.FC = () => {
  const navigate = useNavigate();
  const [selectedChatId, setSelectedChatId] = useState<string | null>('1');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [filter, setFilter] = useState<'sve' | 'spaseno' | 'pitanja'>('sve');
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  
  // Initialize messages state so we can update isSaved property locally
  const [contactsData, setContactsData] = useState<MessageItem[]>(INITIAL_MESSAGES);
  
  // Dummy Chat State
  const [history, setHistory] = useState(MOCK_CHAT_HISTORY);

  // Toggle Pin Logic
  const handlePin = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setPinnedIds(prev => 
          prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
      );
  };

  // Toggle Save Logic
  const handleSave = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setContactsData(prev => prev.map(c => 
          c.id === id ? { ...c, isSaved: !c.isSaved } : c
      ));
  };

  // Filter & Sort Contacts
  const processedContacts = useMemo(() => {
    let filtered = contactsData.filter(m => {
        // 1. Search Filter
        const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              m.item.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesSearch) return false;

        // 2. Tab Filter
        if (filter === 'spaseno') return m.isSaved;
        if (filter === 'pitanja') return m.isQuestion;
        
        return true;
    });

    // 3. Sort by Pinned
    return filtered.sort((a, b) => {
        const isAPinned = pinnedIds.includes(a.id) ? 1 : 0;
        const isBPinned = pinnedIds.includes(b.id) ? 1 : 0;
        return isBPinned - isAPinned; // Pinned first
    });
  }, [contactsData, searchQuery, filter, pinnedIds]);

  const activeContact = useMemo(() => 
    contactsData.find(m => m.id === selectedChatId) || null
  , [selectedChatId, contactsData]);

  const activeMessages = useMemo(() => 
    (selectedChatId && history[selectedChatId]) ? history[selectedChatId] : history['default']
  , [selectedChatId, history]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages, selectedChatId]);

  const handleSend = () => {
    if(!inputText.trim() || !selectedChatId) return;
    
    const newMsg: ChatMessage = {
        id: Date.now().toString(),
        text: inputText,
        sender: 'me',
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };

    setHistory(prev => ({
        ...prev,
        [selectedChatId]: [...(prev[selectedChatId] || prev['default']), newMsg]
    }));
    setInputText('');
  };

  return (
    <Layout 
      title="Poruke" 
      showSigurnost={false}
      headerRight={null}
    >
      <div className="flex h-[calc(100vh-140px)] max-w-5xl mx-auto w-full gap-4 md:gap-6 overflow-hidden pt-2">
        
        {/* --- LEFT SIDEBAR (People) --- */}
        <div className="w-[60px] md:w-[260px] lg:w-[300px] flex flex-col gap-3 shrink-0 transition-all duration-300">
            
            {/* Search */}
            <div className="relative group shrink-0">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <i className="fa-solid fa-magnifying-glass text-gray-500 text-xs group-focus-within:text-blue-400"></i>
                </div>
                <input 
                    type="text" 
                    placeholder="Traži..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#121C26] border border-white/5 rounded-[16px] py-3.5 pl-10 pr-4 text-xs text-white placeholder:text-gray-600 outline-none focus:border-blue-500/30 transition-all hidden md:block"
                />
                <button className="w-full h-12 bg-[#121C26] rounded-[16px] border border-white/5 flex items-center justify-center md:hidden text-gray-500">
                    <i className="fa-solid fa-magnifying-glass"></i>
                </button>
            </div>

            {/* Filter Tabs (Desktop only) */}
            <div className="hidden md:flex bg-[#121C26] border border-white/5 rounded-[14px] p-1 shrink-0">
                {[
                    { id: 'sve', label: 'SVE' },
                    { id: 'spaseno', label: 'SPAŠENO' },
                    { id: 'pitanja', label: 'PITANJA' }
                ].map((tab) => (
                    <button 
                        key={tab.id}
                        onClick={() => setFilter(tab.id as any)}
                        className={`flex-1 py-2 rounded-[10px] text-[9px] font-black uppercase tracking-wider transition-all relative overflow-hidden ${
                            filter === tab.id 
                            ? 'bg-white/10 text-white shadow-inner' 
                            : 'text-gray-500 hover:text-gray-400'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Contact List */}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-1 pr-1">
                {processedContacts.length > 0 ? (
                    processedContacts.map((contact) => (
                        <ContactRow 
                            key={contact.id} 
                            message={contact} 
                            isActive={selectedChatId === contact.id}
                            isPinned={pinnedIds.includes(contact.id)}
                            onClick={() => setSelectedChatId(contact.id)}
                            onPin={(e) => handlePin(e, contact.id)}
                            onSave={(e) => handleSave(e, contact.id)}
                        />
                    ))
                ) : (
                    <div className="text-center py-10 opacity-50">
                        <i className="fa-solid fa-filter text-gray-600 mb-2"></i>
                        <p className="text-[10px] text-gray-500 uppercase">Nema rezultata</p>
                    </div>
                )}
            </div>
        </div>

        {/* --- RIGHT CHAT AREA (Main Content) --- */}
        <div className="flex-1 bg-[#121C26]/50 backdrop-blur-md rounded-[32px] border border-white/5 flex flex-col relative overflow-hidden shadow-2xl">
            {activeContact ? (
                <>
                    {/* Chat Header */}
                    <div className="h-20 border-b border-white/5 flex items-center justify-between px-6 bg-[#121C26]/80 shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <img src={activeContact.avatar} alt={activeContact.name} className="w-10 h-10 rounded-[12px] object-cover bg-gray-800" />
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-[#121C26] rounded-full"></div>
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-white leading-none flex gap-2 items-center">
                                    {activeContact.name}
                                    {pinnedIds.includes(activeContact.id) && <i className="fa-solid fa-thumbtack text-[8px] text-blue-400 rotate-45"></i>}
                                </h3>
                                <p className="text-[10px] text-blue-400 font-bold mt-1 truncate max-w-[150px] md:max-w-xs">{activeContact.item}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={(e) => handlePin(e, activeContact.id)}
                                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${pinnedIds.includes(activeContact.id) ? 'bg-blue-500 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                                title={pinnedIds.includes(activeContact.id) ? "Unpin" : "Pin"}
                            >
                                <i className="fa-solid fa-thumbtack text-xs"></i>
                            </button>
                            <button className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                                <i className="fa-solid fa-ellipsis-vertical text-xs"></i>
                            </button>
                        </div>
                    </div>

                    {/* Messages Scroll Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-2 no-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed bg-opacity-5">
                        <div className="text-center py-6">
                            <span className="bg-[#1A2633] text-gray-500 text-[9px] px-3 py-1 rounded-full border border-white/5">Danas</span>
                        </div>
                        
                        {/* Item Snippet Card in Chat */}
                        <div className="mx-auto max-w-sm bg-[#0B151E] border border-white/10 rounded-[16px] p-3 mb-6 flex gap-3 items-center opacity-80 hover:opacity-100 transition-opacity cursor-pointer">
                            <div className="w-12 h-12 rounded-lg bg-gray-800 overflow-hidden">
                                <img src={`https://picsum.photos/seed/${activeContact.item}/100/100`} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-xs font-bold text-white">{activeContact.item}</h4>
                                <span className="text-[10px] text-blue-400 font-bold">€{Math.floor(Math.random() * 500) + 100}</span>
                            </div>
                            <i className="fa-solid fa-chevron-right text-gray-600 text-xs pr-2"></i>
                        </div>

                        {activeMessages.map((msg) => (
                            <ChatBubble key={msg.id} msg={msg} />
                        ))}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-[#121C26] border-t border-white/5 shrink-0">
                        <div className="flex items-end gap-3 bg-[#0B151E] border border-white/10 rounded-[24px] p-2 focus-within:border-blue-500/50 transition-colors shadow-lg">
                            <button className="w-10 h-10 rounded-full text-gray-400 hover:text-blue-400 hover:bg-white/5 flex items-center justify-center transition-colors">
                                <i className="fa-solid fa-plus"></i>
                            </button>
                            <textarea 
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={(e) => {
                                    if(e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                placeholder="Napiši poruku..." 
                                rows={1}
                                className="flex-1 bg-transparent text-sm text-white py-3 max-h-32 focus:outline-none resize-none no-scrollbar placeholder:text-gray-600"
                            />
                            <button 
                                onClick={handleSend}
                                disabled={!inputText.trim()}
                                className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                            >
                                <i className="fa-solid fa-paper-plane text-xs"></i>
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-40">
                    <div className="w-24 h-24 rounded-[32px] bg-white/5 flex items-center justify-center mb-6 rotate-12">
                        <i className="fa-solid fa-comments text-4xl text-white"></i>
                    </div>
                    <h2 className="text-xl font-black text-white uppercase tracking-widest mb-2">Comms Center</h2>
                    <p className="text-sm text-gray-400">Izaberi konverzaciju s lijeve strane za početak.</p>
                </div>
            )}
        </div>

      </div>
    </Layout>
  );
};

export default Messages;
