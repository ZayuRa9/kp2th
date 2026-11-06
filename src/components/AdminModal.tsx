import React, { useState, useEffect } from 'react';
import { Lock, User, Key, Eye, EyeOff, AlertCircle, ShieldCheck, X } from 'lucide-react';
import { loginAdmin, logoutAdmin, fetchAdminData, AdminDataResponse } from '../services/api';
import { AdminDashboard } from './AdminDashboard';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: () => void;
  isAdminLoggedIn: boolean;
  setIsAdminLoggedIn: (val: boolean) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  onDataChanged,
  isAdminLoggedIn,
  setIsAdminLoggedIn,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lockoutRemaining, setLockoutRemaining] = useState<number>(0);
  const [adminData, setAdminData] = useState<AdminDataResponse | null>(null);

  useEffect(() => {
    if (isOpen && isAdminLoggedIn) {
      loadAdminData();
    }
  }, [isOpen, isAdminLoggedIn]);

  useEffect(() => {
    if (lockoutRemaining <= 0) return;
    const timer = setInterval(() => {
      setLockoutRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setErrorMsg(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutRemaining]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminData();
      setAdminData(data);
      setIsAdminLoggedIn(true);
    } catch {
      setIsAdminLoggedIn(false);
      setAdminData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutRemaining > 0) return;

    setErrorMsg(null);
    setLoading(true);

    try {
      await loginAdmin(username.trim(), password);
      setIsAdminLoggedIn(true);
      setPassword('');
      await loadAdminData();
      onDataChanged();
    } catch (err: any) {
      setErrorMsg(err.message || 'Đăng nhập không thành công');
      if (err.message && err.message.includes('tạm khóa')) {
        setLockoutRemaining(300);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
    setIsAdminLoggedIn(false);
    setAdminData(null);
    onDataChanged();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      {isAdminLoggedIn && adminData ? (
        <div className="bg-white rounded-2xl w-[98vw] max-w-7xl h-[95vh] shadow-2xl border border-slate-700 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
          <AdminDashboard
            adminData={adminData}
            onRefresh={() => {
              loadAdminData();
              onDataChanged();
            }}
            onLogout={handleLogout}
            onClose={onClose}
          />
        </div>
      ) : (
        <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 text-center relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-400/40 text-blue-300 mx-auto flex items-center justify-center mb-3">
              <Lock className="w-6 h-6" />
            </div>

            <div className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-1">
              HỆ THỐNG ĐIỀU HÀNH NỘI BỘ
            </div>
            <h3 className="text-lg font-extrabold text-white">
              ĐĂNG NHẬP BAN ĐIỀU HÀNH KP2
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Khu phố 02 – Phường Tân Hưng
            </p>
          </div>

          {/* Form */}
          <div className="p-6">
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="leading-relaxed font-semibold">
                  {errorMsg}
                  {lockoutRemaining > 0 && (
                    <div className="mt-1 font-bold text-red-800">
                      Tự động mở khóa sau: {lockoutRemaining} giây
                    </div>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tên đăng nhập
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={lockoutRemaining > 0 || loading}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Tên tài khoản quản trị"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={lockoutRemaining > 0 || loading}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Mật khẩu quản trị viên"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || lockoutRemaining > 0}
                  className="w-full py-3 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{loading ? 'Đang xác thực...' : 'Đăng nhập vào Hệ Thống'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
