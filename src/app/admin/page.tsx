'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '@/context/GameContext';
import { 
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  Search, 
  Coins, 
  Settings, 
  FileText, 
  UserCog, 
  ArrowDownCircle, 
  ArrowUpCircle,
  Ban,
  AlertCircle,
  Lock,
  LogOut,
  Activity,
  RefreshCw,
  Users,
  Wifi,
  Trash2
} from 'lucide-react';
import { formatCash } from '@/lib/format';

export default function AdminPage() {
  const { 
    user, 
    users, 
    deposits, 
    withdrawals, 
    auditLogs, 
    settings, 
    signIn,
    signOut,
    changePassword,
    updateDepositStatus, 
    updateWithdrawalStatus, 
    supplyCoins, 
    banUser,
    unbanUser,
    deleteUser,
    approveAccountRequest,
    rejectAccountRequest,
    updateSettings 
  } = useGame();

  const [activeTab, setActiveTab] = useState<'requests' | 'deposits' | 'withdrawals' | 'users' | 'member_logs' | 'settings' | 'logs' | 'security'>('users');
  const [userSearch, setUserSearch] = useState<string>('');
  const [memberLogs, setMemberLogs] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchServerLogs = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/users', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.memberLogs)) {
        setMemberLogs(data.memberLogs);
      }
    } catch {} finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchServerLogs();
    const interval = setInterval(fetchServerLogs, 3000);
    return () => clearInterval(interval);
  }, [fetchServerLogs]);
  
  // Staff Auth Gate State
  const [loginEmail, setLoginEmail] = useState<string>('xynfnagsss@gmail.com');
  const [loginPass, setLoginPass] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');

  // Password Change State
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Coin Supply State
  const [supplyTargetId, setSupplyTargetId] = useState<string>('');
  const [supplyAmount, setSupplyAmount] = useState<number>(1000);
  const [supplyReason, setSupplyReason] = useState<string>('');
  const [supplySuccess, setSupplySuccess] = useState<string>('');

  // Ban State
  const [banTargetId, setBanTargetId] = useState<string>('');
  const [banReason, setBanReason] = useState<string>('');
  const [banSuccess, setBanSuccess] = useState<string>('');

  // Settings form
  const [cfgIgn, setCfgIgn] = useState<string>(settings.designatedIgn);
  const [cfgRate, setCfgRate] = useState<number>(settings.exchangeRate);
  const [cfgMinDep, setCfgMinDep] = useState<number>(settings.minDeposit);
  const [cfgSaved, setCfgSaved] = useState<boolean>(false);

  // If user is not admin, show password-protected staff gate
  if (!user || user.role !== 'admin') {
    const handleStaffLogin = (e: React.FormEvent) => {
      e.preventDefault();
      setLoginError('');
      if (!loginPass) {
        setLoginError('Please enter your staff password.');
        return;
      }
      const res = signIn(loginEmail, loginPass);
      if (!res.success) {
        setLoginError(res.message);
      }
    };

    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <div className="bg-[#12141a] border-2 border-amber-500/40 rounded-3xl p-8 flex flex-col items-center shadow-2xl shadow-amber-500/10">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 border border-amber-500/30">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-white mb-1 tracking-wide">STAFF PORTAL ACCESS</h2>
          <p className="text-xs text-neutral-400 mb-6 text-center">
            Sign in with your designated administrator account and password:
          </p>

          <form onSubmit={handleStaffLogin} className="w-full flex flex-col gap-4 text-xs">
            {loginError && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 font-bold">
                {loginError}
              </div>
            )}

            <div>
              <label className="text-neutral-400 font-bold block mb-1">Staff Account</label>
              <select
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full bg-[#0b0c10] border border-white/10 rounded-xl p-3 text-white font-bold"
              >
                <option value="xynfnagsss@gmail.com">xynfnagsss@gmail.com (Staff Owner)</option>
                <option value="cartisneakz@donutprofit.online">cartisneakz (Designated IGN / Staff)</option>
              </select>
            </div>

            <div>
              <label className="text-neutral-400 font-bold block mb-1">Staff Master Password</label>
              <input
                type="password"
                placeholder="Enter password..."
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                className="w-full bg-[#0b0c10] border border-white/10 rounded-xl p-3 text-white font-mono font-bold focus:border-amber-500/60 focus:outline-none"
              />
              <span className="text-[10px] text-neutral-500 mt-1 block">Default: donutprofitadmin21</span>
            </div>

            <button
              type="submit"
              className="w-full mt-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 text-black font-extrabold text-xs py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <span>👑 Unlock Staff Portal</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  const handlePasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (!newPassword || newPassword.length < 4) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 4 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    const res = changePassword(newPassword);
    if (res.success) {
      setPasswordMsg({ type: 'success', text: 'Staff password changed successfully! Remember your new password.' });
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordMsg({ type: 'error', text: res.message });
    }
  };

  const handleSupplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplyTargetId || !supplyReason) return;
    supplyCoins(supplyTargetId, supplyAmount, supplyReason);
    setSupplySuccess(`Successfully supplied ${supplyAmount > 0 ? '+' : ''}$${supplyAmount.toLocaleString()} cash.`);
    setSupplyReason('');
    setTimeout(() => setSupplySuccess(''), 3000);
  };

  const handleBanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!banTargetId || !banReason) return;
    banUser(banTargetId, banReason);
    setBanSuccess('Player has been BANNED from the casino.');
    setBanReason('');
    setTimeout(() => setBanSuccess(''), 3000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      designatedIgn: cfgIgn,
      exchangeRate: cfgRate,
      minDeposit: cfgMinDep,
    });
    setCfgSaved(true);
    setTimeout(() => setCfgSaved(false), 2000);
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.minecraftIgn.toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase()))
  );

  const pendingDeposits = deposits.filter(d => d.status === 'pending' || d.status === 'under_review');
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending');
  const pendingAccountRequests = users.filter(u => u.accountStatus === 'pending');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl font-black text-white tracking-wide">DONUTPROFIT STAFF PORTAL</h1>
            <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-black">
              ADMIN: {user.email || user.username}
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Designated deposit IGN: <span className="text-emerald-400 font-bold font-mono">{settings.designatedIgn}</span> &bull; Supply coins, ban players, approve deposits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('security')}
            className="text-xs text-amber-400 hover:text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/30 transition font-bold flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Change Password</span>
          </button>
          <button
            onClick={signOut}
            className="text-xs text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 transition font-bold flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#12141a] border border-orange-500/20 p-4 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-neutral-500 block">Pending Deposits</span>
          <span className="text-2xl font-black font-mono text-amber-400">{pendingDeposits.length}</span>
        </div>
        <div className="bg-[#12141a] border border-orange-500/20 p-4 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-neutral-500 block">Pending Withdrawals</span>
          <span className="text-2xl font-black font-mono text-rose-400">{pendingWithdrawals.length}</span>
        </div>
        <div className="bg-[#12141a] border border-white/10 p-4 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-neutral-500 block">Total Players</span>
          <span className="text-2xl font-black font-mono text-white">{users.length}</span>
        </div>
        <div className="bg-[#12141a] border border-white/10 p-4 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-neutral-500 block">Banned Players</span>
          <span className="text-2xl font-black font-mono text-red-500">{users.filter(u => u.isBanned).length}</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'requests'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <UserCog className="w-3.5 h-3.5" />
          Acc Creation Requests ({pendingAccountRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'users'
              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <UserCog className="w-3.5 h-3.5" />
          Players, Supply & Bans ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('member_logs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'member_logs'
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-blue-400" />
          Member Logs ({memberLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('deposits')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'deposits'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <ArrowDownCircle className="w-3.5 h-3.5" />
          Deposits Queue ({pendingDeposits.length})
        </button>
        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'withdrawals'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <ArrowUpCircle className="w-3.5 h-3.5" />
          Withdrawals Queue ({pendingWithdrawals.length})
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'security'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          Password & Security
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'settings'
              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          Platform Settings
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'logs'
              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Audit Logs
        </button>
      </div>

      {/* Tab: Account Creation Requests */}
      {activeTab === 'requests' && (
        <div className="bg-[#12141a] border border-white/10 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">Account Creation Requests</h3>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-1 rounded-full">
              {pendingAccountRequests.length} pending
            </span>
          </div>

          {pendingAccountRequests.length === 0 ? (
            <div className="text-sm text-neutral-400 py-8 text-center">No users are waiting for account approval right now.</div>
          ) : (
            <div className="space-y-4">
              {pendingAccountRequests.map((u) => (
                <div key={u.id} className="rounded-2xl border border-white/10 bg-[#0d0f15] p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://mc-heads.net/avatar/${u.minecraftIgn}/40`}
                        alt={u.minecraftIgn}
                        className="w-10 h-10 rounded-xl bg-neutral-800"
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                      <div>
                        <p className="text-base font-black text-white">{u.minecraftIgn}</p>
                        <p className="text-[11px] text-neutral-500">{u.username} · {u.paymentVerification?.amount ? `${u.paymentVerification.amount} coins` : 'Awaiting payment amount'} · Created {new Date(u.createdAt).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => approveAccountRequest(u.id, 'Approved from account creation request queue.')}
                        className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-2 rounded-lg text-xs font-black hover:bg-emerald-500/30 transition"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => rejectAccountRequest(u.id, 'Rejected from account creation request queue.')}
                        className="bg-red-500/20 text-red-300 border border-red-500/30 px-3 py-2 rounded-lg text-xs font-black hover:bg-red-500/30 transition"
                      >
                        Reject
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-[11px] text-amber-200">
                    <span className="font-black uppercase tracking-wide mr-2">Payment:</span>
                    {u.paymentVerification?.proof ? (
                      <a href={u.paymentVerification.proof} target="_blank" rel="noreferrer" className="underline text-amber-300 break-all">{u.paymentVerification.proof}</a>
                    ) : (
                      <span>No proof URL provided.</span>
                    )}
                  </div>

                  {u.approvalNote && (
                    <div className="mt-3 text-[11px] text-neutral-400">{u.approvalNote}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Players, Supply & Bans */}
      {activeTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Players Table */}
          <div className="lg:col-span-7 bg-[#12141a] border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
                Player Database
              </h3>
              <div className="relative w-full sm:w-48">
                <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search player..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full bg-[#0b0c10] border border-white/10 rounded-lg py-1.5 pl-8 pr-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="divide-y divide-white/5">
              {filteredUsers.map((u) => (
                <div key={u.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://mc-heads.net/avatar/${u.minecraftIgn}/32`}
                      alt={u.minecraftIgn}
                      className="w-8 h-8 rounded-md bg-neutral-800 shrink-0"
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-white truncate">{u.minecraftIgn}</p>
                        {u.role === 'admin' && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1 rounded font-black">ADMIN</span>
                        )}
                        {u.isBanned && (
                          <span className="text-[9px] bg-red-500/20 text-red-400 px-1 rounded font-black">BANNED</span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-500 truncate">{u.email || u.username}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono font-bold text-amber-400 mr-1">{formatCash(u.balance)}</span>
                    <button
                      onClick={() => { setSupplyTargetId(u.id); }}
                      className="text-xs bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 px-2 py-1 rounded font-bold transition"
                    >
                      + Supply
                    </button>
                    {u.isBanned ? (
                      <button
                        onClick={() => unbanUser(u.id)}
                        className="text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 px-2 py-1 rounded font-bold transition"
                      >
                        Unban
                      </button>
                    ) : (
                      <button
                        onClick={() => { setBanTargetId(u.id); }}
                        className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 px-2 py-1 rounded font-bold transition"
                      >
                        Ban
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm(`Permanently delete account ${u.minecraftIgn}? This cannot be undone.`)) {
                          deleteUser(u.id);
                        }
                      }}
                      className="text-xs bg-neutral-800 hover:bg-red-950/80 text-neutral-400 hover:text-red-300 border border-white/5 hover:border-red-500/30 px-2 py-1 rounded font-bold transition flex items-center gap-1 cursor-pointer"
                      title="Permanently Delete Account"
                    >
                      <Trash2 className="w-3 h-3 text-red-400" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Panels */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Supply Coins Form */}
            <div className="bg-[#12141a] border border-orange-500/20 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Coins className="w-5 h-5 text-amber-400" />
                <h4 className="text-sm font-black text-white uppercase tracking-wider">
                  Supply Cash To Player
                </h4>
              </div>

              <form onSubmit={handleSupplySubmit} className="flex flex-col gap-3 text-xs">
                <div>
                  <label className="text-neutral-400 font-bold block mb-1">Select Player</label>
                  <select
                    value={supplyTargetId}
                    onChange={(e) => setSupplyTargetId(e.target.value)}
                    className="w-full bg-[#0b0c10] border border-white/10 rounded-xl p-2.5 text-white font-bold"
                  >
                    <option value="">Select player to supply...</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.minecraftIgn} ({formatCash(u.balance)})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-neutral-400 font-bold block mb-1">Cash Amount (+ or -)</label>
                  <input
                    type="number"
                    value={supplyAmount}
                    onChange={(e) => setSupplyAmount(Number(e.target.value))}
                    className="w-full bg-[#0b0c10] border border-white/10 rounded-xl p-2.5 text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 font-bold block mb-1">Reason / Note</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. In-game payment verification, Giveaway winner"
                    value={supplyReason}
                    onChange={(e) => setSupplyReason(e.target.value)}
                    className="w-full bg-[#0b0c10] border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>

                {supplySuccess && (
                  <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded">
                    {supplySuccess}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!supplyTargetId || !supplyReason}
                  className="w-full py-3 rounded-xl font-black uppercase bg-gradient-to-r from-orange-500 to-amber-500 text-black shadow-lg disabled:opacity-50 transition"
                >
                  SUPPLY CASH NOW
                </button>
              </form>
            </div>

            {/* Ban Player Form */}
            <div className="bg-[#12141a] border border-red-500/20 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Ban className="w-5 h-5 text-red-400" />
                <h4 className="text-sm font-black text-white uppercase tracking-wider">
                  Ban / Suspend Player
                </h4>
              </div>

              <form onSubmit={handleBanSubmit} className="flex flex-col gap-3 text-xs">
                <div>
                  <label className="text-neutral-400 font-bold block mb-1">Select Player to Ban</label>
                  <select
                    value={banTargetId}
                    onChange={(e) => setBanTargetId(e.target.value)}
                    className="w-full bg-[#0b0c10] border border-white/10 rounded-xl p-2.5 text-white font-bold"
                  >
                    <option value="">Select player to ban...</option>
                    {users.filter(u => !u.isBanned).map(u => (
                      <option key={u.id} value={u.id}>{u.minecraftIgn} ({u.email || u.username})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-neutral-400 font-bold block mb-1">Ban Reason</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chargeback attempt, in-game scam"
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    className="w-full bg-[#0b0c10] border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>

                {banSuccess && (
                  <div className="p-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded font-bold">
                    {banSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!banTargetId || !banReason}
                  className="w-full py-3 rounded-xl font-black uppercase bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-lg disabled:opacity-50 transition"
                >
                  EXECUTE BAN
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Real-Time Member Logs */}
      {activeTab === 'member_logs' && (
        <div className="space-y-6">
          {/* Header & Controls Card */}
          <div className="bg-[#12141a] border border-blue-500/20 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
                    <Activity className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
                      Real-Time Member Logs
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Live Sync (3s)
                      </span>
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Live multi-device player connection activity, authentication events, and verified accounts.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={fetchServerLogs}
                  disabled={isRefreshing}
                  className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold transition active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
                  <span>{isRefreshing ? 'Syncing...' : 'Refresh Logs'}</span>
                </button>
              </div>
            </div>

            {/* Metric Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/5">
              <div className="bg-[#0c0e14] border border-white/5 p-3 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">Total Events Logged</span>
                <span className="text-xl font-black font-mono text-white">{memberLogs.length}</span>
              </div>
              <div className="bg-[#0c0e14] border border-white/5 p-3 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">Registered Players</span>
                <span className="text-xl font-black font-mono text-emerald-400">{users.length}</span>
              </div>
              <div className="bg-[#0c0e14] border border-white/5 p-3 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">Active Unique Members</span>
                <span className="text-xl font-black font-mono text-blue-400">
                  {new Set(memberLogs.map(l => (l.minecraftIgn || '').toLowerCase())).size || users.length}
                </span>
              </div>
              <div className="bg-[#0c0e14] border border-white/5 p-3 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">Central Server Cache</span>
                <span className="text-xl font-black font-mono text-amber-400">Synchronized</span>
              </div>
            </div>
          </div>

          {/* Member Activity Stream & Players Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Real-time Activity Feed */}
            <div className="lg:col-span-7 bg-[#12141a] border border-white/10 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-400" />
                  Live Activity Feed
                </h4>
                <span className="text-[11px] text-neutral-500 font-mono">
                  Showing latest {memberLogs.length} events
                </span>
              </div>

              {memberLogs.length === 0 ? (
                <div className="py-12 px-4 text-center">
                  <Users className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
                  <p className="text-sm font-bold text-neutral-300">No member logs yet</p>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
                    When players log in or register via Minecraft, Discord, or Email, their live events will appear here in real time.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
                  {memberLogs.map((log) => {
                    const actionBadge = 
                      log.action === 'login' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                      log.action === 'signup' ? 'bg-blue-500/15 text-blue-400 border-blue-500/30' :
                      log.action === 'deposit' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                      'bg-purple-500/15 text-purple-400 border-purple-500/30';

                    const authProviderBadge =
                      log.authProvider === 'minecraft' ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40' :
                      log.authProvider === 'discord' ? 'bg-indigo-950/60 text-indigo-300 border-indigo-800/40' :
                      'bg-neutral-800/80 text-neutral-300 border-neutral-700/40';

                    return (
                      <div
                        key={log.id}
                        className="flex items-start gap-3 p-3 rounded-xl bg-[#0c0e14] border border-white/5 hover:border-white/10 transition group"
                      >
                        {/* Player Minecraft Head Avatar */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`https://mc-heads.net/avatar/${encodeURIComponent(log.minecraftIgn || 'steve')}/36`}
                          alt={log.minecraftIgn}
                          className="w-9 h-9 rounded-xl bg-neutral-900 border border-white/10 shrink-0 mt-0.5"
                          onError={(e) => {
                            (e.target as HTMLElement).style.opacity = '0.5';
                          }}
                        />

                        {/* Event Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black text-white group-hover:text-amber-400 transition">
                              {log.minecraftIgn}
                            </span>
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${actionBadge}`}>
                              {log.action}
                            </span>
                            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border font-mono ${authProviderBadge}`}>
                              {log.authProvider}
                            </span>
                            <span className="text-[10px] font-mono text-neutral-500 ml-auto">
                              {log.timestamp}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-300 mt-1 break-words">
                            {log.details}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Synced Members Quick Table */}
            <div className="lg:col-span-5 bg-[#12141a] border border-white/10 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  Active Player Records ({users.length})
                </h4>
                <button
                  onClick={() => setActiveTab('users')}
                  className="text-xs font-bold text-orange-400 hover:text-orange-300 transition"
                >
                  Manage &rarr;
                </button>
              </div>

              <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#0c0e14] border border-white/5 hover:border-white/10 transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://mc-heads.net/avatar/${encodeURIComponent(u.minecraftIgn || 'steve')}/32`}
                        alt={u.minecraftIgn}
                        className="w-8 h-8 rounded-lg bg-neutral-900 border border-white/10 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLElement).style.opacity = '0.5';
                        }}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-black text-white truncate flex items-center gap-1.5">
                          {u.minecraftIgn}
                          {u.role === 'admin' && (
                            <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1 rounded font-bold">
                              STAFF
                            </span>
                          )}
                          {u.isBanned && (
                            <span className="text-[9px] bg-red-500/20 text-red-400 px-1 rounded font-bold">
                              BANNED
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-neutral-400 font-mono">
                          Balance: <span className="text-emerald-400 font-bold">{formatCash(u.balance)}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono text-neutral-500 block uppercase">
                        {u.authProvider || 'minecraft'}
                      </span>
                      <span className={`text-[10px] font-bold ${u.accountStatus === 'approved' ? 'text-emerald-400' : 'text-neutral-400'}`}>
                        {u.accountStatus || 'active'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Deposits */}
      {activeTab === 'deposits' && (
        <div className="bg-[#12141a] border border-white/10 rounded-2xl p-6 shadow-xl">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-white mb-4">
            Deposit Verification Queue (Pay to: {settings.designatedIgn})
          </h3>

          {deposits.length === 0 ? (
            <p className="text-xs text-neutral-500">No deposits in queue.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-neutral-500 uppercase tracking-wider bg-[#0d0f14]">
                    <th className="py-2.5 px-3">Player IGN</th>
                    <th className="py-2.5 px-3">In-Game Amount</th>
                    <th className="py-2.5 px-3">Cash to Credit</th>
                    <th className="py-2.5 px-3">Proof / Note</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {deposits.map((d) => (
                    <tr key={d.id} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-3 font-sans font-bold text-white flex items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`https://mc-heads.net/avatar/${d.minecraftIgn}/20`}
                          alt={d.minecraftIgn}
                          className="w-5 h-5 rounded-sm bg-neutral-800"
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                        <span>{d.minecraftIgn}</span>
                      </td>
                      <td className="py-3 px-3 text-emerald-400 font-bold">
                        {formatCash(d.amountInGame)}
                      </td>
                      <td className="py-3 px-3 text-amber-400 font-bold">
                        {formatCash(d.amountCoins, { showPlus: true })}
                      </td>
                      <td className="py-3 px-3 font-sans text-neutral-400 text-[11px] max-w-[200px] truncate">
                        {d.transactionProof || 'Standard in-game /pay'}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                          d.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                          d.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {d.status === 'pending' || d.status === 'under_review' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => updateDepositStatus(d.id, 'approved', 'Verified by Admin')}
                              className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded text-xs font-bold transition flex items-center gap-1"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => updateDepositStatus(d.id, 'rejected', 'Payment not found')}
                              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-2.5 py-1 rounded text-xs font-bold transition flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-neutral-500 font-sans">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: Withdrawals */}
      {activeTab === 'withdrawals' && (
        <div className="bg-[#12141a] border border-white/10 rounded-2xl p-6 shadow-xl">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-white mb-4">
            Withdrawal Fulfillments
          </h3>

          {withdrawals.length === 0 ? (
            <p className="text-xs text-neutral-500">No withdrawal requests.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-neutral-500 uppercase tracking-wider bg-[#0d0f14]">
                    <th className="py-2.5 px-3">Player IGN</th>
                    <th className="py-2.5 px-3">Cash Deducted</th>
                    <th className="py-2.5 px-3">Pay in SMP</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Fulfill Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {withdrawals.map((w) => (
                    <tr key={w.id} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-3 font-sans font-bold text-white flex items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`https://mc-heads.net/avatar/${w.minecraftIgn}/20`}
                          alt={w.minecraftIgn}
                          className="w-5 h-5 rounded-sm bg-neutral-800"
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                        <span>{w.minecraftIgn}</span>
                      </td>
                      <td className="py-3 px-3 text-amber-400 font-bold">{formatCash(w.amountCoins)}</td>
                      <td className="py-3 px-3 text-emerald-400 font-bold">
                        /pay {w.minecraftIgn} {w.amountInGame.toLocaleString()}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                          w.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                          w.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {w.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {w.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => updateWithdrawalStatus(w.id, 'approved', 'Paid via /pay on DonutSMP')}
                              className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded text-xs font-bold transition flex items-center gap-1"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Mark Paid
                            </button>
                            <button
                              onClick={() => updateWithdrawalStatus(w.id, 'rejected', 'Refunded cash')}
                              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-2.5 py-1 rounded text-xs font-bold transition flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject (Refund)
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-neutral-500 font-sans">Resolved</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: Staff Password & Security */}
      {activeTab === 'security' && (
        <div className="max-w-xl bg-[#12141a] border border-amber-500/30 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
              Change Staff Master Password
            </h3>
          </div>
          <p className="text-xs text-neutral-400 mb-6">
            Update your admin login password for <span className="text-amber-400 font-bold">{user.email || user.username}</span>.
          </p>

          <form onSubmit={handlePasswordChangeSubmit} className="flex flex-col gap-4 text-xs">
            {passwordMsg && (
              <div className={`p-3 rounded-xl border text-xs font-bold ${
                passwordMsg.type === 'success' 
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' 
                  : 'bg-red-500/20 border-red-500/40 text-red-400'
              }`}>
                {passwordMsg.text}
              </div>
            )}

            <div>
              <label className="text-neutral-400 font-bold block mb-1">New Password</label>
              <input
                type="password"
                placeholder="Enter new master password..."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#0b0c10] border border-white/10 rounded-xl p-3 text-white font-mono font-bold focus:border-amber-500/60 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-neutral-400 font-bold block mb-1">Confirm New Password</label>
              <input
                type="password"
                placeholder="Confirm new master password..."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#0b0c10] border border-white/10 rounded-xl p-3 text-white font-mono font-bold focus:border-amber-500/60 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="py-3 rounded-xl font-black uppercase bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg hover:from-amber-600 transition"
            >
              SAVE NEW PASSWORD
            </button>
          </form>
        </div>
      )}

      {/* Tab: System Settings */}
      {activeTab === 'settings' && (
        <div className="max-w-xl bg-[#12141a] border border-white/10 rounded-2xl p-6 shadow-xl">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-white mb-4">
            Casino Platform Settings
          </h3>
          <form onSubmit={handleSaveSettings} className="flex flex-col gap-4 text-xs">
            <div>
              <label className="text-neutral-400 font-bold block mb-1">Designated Minecraft Payment IGN</label>
              <input
                type="text"
                value={cfgIgn}
                onChange={(e) => setCfgIgn(e.target.value)}
                className="w-full bg-[#0b0c10] border border-white/10 rounded-xl p-2.5 text-white font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-neutral-400 font-bold block mb-1">Exchange Rate (SMP $ per $1 Cash)</label>
              <input
                type="number"
                value={cfgRate}
                onChange={(e) => setCfgRate(Number(e.target.value))}
                className="w-full bg-[#0b0c10] border border-white/10 rounded-xl p-2.5 text-white font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-neutral-400 font-bold block mb-1">Minimum In-Game Deposit ($)</label>
              <input
                type="number"
                value={cfgMinDep}
                onChange={(e) => setCfgMinDep(Number(e.target.value))}
                className="w-full bg-[#0b0c10] border border-white/10 rounded-xl p-2.5 text-white font-mono font-bold"
              />
            </div>

            {cfgSaved && (
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded">
                Settings updated successfully!
              </div>
            )}

            <button
              type="submit"
              className="py-3 rounded-xl font-black uppercase bg-gradient-to-r from-orange-500 to-amber-500 text-black shadow-lg"
            >
              SAVE CONFIGURATION
            </button>
          </form>
        </div>
      )}

      {/* Tab: Audit Logs */}
      {activeTab === 'logs' && (
        <div className="bg-[#12141a] border border-white/10 rounded-2xl p-6 shadow-xl">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-white mb-4">
            Security & Administration Audit Trail
          </h3>
          <div className="divide-y divide-white/5 font-mono text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-2.5 flex flex-col sm:flex-row justify-between gap-2">
                <div>
                  <span className="text-amber-400 font-bold mr-2">[{log.action}]</span>
                  <span className="text-neutral-300">by {log.adminName}: </span>
                  <span className="text-neutral-400 font-sans">{log.reason}</span>
                </div>
                <span className="text-neutral-500 shrink-0 text-[11px]">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
