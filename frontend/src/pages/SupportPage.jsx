import React, { useState, useEffect, useContext } from 'react';
import { HelpCircle, Plus, Send, MessageSquare, ShieldCheck, User, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { formatDate } from '../utils/formatters';
import api from '../services/api';

export default function SupportPage() {
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);

  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // New ticket state
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Account Issues');
  const [priority, setPriority] = useState('Medium');
  const [description, setDescription] = useState('');

  const fetchTickets = async () => {
    try {
      const res = await api.get('/support');
      const tList = res.data.tickets || [];
      setTickets(tList);
      if (tList.length > 0 && !selectedTicket) {
        handleSelectTicket(tList[0]);
      }
    } catch (err) {
      toast.error('Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSelectTicket = async (t) => {
    setSelectedTicket(t);
    try {
      const res = await api.get(`/support/${t._id}/messages`);
      setMessages(res.data.messages || []);
      if (socket) {
        socket.emit('join_ticket_room', t._id);
      }
    } catch (err) {
      console.error('Failed to load messages', err);
    }
  };

  // Socket listener for incoming chat messages
  useEffect(() => {
    if (socket && selectedTicket) {
      const handleNewMessage = (msg) => {
        if (msg.ticket === selectedTicket._id) {
          setMessages((prev) => [...prev, msg]);
        }
      };
      socket.on('new_message', handleNewMessage);
      return () => socket.off('new_message', handleNewMessage);
    }
  }, [socket, selectedTicket]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageText.trim() || !selectedTicket) return;
    try {
      const res = await api.post(`/support/${selectedTicket._id}/messages`, {
        message: newMessageText
      });
      setMessages((prev) => [...prev, res.data.message]);
      setNewMessageText('');
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/support', { subject, category, priority, description });
      toast.success('Support ticket created!');
      setCreateModalOpen(false);
      setSubject('');
      setDescription('');
      fetchTickets();
      handleSelectTicket(res.data.ticket);
    } catch (err) {
      toast.error('Failed to create ticket');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Finova Support & Live Chat</h1>
          <p className="text-xs text-slate-400 mt-1">Submit tickets and chat in real-time with Finova support specialists</p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Support Ticket</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[500px]">
        {/* Left Column: Tickets List */}
        <div className="lg:col-span-1 glass-panel rounded-2xl border border-slate-800 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-800 font-bold text-white text-xs uppercase tracking-wider">
            Your Support Tickets ({tickets.length})
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2">
            {tickets.map((t) => (
              <button
                key={t._id}
                onClick={() => handleSelectTicket(t)}
                className={`w-full text-left p-3.5 rounded-xl transition-all ${
                  selectedTicket?._id === t._id ? 'bg-cyan-500/20 border border-cyan-500/30' : 'hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-cyan-400 text-xs font-semibold">{t.ticketId}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {t.status}
                  </span>
                </div>
                <p className="text-sm font-bold text-white mt-1 truncate">{t.subject}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{t.category} • {formatDate(t.updatedAt)}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Real-Time Chat View */}
        <div className="lg:col-span-2 glass-panel rounded-2xl border border-slate-800 flex flex-col h-[550px]">
          {selectedTicket ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-cyan-400 font-bold text-xs">{selectedTicket.ticketId}</span>
                    <h3 className="text-sm font-bold text-white">{selectedTicket.subject}</h3>
                  </div>
                  <p className="text-[10px] text-slate-400">Category: {selectedTicket.category} • Priority: {selectedTicket.priority}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                  {selectedTicket.status}
                </span>
              </div>

              {/* Chat Messages Body */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {messages.map((m) => {
                  const isMe = m.senderRole === user?.role && m.senderName === user?.fullName;
                  return (
                    <div key={m._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 mb-1">
                        <span className="font-bold text-slate-300">{m.senderName}</span>
                        <span>({m.senderRole})</span>
                        <span>• {formatDate(m.createdAt)}</span>
                      </div>
                      <div
                        className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                          isMe
                            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none shadow-md'
                            : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                        }`}
                      >
                        {m.message}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  placeholder="Type your message to support..."
                  className="flex-1 px-4 py-2.5 rounded-xl glass-input text-xs"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center space-x-1"
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
              Select a support ticket to start chatting.
            </div>
          )}
        </div>
      </div>

      {/* Create Ticket Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel border border-slate-700 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Create Support Ticket</h3>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Question regarding wire transfer limits"
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2.5 rounded-xl glass-input text-xs">
                    {['Account Issues', 'Transactions', 'Cards', 'Loans', 'Technical', 'General'].map((c) => (
                      <option key={c} value={c} className="bg-slate-900">{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Priority</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full px-3 py-2.5 rounded-xl glass-input text-xs">
                    {['Low', 'Medium', 'High', 'Urgent'].map((p) => (
                      <option key={p} value={p} className="bg-slate-900">{p}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Description</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your issue in detail..."
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-xs"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setCreateModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs">Submit Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
