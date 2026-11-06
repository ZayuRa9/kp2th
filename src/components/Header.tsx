import React, { useState, useEffect } from 'react';
import {
  Phone,
  Menu,
  X,
  Landmark,
  Lock,
  Bell,
  Download,
  ShieldCheck,
  MapPin,
  Users,
  FileText,
  Share2,
  Sparkles,
  Calendar,
  AlertTriangle,
  HelpCircle,
  Home,
  ChevronRight,
} from 'lucide-react';
import { CommunityInfo } from '../types';
import { extractPhoneDigits } from '../utils/rules';
import { useToast } from '../context/ToastContext';

interface HeaderProps {
  communityInfo: CommunityInfo;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  communityInfo,
  activeTab,
  setActiveTab,
  onOpenAdmin,
  isAdminLoggedIn,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { unreadCount, isHistoryOpen, setIsHistoryOpen, markHistoryAsRead } = useToast();

  const navItems = [
    {
      id: 'overview',
      label: 'Trang chủ',
      desc: 'Tổng quan & chỉ số dân cư KP2',
      icon: Home,
      color: 'text-cyan-400',
      activeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
      badgeBg: 'bg-cyan-500/10 text-cyan-200 border-cyan-400/20',
    },
    {
      id: 'map-section',
      label: 'Bản đồ KP2',
      desc: 'Ranh giới & trụ sở Ban điều hành',
      icon: MapPin,
      color: 'text-blue-400',
      activeBg: 'bg-blue-500/20 text-blue-300 border-blue-400/40',
      badgeBg: 'bg-blue-500/10 text-blue-200 border-blue-400/20',
    },
    {
      id: 'committee-section',
      label: 'Ban Điều hành',
      desc: 'Cán bộ khu phố & lịch tiếp công dân',
      icon: Users,
      color: 'text-amber-400',
      activeBg: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
      badgeBg: 'bg-amber-500/10 text-amber-200 border-amber-400/20',
    },
    {
      id: 'documents-section',
      label: 'Văn bản',
      desc: 'Văn bản chỉ đạo & kế hoạch triển khai',
      icon: FileText,
      color: 'text-indigo-400',
      activeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/40',
      badgeBg: 'bg-indigo-500/10 text-indigo-200 border-indigo-400/20',
    },
    {
      id: 'media-section',
      label: 'TT Đại chúng Phường Tân Hưng',
      desc: 'Cổng TTĐT, Công an & Đoàn thể Phường',
      icon: Share2,
      color: 'text-sky-400',
      activeBg: 'bg-sky-500/20 text-sky-300 border-sky-400/40',
      badgeBg: 'bg-sky-500/10 text-sky-200 border-sky-400/20',
    },
    {
      id: 'utilities-section',
      label: 'Tiện ích số dân cư',
      desc: 'VNeID, DVC Quốc gia, VssID, Sawaco...',
      icon: Sparkles,
      color: 'text-violet-400',
      activeBg: 'bg-violet-500/20 text-violet-300 border-violet-400/40',
      badgeBg: 'bg-violet-500/10 text-violet-200 border-violet-400/20',
    },
    {
      id: 'orgs-section',
      label: 'Đăng ký Đoàn thể',
      desc: 'Đoàn Thanh niên, Phụ nữ, Cựu chiến binh...',
      icon: Landmark,
      color: 'text-emerald-400',
      activeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
      badgeBg: 'bg-emerald-500/10 text-emerald-200 border-emerald-400/20',
    },
    {
      id: 'activities-section',
      label: 'Lịch hoạt động',
      desc: 'Sự kiện, phong trào & đăng ký tham gia',
      icon: Calendar,
      color: 'text-rose-400',
      activeBg: 'bg-rose-500/20 text-rose-300 border-rose-400/40',
      badgeBg: 'bg-rose-500/10 text-rose-200 border-rose-400/20',
    },
    {
      id: 'incidents-section',
      label: 'Phản ánh sự cố',
      desc: 'Tiếp nhận phản ánh hạ tầng đô thị 24/7',
      icon: AlertTriangle,
      color: 'text-orange-400',
      activeBg: 'bg-orange-500/20 text-orange-300 border-orange-400/40',
      badgeBg: 'bg-orange-500/10 text-orange-200 border-orange-400/20',
    },
    {
      id: 'qa-section',
      label: 'Hỏi đáp cộng đồng',
      desc: 'Ý kiến, thắc mắc trực tiếp với Ban Điều hành',
      icon: HelpCircle,
      color: 'text-teal-400',
      activeBg: 'bg-teal-500/20 text-teal-300 border-teal-400/40',
      badgeBg: 'bg-teal-500/10 text-teal-200 border-teal-400/20',
    },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const hotlineDigits = extractPhoneDigits(communityInfo.hotline || '028 3775 1234');

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-[#0b2247] via-[#103063] to-[#0a1f3f] text-white border-b border-blue-500/40 shadow-xl transition-all">
      {/* Top micro bar - CHÍNH QUYỀN ĐỊA PHƯƠNG CƠ SỞ */}
      <div className="hidden md:block bg-[#071933] border-b border-blue-900/60 py-1.5 text-[11px] text-slate-300">
        <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-cyan-300 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              CỔNG THÔNG TIN ĐIỆN TỬ &amp; ĐIỀU HÀNH SỐ CƠ SỞ
            </span>
            <span className="text-blue-400/40">|</span>
            <span className="text-slate-200 font-medium">ỦY BAN NHÂN DÂN PHƯỜNG TÂN HƯNG • THÀNH PHỐ HỒ CHÍ MINH</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-slate-300">Văn phòng KP2: <strong className="text-white font-semibold">{communityInfo.address || '465/1/2 Trần Xuân Soạn'}</strong></span>
            <span className="text-blue-400/40">|</span>
            <span className="text-emerald-300 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Hệ thống bảo mật chính quyền số
            </span>
          </div>
        </div>
      </div>

      {/* Main Bar: Clean, streamlined without cluttered nav links */}
      <div className="w-full max-w-[1760px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-12 h-14 sm:h-16 flex items-center justify-between gap-3">
        {/* Brand & Emblem */}
        <div
          onClick={() => handleNavClick('overview')}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group shrink-0"
        >
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-red-600 via-red-700 to-amber-500 p-0.5 shadow-lg shadow-red-900/40 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
            <div className="w-full h-full rounded-[10px] bg-[#0c182c] flex flex-col items-center justify-center text-center p-0.5 border border-amber-300/40">
              <Landmark className="w-4 h-4 text-amber-400 mb-0.5" />
              <span className="text-[7.5px] font-black uppercase leading-tight text-white tracking-tighter">KP 02</span>
            </div>
          </div>

          <div className="leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="text-[10.5px] sm:text-[11.5px] uppercase font-black text-amber-300 tracking-wider">
                PHƯỜNG TÂN HƯNG
              </span>
              <span className="inline-flex bg-blue-500/25 text-cyan-300 text-[9px] font-bold px-1.5 py-0.5 rounded border border-cyan-400/30 uppercase">
                Chính Quyền Số
              </span>
            </div>
            <h1 className="text-sm sm:text-base lg:text-lg font-black text-white tracking-tight">
              KHU PHỐ 02
            </h1>
          </div>
        </div>

        {/* Action Controls Toolbar: Clean on Right */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Direct APK Download Button */}
          <a
            href="/downloads/KhuPho02_TanHung_v1.2.0.apk"
            download="KhuPho02_TanHung_v1.2.0.apk"
            className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-800/30 transition-all active:scale-95 whitespace-nowrap cursor-pointer hover:translate-y-[-1px]"
            title="Tải ứng dụng Android Khu phố 02 (.APK v1.2.0)"
          >
            <Download className="w-4 h-4 text-emerald-100" />
            <span className="hidden sm:inline">Tải</span>
            <span>App APK</span>
          </a>

          {/* Notification Bell with Unread Badge */}
          <button
            onClick={() => {
              setIsHistoryOpen(!isHistoryOpen);
              if (!isHistoryOpen) markHistoryAsRead();
            }}
            aria-label="Thông báo hệ thống"
            className="relative p-2 sm:p-2.5 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer border border-transparent hover:border-white/10"
            title="Xem thông báo sự cố & hoạt động mới"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full flex items-center justify-center shadow-md animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Direct Call Hotline */}
          <a
            href={`tel:${hotlineDigits}`}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-700/30 transition-all active:scale-95 group"
            title={`Bấm để gọi trực tiếp Trực ban Khu phố: ${communityInfo.hotline}`}
          >
            <Phone className="w-3.5 h-3.5 animate-bounce text-amber-300" />
            <span className="hidden md:inline text-amber-200">Trực ban:</span>
            <span className="underline decoration-white/60 font-black">{communityInfo.hotline || '028 3775 1234'}</span>
          </a>

          {/* Ổ KHÓA QUẢN TRỊ (ADMIN LOCK) */}
          <button
            onClick={onOpenAdmin}
            aria-label="Khu vực điều hành quản trị viên"
            className={`p-2 sm:p-2.5 rounded-xl transition-colors border cursor-pointer ${
              isAdminLoggedIn
                ? 'bg-amber-500/25 text-amber-300 border-amber-400/50 hover:bg-amber-500/35 shadow-sm'
                : 'text-slate-300 hover:text-white border-white/10 hover:bg-white/10'
            }`}
            title={isAdminLoggedIn ? 'Hệ thống điều hành (Đang đăng nhập)' : 'Đăng nhập Ban Điều hành Khu phố'}
          >
            <Lock className={`w-4 h-4 ${isAdminLoggedIn ? 'text-amber-400' : ''}`} />
          </button>

          {/* DẤU BA GẠCH GỘP TOÀN BỘ MENU (KẾ BÊN Ổ KHÓA/CHÌA KHÓA) */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`p-2 sm:p-2.5 rounded-xl transition-all border cursor-pointer flex items-center gap-1.5 ${
              menuOpen
                ? 'bg-blue-600 text-white border-blue-400 shadow-md ring-2 ring-blue-400/40'
                : 'text-slate-100 hover:text-white border-blue-400/40 hover:border-blue-300 bg-white/10 hover:bg-white/15 shadow-xs'
            }`}
            aria-label="Mở danh mục điều hành"
            title="Danh mục menu: Trang chủ, Bản đồ KP2, Ban điều hành, Văn bản, Tiện ích số..."
          >
            {menuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
            <span className="hidden sm:inline text-xs font-extrabold uppercase tracking-wide">Menu</span>
          </button>
        </div>
      </div>

      {/* DROPDOWN / DRAWER: GỘP HẾT CÁC MỤC ĐIỀU HÀNH */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
          />

          {/* Drawer content on right */}
          <div className="relative w-full max-w-md bg-gradient-to-b from-[#0c2242] via-[#091a33] to-[#061426] text-white border-l border-blue-500/30 shadow-2xl h-full flex flex-col z-10 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-blue-900/60 flex items-center justify-between bg-black/20">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-cyan-300">
                  <Landmark className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
                    DANH MỤC ĐIỀU HÀNH
                  </h3>
                  <div className="text-[11px] text-cyan-300 font-medium">Khu phố 02 • Phường Tân Hưng</div>
                </div>
              </div>

              <button
                onClick={() => setMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Đóng menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1.5 no-scrollbar">
              <div className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                Các chuyên mục chính
              </div>

              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between cursor-pointer border group ${
                      isActive
                        ? `${item.activeBg} shadow-sm font-bold`
                        : `${item.badgeBg} hover:bg-white/10 text-slate-200 hover:text-white`
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-black/25 flex items-center justify-center shrink-0 border border-white/5 group-hover:scale-105 transition-transform">
                        <Icon className={`w-4 h-4 ${item.color}`} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-extrabold truncate text-white">
                          {item.label}
                        </div>
                        <div className="text-[11px] text-slate-300 truncate">
                          {item.desc}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5 ml-2">
                      {isActive && (
                        <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400 animate-pulse" />
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-blue-900/60 bg-black/20 space-y-2">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onOpenAdmin();
                }}
                className={`w-full py-2.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isAdminLoggedIn
                    ? 'bg-amber-500/20 border-amber-400/40 text-amber-300 hover:bg-amber-500/30'
                    : 'bg-white/10 hover:bg-white/15 border-white/15 text-white'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>{isAdminLoggedIn ? 'Mở Bảng Điều Hành Quản Trị' : 'Đăng nhập Ban Điều hành KP2'}</span>
              </button>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href="/downloads/KhuPho02_TanHung_v1.2.0.apk"
                  download="KhuPho02_TanHung_v1.2.0.apk"
                  className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải App APK</span>
                </a>

                <a
                  href={`tel:${hotlineDigits}`}
                  className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Trực ban KP2</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
