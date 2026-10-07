import React, { useState, useEffect } from 'react';
import { CreditCard, Snowflake, Lock, KeyRound, Plus, ShieldCheck, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import Card3D from '../components/Card3D';
import { CardSkeleton } from '../components/SkeletonLoader';
import ATMSimulatorModal from '../components/ATMSimulatorModal';
import api from '../services/api';

export default function CardsPage() {
  const [cards, setCards] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [newCardModalOpen, setNewCardModalOpen] = useState(false);
  const [atmSimulatorOpen, setAtmSimulatorOpen] = useState(false);
  const [newPin, setNewPin] = useState('');

  // New Card Form
  const [newCardForm, setNewCardForm] = useState({
    accountId: '',
    cardType: 'Debit',
    brand: 'Visa',
    pin: '1234',
    spendingLimit: 5000
  });

  const fetchData = async () => {
    try {
      const [cardRes, accRes] = await Promise.all([
        api.get('/cards'),
        api.get('/accounts')
      ]);

      const cardList = cardRes.data.cards || [];
      const accList = accRes.data.accounts || [];

      setCards(cardList);
      setAccounts(accList);

      if (accList.length > 0 && !newCardForm.accountId) {
        setNewCardForm((prev) => ({ ...prev, accountId: accList[0]._id }));
      }

      if (cardList.length > 0 && !selectedCard) {
        setSelectedCard(cardList[0]);
      } else if (selectedCard) {
        const updated = cardList.find((c) => c._id === selectedCard._id);
        if (updated) setSelectedCard(updated);
      }
    } catch (err) {
      toast.error('Failed to load card data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleIssueCardSubmit = async (e) => {
    e.preventDefault();
    if (!newCardForm.accountId) {
      toast.error('Please select an account for the new ATM card');
      return;
    }
    if (newCardForm.pin.length !== 4) {
      toast.error('ATM Card PIN must be 4 digits');
      return;
    }

    try {
      const res = await api.post('/cards', newCardForm);
      if (res.data.success) {
        toast.success(res.data.message);
        setNewCardModalOpen(false);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to issue new card');
    }
  };

  const handleToggleFreeze = async () => {
    if (!selectedCard) return;
    const action = selectedCard.isFrozen ? 'unfreeze' : 'freeze';
    try {
      await api.put(`/cards/${selectedCard._id}/status`, { action });
      toast.success(`Card ${action === 'freeze' ? 'frozen' : 'unfrozen'} successfully`);
      fetchData();
    } catch (err) {
      toast.error('Failed to update card status');
    }
  };

  const handleBlockCard = async () => {
    if (!selectedCard) return;
    try {
      await api.put(`/cards/${selectedCard._id}/status`, { action: 'block' });
      toast.success('Card blocked successfully');
      fetchData();
    } catch (err) {
      toast.error('Failed to block card');
    }
  };

  const handleChangePinSubmit = async (e) => {
    e.preventDefault();
    if (newPin.length !== 4) {
      toast.error('PIN must be 4 digits');
      return;
    }
    try {
      await api.put(`/cards/${selectedCard._id}/pin`, { newPin });
      toast.success('ATM Card PIN updated successfully!');
      setPinModalOpen(false);
      setNewPin('');
    } catch (err) {
      toast.error('Failed to update PIN');
    }
  };

  const handleToggleControl = async (field, currentValue) => {
    if (!selectedCard) return;
    try {
      await api.put(`/cards/${selectedCard._id}/settings`, {
        [field]: !currentValue
      });
      toast.success('Card controls updated');
      fetchData();
    } catch (err) {
      toast.error('Failed to update controls');
    }
  };

  if (loading) return <CardSkeleton />;

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-cyan-400" />
            <span>ATM Cards & Virtual ATM Machine</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage ATM Debit/Credit cards and withdraw cash via Virtual ATM Machine</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAtmSimulatorOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            <span>Withdraw Cash via Virtual ATM Machine</span>
          </button>

          <button
            onClick={() => setNewCardModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create / Request ATM Card</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Card Selector & 3D Card Display */}
        <div className="lg:col-span-1 space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Your Active ATM Cards</h3>
          <div className="space-y-4">
            {cards.map((card) => (
              <div
                key={card._id}
                onClick={() => setSelectedCard(card)}
                className={`cursor-pointer transition-all ${selectedCard?._id === card._id ? 'ring-2 ring-cyan-500 scale-[1.02]' : 'opacity-80 hover:opacity-100'}`}
              >
                <Card3D card={card} />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Card Details & Security Controls */}
        {selectedCard && (
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedCard.cardType} ATM Card Controls</h3>
                  <p className="text-xs text-slate-400 font-mono">FINOVA • {selectedCard.cardNumber.slice(-4)}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${selectedCard.isFrozen ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'}`}>
                    {selectedCard.isFrozen ? 'FROZEN' : 'ACTIVE'}
                  </span>
                </div>
              </div>

              {/* Action Buttons: ATM Simulator, Freeze, Change PIN, Block */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => setAtmSimulatorOpen(true)}
                  className="p-4 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 flex flex-col items-center justify-center space-y-2 transition-all"
                >
                  <Zap className="w-6 h-6 text-cyan-400" />
                  <span className="text-xs font-bold">Use ATM</span>
                </button>

                <button
                  onClick={handleToggleFreeze}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center space-y-2 transition-all ${
                    selectedCard.isFrozen
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:border-cyan-500'
                  }`}
                >
                  <Snowflake className="w-6 h-6" />
                  <span className="text-xs font-bold">{selectedCard.isFrozen ? 'Unfreeze' : 'Freeze Card'}</span>
                </button>

                <button
                  onClick={() => setPinModalOpen(true)}
                  className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200 hover:border-cyan-500 flex flex-col items-center justify-center space-y-2 transition-all"
                >
                  <KeyRound className="w-6 h-6 text-cyan-400" />
                  <span className="text-xs font-bold">Change PIN</span>
                </button>

                <button
                  onClick={handleBlockCard}
                  className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-rose-400 hover:bg-rose-500/10 flex flex-col items-center justify-center space-y-2 transition-all"
                >
                  <Lock className="w-6 h-6" />
                  <span className="text-xs font-bold">Block Card</span>
                </button>
              </div>

              {/* Controls & Toggles */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Payment & ATM Controls</h4>

                {/* ATM PIN Display */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800 font-mono">
                  <div>
                    <p className="text-sm font-semibold text-white">ATM 4-Digit PIN</p>
                    <p className="text-xs text-slate-400">Required for ATM cash withdrawal</p>
                  </div>
                  <span className="text-cyan-400 font-bold tracking-widest text-base">
                    {selectedCard.pin || '1234'}
                  </span>
                </div>

                {/* Online Payments Toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div>
                    <p className="text-sm font-semibold text-white">Online E-Commerce Payments</p>
                    <p className="text-xs text-slate-400">Enable card usage on online merchants</p>
                  </div>
                  <button
                    onClick={() => handleToggleControl('onlinePaymentsEnabled', selectedCard.onlinePaymentsEnabled)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${selectedCard.onlinePaymentsEnabled ? 'bg-cyan-500' : 'bg-slate-700'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${selectedCard.onlinePaymentsEnabled ? 'translate-x-6' : ''}`} />
                  </button>
                </div>

                {/* Monthly ATM Spending Limit */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Daily ATM Withdrawal Limit</span>
                    <span className="text-cyan-400 font-bold">${selectedCard.spendingLimit?.toLocaleString() || '5,000'}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800">
                    <div className="h-full bg-cyan-500 rounded-full w-2/5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New ATM Card Issue Modal */}
      {newCardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md glass-panel border border-slate-700 rounded-2xl p-6 space-y-4 bg-slate-900">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-cyan-400" />
              <span>Create / Issue New ATM Card</span>
            </h3>

            <form onSubmit={handleIssueCardSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Linked Account</label>
                <select
                  value={newCardForm.accountId}
                  onChange={(e) => setNewCardForm({ ...newCardForm, accountId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  required
                >
                  {accounts.map((acc) => (
                    <option key={acc._id} value={acc._id}>
                      {acc.accountType} ({acc.accountNumber}) - ${acc.balance?.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Card Network</label>
                  <select
                    value={newCardForm.brand}
                    onChange={(e) => setNewCardForm({ ...newCardForm, brand: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white"
                  >
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="Rupay">Rupay</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Card Type</label>
                  <select
                    value={newCardForm.cardType}
                    onChange={(e) => setNewCardForm({ ...newCardForm, cardType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white"
                  >
                    <option value="Debit">Debit Card</option>
                    <option value="Credit">Credit Card</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">4-Digit ATM PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={newCardForm.pin}
                    onChange={(e) => setNewCardForm({ ...newCardForm, pin: e.target.value })}
                    placeholder="1234"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-center font-mono text-cyan-400 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Daily ATM Limit ($)</label>
                  <input
                    type="number"
                    value={newCardForm.spendingLimit}
                    onChange={(e) => setNewCardForm({ ...newCardForm, spendingLimit: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm font-mono text-white"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setNewCardModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                >
                  Issue ATM Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change PIN Modal */}
      {pinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm glass-panel border border-slate-700 rounded-2xl p-6 space-y-4 bg-slate-900">
            <h3 className="text-lg font-bold text-white">Change ATM Card PIN</h3>
            <form onSubmit={handleChangePinSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">New 4-Digit PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="1234"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-center text-xl font-mono tracking-widest text-cyan-400 font-bold"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setPinModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                >
                  Update PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Virtual ATM Machine Simulator Modal */}
      <ATMSimulatorModal
        isOpen={atmSimulatorOpen}
        onClose={() => setAtmSimulatorOpen(false)}
        cards={cards}
        accounts={accounts}
        onWithdrawSuccess={fetchData}
      />
    </div>
  );
}
