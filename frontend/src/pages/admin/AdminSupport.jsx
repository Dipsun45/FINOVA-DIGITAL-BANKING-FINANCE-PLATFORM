import React, { useState, useEffect, useContext } from 'react';
import { HelpCircle, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import { SocketContext } from '../../context/SocketContext';
import { formatDate } from '../../utils/formatters';
import api from '../../services/api';

export default function AdminSupport() {
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);

  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');

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

  useEffect(() => {
    if (socket && selectedTicket) {
      const handleNewMsg = (msg) => {
        if (msg.ticket === selectedTicket._id) {
          setMessages((prev) => [...prev, msg]);
        }
      };
      socket.on('new_message', handleNewMsg);
      return () => socket.off('new_message', handleNewMsg);
    }
  }, [socket, selectedTicket]);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;
    try {
      const res = await api.post(`/support/${selectedTicket._id}/messages`, {
        message: replyText
      });
      setMessages((prev) => [...prev, res.data.message]);
      setReplyText('');
    } catch (err) {
      toast.error('Failed to send reply');
    }
  };

  return (
    <div className="space-y-8">
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h1 className="text-2xl font-extrabold text-white">Admin Support Desk</h1>
        <p className="text-xs text-slate-400 mt-1">Reply to user tickets and provide real-time resolution</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[500px]">
        <div className="lg:col-span-1 glass-panel rounded-2xl border border-slate-800 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-800 font-bold text-white text-xs uppercase tracking-wider">
            All User Tickets ({tickets.length})
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2">
            {tickets.map((t) => (
              <button
                key={t._id}
                onClick={() => handleSelectTicket(t)}
                className={`w-full text-left p-3.5 rounded-xl transition-all ${selectedTicket?._id === t._id ? 'bg-purple-600/20 border border-purple-500/40' : 'hover:bg-slate-800/40'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-purple-400 text-xs font-bold">{t.ticketId}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">{t.status}</span>
                </div>
                <p className="text-sm font-bold text-white mt-1 truncate">{t.subject}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">User: {t.user?.fullName || 'User'} • {t.category}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 glass-panel rounded-2xl border border-slate-800 flex flex-col h-[550px]">
          {selectedTicket ? (
            <>
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedTicket.subject}</h3>
                  <p className="text-[10px] text-slate-400">User: {selectedTicket.user?.fullName} ({selectedTicket.user?.email})</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
                  {selectedTicket.status}
                </span>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {messages.map((m) => {
                  const isAdminMsg = m.senderRole === 'admin';
                  return (
                    <div key={m._id} className={`flex flex-col ${isAdminMsg ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 mb-1">
                        <span className="font-bold text-white">{m.senderName}</span>
                        <span>({m.senderRole})</span>
                        <span>• {formatDate(m.createdAt)}</span>
                      </div>
                      <div className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${isAdminMsg ? 'bg-purple-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'}`}>
                        {m.message}
                      </div>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={handleSendReply} className="p-3 border-t border-slate-800 flex items-center space-x-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type official admin reply..."
                  className="flex-1 px-4 py-2.5 rounded-xl glass-input text-xs"
                />
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md">
                  Send Reply
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">Select a ticket to view messages.</div>
          )}
        </div>
      </div>
    </div>
  );
}
