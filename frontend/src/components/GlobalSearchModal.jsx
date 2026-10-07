import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, Wallet, Receipt, CreditCard, FileText, HelpCircle } from 'lucide-react';
import api from '../services/api';

export default function GlobalSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }

    const fetchSearch = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/transactions?search=${encodeURIComponent(query)}&limit=5`);
        const txList = res.data.transactions || [];

        const searchResults = [
          ...txList.map((tx) => ({
            type: 'Transaction',
            title: tx.description,
            subtitle: `${tx.referenceNumber} • $${tx.amount.toFixed(2)}`,
            link: '/transactions',
            icon: Receipt
          })),
          { type: 'Navigation', title: 'Money Transfer', subtitle: 'Send money to accounts or banks', link: '/transfer', icon: Wallet },
          { type: 'Navigation', title: 'Virtual Cards', subtitle: 'Manage cards, freeze, set PIN', link: '/cards', icon: CreditCard },
          { type: 'Navigation', title: 'Pay Bills', subtitle: 'Electricity, Water, Rent & Subscriptions', link: '/bills', icon: FileText },
          { type: 'Help', title: 'Support & FAQs', subtitle: 'Get help with your digital account', link: '/support', icon: HelpCircle }
        ];

        setResults(searchResults.filter((r) => r.title.toLowerCase().includes(query.toLowerCase()) || r.subtitle.toLowerCase().includes(query.toLowerCase())));
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchSearch, 300);
    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl glass-panel border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-800 flex items-center space-x-3">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search transactions, accounts, cards, bills, or help..."
            className="w-full bg-transparent text-white placeholder-slate-400 text-sm focus:outline-none"
            autoFocus
          />
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2">
          {loading ? (
            <div className="py-8 text-center text-sm text-slate-400">Searching Finova database...</div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              {results.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      navigate(item.link);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/70 text-left transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-slate-800 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{item.title}</p>
                        <p className="text-xs text-slate-400">{item.subtitle}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                  </button>
                );
              })}
            </div>
          ) : query.length >= 2 ? (
            <div className="py-8 text-center text-sm text-slate-400">No matching results found for "{query}"</div>
          ) : (
            <div className="p-4 text-xs text-slate-500 space-y-2">
              <p className="font-semibold text-slate-400 uppercase tracking-wider">Quick Suggestions</p>
              <div className="flex flex-wrap gap-2">
                {['Transfer', 'Amazon', 'Salary', 'Cards', 'Bills', 'Loan Calculator'].map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800/60 text-slate-300 hover:bg-slate-700 text-xs"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
