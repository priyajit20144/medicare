import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Search,
  Send,
  User,
  Paperclip,
  CheckCheck,
  FileText,
  Phone,
  Video,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';

interface MessagesViewProps {
  onViewEHR?: (patient: any) => void;
}

const CHAT_THREADS = [
  {
    id: 't-1',
    patientName: 'Sarah Jenkins',
    patientAge: 32,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    lastMessage: 'Good morning Dr. Reyes, thank you for the consultation notes and morning exercise plan.',
    time: '10:15 AM',
    unreadCount: 1,
    online: true,
    condition: 'Cardiac Evaluation',
    messages: [
      { id: 'm1', sender: 'doctor', text: 'Hello Sarah, I reviewed your morning blood pressure readings. They are looking stable at 118/78 mmHg.', time: '09:40 AM' },
      { id: 'm2', sender: 'patient', text: 'That is great news! Should I continue the current dosage of the prescribed multivitamins?', time: '10:05 AM' },
      { id: 'm3', sender: 'doctor', text: 'Yes, please continue the morning routine. Ensure high hydration throughout the day.', time: '10:12 AM' },
      { id: 'm4', sender: 'patient', text: 'Good morning Dr. Reyes, thank you for the consultation notes and morning exercise plan.', time: '10:15 AM' },
    ],
  },
  {
    id: 't-2',
    patientName: 'James Wilson',
    patientAge: 45,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
    lastMessage: 'Will arrive 10 minutes early for the in-clinic ECG checkup tomorrow.',
    time: 'Yesterday',
    unreadCount: 1,
    online: false,
    condition: 'Essential Hypertension',
    messages: [
      { id: 'm1', sender: 'patient', text: 'Dr. Reyes, should I take my morning blood pressure tablet before the ECG visit?', time: 'Yesterday' },
      { id: 'm2', sender: 'doctor', text: 'Yes James, take your regular medication as usual with water.', time: 'Yesterday' },
      { id: 'm3', sender: 'patient', text: 'Will arrive 10 minutes early for the in-clinic ECG checkup tomorrow.', time: 'Yesterday' },
    ],
  },
  {
    id: 't-3',
    patientName: 'Priya Sharma',
    patientAge: 28,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    lastMessage: 'The sleep tracker data was synced to the health portal.',
    time: '2 days ago',
    unreadCount: 0,
    online: true,
    condition: 'Migraine & Sleep',
    messages: [
      { id: 'm1', sender: 'patient', text: 'The sleep tracker data was synced to the health portal.', time: '2 days ago' },
      { id: 'm2', sender: 'doctor', text: 'Thank you Priya, I am inspecting the deep sleep intervals.', time: '2 days ago' },
    ],
  },
  {
    id: 't-4',
    patientName: 'Pharmacist Liam Vance',
    patientAge: 39,
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200',
    lastMessage: 'Prescription #PR-1022 verified and dispensed successfully.',
    time: 'Oct 04',
    unreadCount: 0,
    online: false,
    condition: 'Medicare Central Pharmacy',
    messages: [
      { id: 'm1', sender: 'doctor', text: 'Hi Liam, please confirm if the generic equivalent for Amlodipine is stocked.', time: 'Oct 04' },
      { id: 'm2', sender: 'patient', text: 'Prescription #PR-1022 verified and dispensed successfully.', time: 'Oct 04' },
    ],
  },
];

const QUICK_REPLIES = [
  'Please take your medication with food and water.',
  'Your vitals and recent readings look within normal range.',
  'Let us schedule an in-clinic examination next week.',
  'Please report immediately if you experience dizziness.',
];

export const MessagesView: React.FC<MessagesViewProps> = ({ onViewEHR }) => {
  const [threads, setThreads] = useState(CHAT_THREADS);
  const [selectedThreadId, setSelectedThreadId] = useState<string>('t-1');
  const [inputText, setInputText] = useState('');
  const [search, setSearch] = useState('');

  const activeThread = threads.find((t) => t.id === selectedThreadId) || threads[0];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage = {
      id: `m-${Date.now()}`,
      sender: 'doctor',
      text: inputText.trim(),
      time: 'Just now',
    };

    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThread.id
          ? {
              ...t,
              messages: [...t.messages, newMessage],
              lastMessage: inputText.trim(),
              time: 'Just now',
            }
          : t
      )
    );

    setInputText('');
  };

  const handleQuickReply = (reply: string) => {
    setInputText(reply);
  };

  const filteredThreads = threads.filter((t) =>
    t.patientName.toLowerCase().includes(search.toLowerCase()) ||
    t.lastMessage.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-teal-500/10 text-teal-700 border border-teal-500/20">
            <MessageSquare className="w-5 h-5 text-teal-600" />
          </span>
          <h1 className="text-2xl font-black text-slate-900">Clinical Messaging Center</h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Direct HIPAA-compliant clinical messaging with patients, consultation follow-ups, and pharmacy team members.
        </p>
      </div>

      {/* Main Two-Column Messenger */}
      <div className="bg-white border border-slate-200/90 rounded-3xl shadow-xs overflow-hidden h-[calc(100vh-220px)] min-h-[580px] flex flex-col md:flex-row">
        {/* Left Column: Threads List */}
        <div className="w-full md:w-80 lg:w-96 border-r border-slate-200/80 flex flex-col h-full bg-slate-50/50">
          <div className="p-3.5 border-b border-slate-200/80 bg-white">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredThreads.map((thread) => {
              const isSelected = thread.id === activeThread.id;
              return (
                <button
                  key={thread.id}
                  onClick={() => setSelectedThreadId(thread.id)}
                  className={`w-full p-3.5 flex items-start gap-3 transition text-left ${
                    isSelected ? 'bg-white shadow-xs' : 'hover:bg-slate-100/60'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={thread.avatar}
                      alt={thread.patientName}
                      className="w-11 h-11 rounded-2xl object-cover border border-slate-200"
                    />
                    {thread.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                        {thread.patientName}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-medium">{thread.time}</span>
                    </div>

                    <p className="text-[11px] text-teal-700 font-semibold truncate mt-0.5">
                      {thread.condition}
                    </p>

                    <p className="text-xs text-slate-500 truncate mt-1">
                      {thread.lastMessage}
                    </p>
                  </div>

                  {thread.unreadCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0 self-center">
                      {thread.unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Chat Conversation Stream */}
        <div className="flex-1 flex flex-col h-full bg-white min-w-0">
          {/* Chat Header */}
          <div className="px-5 py-3.5 border-b border-slate-200/80 flex items-center justify-between gap-3 bg-white">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={activeThread.avatar}
                alt={activeThread.patientName}
                className="w-10 h-10 rounded-2xl object-cover border border-slate-200 flex-shrink-0"
              />
              <div className="min-w-0">
                <h3 className="font-extrabold text-slate-900 text-sm truncate">
                  {activeThread.patientName}
                </h3>
                <span className="text-[11px] text-slate-400 block truncate">
                  {activeThread.condition} • {activeThread.online ? 'Online now' : 'Offline'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onViewEHR && (
                <button
                  onClick={() => onViewEHR(activeThread)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">EHR Record</span>
                </button>
              )}
            </div>
          </div>

          {/* Messages Flow */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-slate-50/30">
            {activeThread.messages.map((m) => {
              const isMe = m.sender === 'doctor';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-md p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isMe
                        ? 'bg-teal-600 text-white rounded-tr-xs shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-xs'
                    }`}
                  >
                    <p>{m.text}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {m.time} {isMe && '• Sent'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Quick Replies Tray */}
          <div className="px-4 py-2 border-t border-slate-100 bg-white flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
              <Sparkles className="w-3 h-3 text-teal-600" /> Quick Replies:
            </span>
            {QUICK_REPLIES.map((r, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickReply(r)}
                className="text-[11px] font-medium bg-slate-100 hover:bg-teal-50 hover:text-teal-800 hover:border-teal-300 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 shrink-0 transition"
              >
                {r.slice(0, 32)}...
              </button>
            ))}
          </div>

          {/* Chat Composer */}
          <form onSubmit={handleSend} className="p-3.5 border-t border-slate-200/80 bg-white flex items-center gap-2">
            <input
              type="text"
              placeholder={`Write a message to ${activeThread.patientName}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-500"
            />

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition flex-shrink-0"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
