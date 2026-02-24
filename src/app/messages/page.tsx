'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import {
  getConversations,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  subscribeToMessages,
  unsubscribeFromMessages,
} from '@/services/messageService';
import type { ConversationWithUsers, MessageWithSender } from '@/lib/database.types';

// ─── UI types ─────────────────────────────────────────

interface ContactItem {
  id: string; // conversation id
  name: string;
  item: string;
  snippet: string;
  time: string;
  isSaved?: boolean;
  avatar?: string;
  otherUserId: string;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'me' | 'them';
  time: string;
}

// ─── Helpers ──────────────────────────────────────────

function formatTime(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const diffDays = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (diffDays === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Jučer';
  const days = ['Ned', 'Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub'];
  if (diffDays < 7) return days[date.getDay()];
  return date.toLocaleDateString('hr', { day: '2-digit', month: '2-digit' });
}

function convToContact(conv: ConversationWithUsers, myId: string): ContactItem {
  const other = conv.user1_id === myId ? conv.user2 : conv.user1;
  return {
    id: conv.id,
    name: other?.username || 'Korisnik',
    item: 'Poruka',
    snippet: conv.last_message?.content || (conv.last_message_at ? 'Poruka...' : 'Početak razgovora'),
    time: formatTime(conv.last_message_at),
    avatar: other?.avatar_url || `https://picsum.photos/seed/${other?.username || conv.id}/100/100`,
    otherUserId: other?.id || '',
  };
}

function dbMsgToChat(msg: MessageWithSender, myId: string): ChatMessage {
  return {
    id: msg.id,
    text: msg.content,
    sender: msg.sender_id === myId ? 'me' : 'them',
    time: formatTime(msg.created_at),
  };
}

// ─── Sub-components ───────────────────────────────────

const ContactRow: React.FC<{
  contact: ContactItem;
  isActive: boolean;
  isPinned: boolean;
  onClick: () => void;
  onPin: (e: React.MouseEvent) => void;
  onSave: (e: React.MouseEvent) => void;
}> = ({ contact, isActive, isPinned, onClick, onPin, onSave }) => (
  <div
    onClick={onClick}
    className={`
      group relative flex items-center gap-3 p-2.5 sm:p-3 rounded-[16px] cursor-pointer transition-all duration-200 border overflow-hidden
      ${isActive
        ? 'bg-blue-600/10 border-blue-500/50 shadow-[inset_0_0_20px_rgba(37,99,235,0.1)]'
        : isPinned
            ? 'bg-[var(--c-card)] border-blue-500/20'
            : 'bg-transparent border-transparent hover:bg-[var(--c-hover)] hover:border-[var(--c-border)]'
      }
    `}
  >
    {isPinned && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 shadow-[0_0_10px_#3B82F6]"></div>}

    <div className="relative shrink-0">
      <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-[14px] p-[2px] ${isActive ? 'bg-blue-500' : 'bg-[var(--c-active)] group-hover:bg-[var(--c-border2)]'} transition-colors`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover rounded-[12px] bg-[var(--c-card-alt)]" />
      </div>
    </div>

    <div className="flex-1 min-w-0 hidden md:block pr-6 group-hover:pr-14 transition-all">
      <div className="flex justify-between items-baseline mb-0.5">
        <div className="flex items-center gap-1.5">
          <h4 className={`text-[13px] font-bold truncate ${isActive ? 'text-[var(--c-text)]' : 'text-[var(--c-text2)]'}`}>{contact.name}</h4>
          {isPinned && <i className="fa-solid fa-thumbtack text-[8px] text-blue-400 rotate-45"></i>}
        </div>
        <span className="text-[9px] text-[var(--c-text3)] font-mono">{contact.time}</span>
      </div>
      <p className={`text-[11px] truncate ${isActive ? 'text-blue-400 font-medium' : 'text-[var(--c-text3)]'}`}>
        {contact.snippet}
      </p>
    </div>

    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex">
      <button
        onClick={onPin}
        className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-colors ${isPinned ? 'bg-blue-500 text-white border-blue-400' : 'bg-[var(--c-card-alt)] text-[var(--c-text3)] border-[var(--c-border2)] hover:text-[var(--c-text)]'}`}
        title="Pin Chat"
      >
        <i className="fa-solid fa-thumbtack text-[10px]"></i>
      </button>
      <button
        onClick={onSave}
        className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-colors ${contact.isSaved ? 'bg-rose-500 text-white border-rose-400' : 'bg-[var(--c-card-alt)] text-[var(--c-text3)] border-[var(--c-border2)] hover:text-[var(--c-text)]'}`}
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
    <div className={`flex w-full mb-3 ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div className={`
          max-w-[80%] sm:max-w-[70%] rounded-[18px] px-4 py-3 relative text-[13px] leading-relaxed font-medium
          ${isMe
              ? 'bg-blue-600 text-white rounded-br-[6px] shadow-md shadow-blue-500/20'
              : 'bg-[var(--c-card)] text-[var(--c-text2)] border border-[var(--c-border)] rounded-bl-[6px] shadow-sm'
          }
      `}>
        <p className="pb-3">{msg.text}</p>
        <span className={`text-[9px] absolute bottom-1.5 ${isMe ? 'right-3 text-blue-200/70' : 'right-3 text-[var(--c-text3)]'}`}>{msg.time}</span>
      </div>
    </div>
  );
};

// ─── localStorage helpers ─────────────────────────────

const PINNED_KEY = 'nudinadi_pinned_convos';
const SAVED_KEY = 'nudinadi_saved_convos';

function loadIds(key: string): string[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(key) ?? '[]'); } catch { return []; }
}

// ─── Main Page Content ────────────────────────────────

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t } = useI18n();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login?redirect=/messages');
    }
  }, [isLoading, isAuthenticated, router]);
  const [conversations, setConversations] = useState<ContactItem[]>([]);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'sve' | 'spaseno'>('sve');
  const [pinnedIds, setPinnedIds] = useState<string[]>(() => loadIds(PINNED_KEY));
  const [savedIds, setSavedIds] = useState<string[]>(() => loadIds(SAVED_KEY));
  const [isSending, setIsSending] = useState(false);

  // ── Persist pin/save to localStorage ─────────────────
  useEffect(() => {
    localStorage.setItem(PINNED_KEY, JSON.stringify(pinnedIds));
  }, [pinnedIds]);

  useEffect(() => {
    localStorage.setItem(SAVED_KEY, JSON.stringify(savedIds));
  }, [savedIds]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const currentConvIdRef = useRef<string | null>(null);

  // ── Load Conversations ───────────────────────────────
  const loadConversations = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await getConversations(user.id);
      const contacts = data.map(c => convToContact(c, user.id));
      setConversations(contacts);

      // Auto-select from URL param or first conversation (only if none selected yet)
      const urlConv = searchParams.get('conversation');
      if (urlConv && contacts.some(c => c.id === urlConv)) {
        setSelectedConvId(urlConv);
      } else {
        setSelectedConvId(prev => prev ?? contacts[0]?.id ?? null);
      }
    } catch {
      // silently fail — conversations just won't load
    } finally {
      setLoadingConvos(false);
    }
  }, [user?.id, searchParams]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // ── Load Messages when conversation changes ──────────
  useEffect(() => {
    if (!selectedConvId || !user?.id) return;

    // Unsubscribe from previous conversation
    if (currentConvIdRef.current && currentConvIdRef.current !== selectedConvId) {
      unsubscribeFromMessages(currentConvIdRef.current);
    }
    currentConvIdRef.current = selectedConvId;

    setLoadingMessages(true);
    setChatMessages([]);

    getMessages(selectedConvId).then(msgs => {
      setChatMessages(msgs.map(m => dbMsgToChat(m, user.id)));
      setLoadingMessages(false);
    }).catch(() => setLoadingMessages(false));

    // Mark as read
    markMessagesAsRead(selectedConvId, user.id).catch(() => {});

    // Realtime subscription
    const channel = subscribeToMessages(selectedConvId, (newMsg) => {
      setChatMessages(prev => {
        // Avoid duplicates (optimistic updates)
        if (prev.some(m => m.id === newMsg.id)) return prev;
        return [...prev, dbMsgToChat({ ...newMsg, sender: { id: '', username: '', avatar_url: null, bio: null, level: 1, xp: 0, total_sales: 0, total_purchases: 0, rating_average: null, location: null, created_at: '', updated_at: '' } } as MessageWithSender, user.id)];
      });
      // Update snippet in sidebar
      setConversations(prev => prev.map(c =>
        c.id === selectedConvId ? { ...c, snippet: newMsg.content, time: formatTime(newMsg.created_at) } : c
      ));
    });

    return () => {
      channel.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConvId, user?.id]);

  // ── Scroll to bottom on new messages ────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // ── Handle Send ──────────────────────────────────────
  const handleSend = useCallback(async () => {
    if (!inputText.trim() || !selectedConvId || !user?.id || isSending) return;

    const text = inputText.trim();
    setInputText('');

    // Optimistic add
    const optimisticId = `opt-${Date.now()}`;
    const optimistic: ChatMessage = {
      id: optimisticId,
      text,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages(prev => [...prev, optimistic]);
    setIsSending(true);

    try {
      const sent = await sendMessage({
        conversation_id: selectedConvId,
        sender_id: user.id,
        content: text,
      });
      // Replace optimistic with real
      setChatMessages(prev => prev.map(m => m.id === optimisticId
        ? { ...m, id: sent.id }
        : m
      ));
      // Update sidebar snippet
      setConversations(prev => prev.map(c =>
        c.id === selectedConvId ? { ...c, snippet: text, time: formatTime(sent.created_at) } : c
      ));
    } catch {
      // Remove optimistic message on error
      setChatMessages(prev => prev.filter(m => m.id !== optimisticId));
      setInputText(text);
    } finally {
      setIsSending(false);
    }
  }, [inputText, selectedConvId, user?.id, isSending]);

  const handlePin = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setPinnedIds(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const handleSave = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSavedIds(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const processedContacts = useMemo(() => {
    const withSaved = conversations.map(c => ({ ...c, isSaved: savedIds.includes(c.id) }));
    let filtered = withSaved.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (filter === 'spaseno') return m.isSaved;
      return true;
    });
    return filtered.sort((a, b) => {
      const aP = pinnedIds.includes(a.id) ? 1 : 0;
      const bP = pinnedIds.includes(b.id) ? 1 : 0;
      return bP - aP;
    });
  }, [conversations, searchQuery, filter, pinnedIds, savedIds]);

  const activeContact = useMemo(() =>
    conversations.find(c => c.id === selectedConvId) || null
  , [selectedConvId, conversations]);

  if (isLoading) {
    return (
      <MainLayout title="Poruke" showSigurnost={false} headerRight={null}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <i className="fa-solid fa-spinner animate-spin text-2xl text-blue-500"></i>
        </div>
      </MainLayout>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <MainLayout title="Poruke" showSigurnost={false} headerRight={null}>
      <div className="flex h-[calc(100vh-140px)] max-w-5xl mx-auto w-full gap-2 sm:gap-4 md:gap-6 overflow-hidden pt-2">

        {/* --- LEFT SIDEBAR (People) --- */}
        <div className="w-[56px] sm:w-[68px] md:w-[260px] lg:w-[300px] flex flex-col gap-2 sm:gap-3 shrink-0 transition-all duration-300">

          {/* Search — desktop: full input, mobile: icon-only button */}
          <div className="relative group shrink-0">
            {/* Desktop search input */}
            <div className="hidden md:block relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <i className="fa-solid fa-magnifying-glass text-[var(--c-text3)] text-xs group-focus-within:text-blue-400"></i>
              </div>
              <input
                type="text"
                placeholder={t('messages.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--c-card)] border border-[var(--c-border)] rounded-[16px] py-3.5 pl-10 pr-4 text-xs text-[var(--c-text)] placeholder:text-[var(--c-placeholder)] outline-none focus:border-blue-500/30 transition-all"
              />
            </div>
            {/* Mobile search button */}
            <button className="w-full h-11 sm:h-12 bg-[var(--c-card)] rounded-[12px] sm:rounded-[16px] border border-[var(--c-border)] flex items-center justify-center md:hidden text-[var(--c-text3)]">
              <i className="fa-solid fa-magnifying-glass"></i>
            </button>
          </div>

          {/* Filter Tabs (Desktop only) */}
          <div className="hidden md:flex bg-[var(--c-card)] border border-[var(--c-border)] rounded-[14px] p-1 shrink-0">
            {[
              { id: 'sve', label: t('messages.all') },
              { id: 'spaseno', label: t('messages.saved') },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as 'sve' | 'spaseno')}
                className={`flex-1 py-2 rounded-[10px] text-[9px] font-black uppercase tracking-wider transition-all ${
                  filter === tab.id
                  ? 'bg-[var(--c-active)] text-[var(--c-text)] shadow-inner'
                  : 'text-[var(--c-text3)] hover:text-[var(--c-text2)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Contact List */}
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-1 pr-1">
            {loadingConvos ? (
              <div className="space-y-2 px-1">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-[var(--c-card)] border border-[var(--c-border)] rounded-[16px] animate-pulse"></div>
                ))}
              </div>
            ) : processedContacts.length > 0 ? (
              processedContacts.map((contact) => (
                <ContactRow
                  key={contact.id}
                  contact={contact}
                  isActive={selectedConvId === contact.id}
                  isPinned={pinnedIds.includes(contact.id)}
                  onClick={() => setSelectedConvId(contact.id)}
                  onPin={(e) => handlePin(e, contact.id)}
                  onSave={(e) => handleSave(e, contact.id)}
                />
              ))
            ) : (
              <div className="text-center py-10 opacity-50">
                <i className="fa-solid fa-comments text-[var(--c-text3)] text-2xl mb-2"></i>
                <p className="text-[10px] text-[var(--c-text3)] uppercase mt-2">{t('messages.noResults')}</p>
              </div>
            )}
          </div>
        </div>

        {/* --- RIGHT CHAT AREA --- */}
        <div className="flex-1 min-w-0 bg-[var(--c-card)]/50 backdrop-blur-md rounded-[20px] sm:rounded-[32px] border border-[var(--c-border)] flex flex-col relative overflow-hidden shadow-2xl">
          {activeContact ? (
            <>
              {/* Chat Header */}
              <div className="h-16 sm:h-20 border-b border-[var(--c-border)] flex items-center justify-between px-4 sm:px-6 bg-[var(--c-card)]/80 shrink-0">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={activeContact.avatar} alt={activeContact.name} className="w-10 h-10 sm:w-11 sm:h-11 rounded-[12px] object-cover bg-[var(--c-card-alt)]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[var(--c-text)] leading-none flex gap-2 items-center">
                      {activeContact.name}
                      {pinnedIds.includes(activeContact.id) && <i className="fa-solid fa-thumbtack text-[8px] text-blue-400 rotate-45"></i>}
                    </h3>
                    <p className="text-[10px] text-blue-400 font-bold mt-1">
                      {activeContact.snippet}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => handlePin(e, activeContact.id)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${pinnedIds.includes(activeContact.id) ? 'bg-blue-500 text-white' : 'bg-[var(--c-hover)] text-[var(--c-text3)] hover:text-[var(--c-text)]'}`}
                    title={pinnedIds.includes(activeContact.id) ? 'Unpin' : 'Pin'}
                  >
                    <i className="fa-solid fa-thumbtack text-xs"></i>
                  </button>
                  <button className="w-9 h-9 rounded-full bg-[var(--c-hover)] hover:bg-[var(--c-active)] flex items-center justify-center text-[var(--c-text3)] hover:text-[var(--c-text)] transition-colors">
                    <i className="fa-solid fa-ellipsis-vertical text-xs"></i>
                  </button>
                </div>
              </div>

              {/* Messages Scroll Area */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-1 no-scrollbar">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full opacity-50">
                    <i className="fa-solid fa-circle-notch fa-spin text-blue-400 text-xl"></i>
                  </div>
                ) : chatMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full opacity-40 text-center">
                    <i className="fa-solid fa-comment-dots text-3xl text-[var(--c-text3)] mb-3"></i>
                    <p className="text-[12px] text-[var(--c-text3)]">{t('messages.noMessages')}<br />{t('messages.sendFirst')}</p>
                  </div>
                ) : (
                  <>
                    <div className="text-center py-6">
                      <span className="bg-[var(--c-card)] text-[var(--c-text3)] text-[9px] px-3 py-1 rounded-full border border-[var(--c-border)]">{t('messages.conversation')}</span>
                    </div>
                    {chatMessages.map((msg) => (
                      <ChatBubble key={msg.id} msg={msg} />
                    ))}
                  </>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 sm:p-4 bg-[var(--c-card)] border-t border-[var(--c-border)] shrink-0">
                <div className="flex items-end gap-2 sm:gap-3 bg-[var(--c-card-alt)] border border-[var(--c-border2)] rounded-[20px] sm:rounded-[24px] p-2 sm:p-2 focus-within:border-blue-500/50 transition-colors shadow-md">
                  <button className="w-10 h-10 rounded-full text-[var(--c-text3)] hover:text-blue-400 hover:bg-[var(--c-hover)] flex items-center justify-center transition-colors">
                    <i className="fa-solid fa-plus"></i>
                  </button>
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder={t('messages.placeholder')}
                    rows={1}
                    className="flex-1 bg-transparent text-sm text-[var(--c-text)] py-3 max-h-32 focus:outline-none resize-none no-scrollbar placeholder:text-[var(--c-placeholder)]"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputText.trim() || isSending}
                    className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                  >
                    {isSending
                      ? <i className="fa-solid fa-circle-notch fa-spin text-xs"></i>
                      : <i className="fa-solid fa-paper-plane text-xs"></i>
                    }
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-40">
              <div className="w-24 h-24 rounded-[32px] bg-[var(--c-hover)] flex items-center justify-center mb-6 rotate-12">
                <i className="fa-solid fa-comments text-4xl text-[var(--c-text)]"></i>
              </div>
              <h2 className="text-xl font-black text-[var(--c-text)] uppercase tracking-widest mb-2">{t('messages.commsCenter')}</h2>
              <p className="text-sm text-[var(--c-text3)]">{t('messages.selectConversation')}</p>
            </div>
          )}
        </div>

      </div>
    </MainLayout>
  );
}

export default function MessagesPage() {
  return (
    <Suspense>
      <MessagesContent />
    </Suspense>
  );
}
