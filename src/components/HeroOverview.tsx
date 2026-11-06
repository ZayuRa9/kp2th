import React from 'react';
import {
  Users,
  Home,
  ShieldCheck,
  Award,
  Calendar,
  ArrowRight,
  Phone,
  MapPin,
  Landmark,
  Compass,
  AlertTriangle,
} from 'lucide-react';
import { CommunityInfo, Demographics } from '../types';
import { formatNumberVietnamese, formatVietnameseDate, extractPhoneDigits } from '../utils/rules';

interface HeroOverviewProps {
  communityInfo: CommunityInfo;
  demographics: Demographics;
  onNavigateTab: (tab: string) => void;
}

export const HeroOverview: React.FC<HeroOverviewProps> = ({
  communityInfo,
  demographics,
  onNavigateTab,
}) => {
  const hotlineDigits = extractPhoneDigits(communityInfo.hotline || '028 3775 1234');
  const policeDigits = extractPhoneDigits(communityInfo.policePhone || '028 3771 5678');
  const vneidRate = demographics.vneidLevel2Rate ?? 0;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#0e2a56] via-[#103266] to-[#0a1e3f] text-white pt-8 sm:pt-12 pb-12 sm:pb-14 px-4 sm:px-6 lg:px-8 xl:px-12 border-b border-blue-400/30">
      {/* Background Subtle Luminous Glows */}
      <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      <div className="absolute -top-24 right-1/4 w-[600px] h-[600px] bg-blue-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 left-10 w-[500px] h-[500px] bg-cyan-400/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-[1760px] mx-auto z-10">
        {/* Top 2-Column Balanced Command Center */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch mb-10 sm:mb-12">
          {/* Left Column (7 cols): Main Authority Identity & Actions */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              {/* Kicker Tag */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-300/40 text-cyan-200 text-xs font-bold tracking-wide mb-4 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-cyan-300 animate-pulse" />
                <span>HỆ THỐNG THÔNG TIN SỐ &amp; ĐIỀU HÀNH DÂN CƯ CẤP CƠ SỞ</span>
              </div>

              {/* Authority Title */}
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-black tracking-tight text-white leading-tight mb-4">
                KHU PHỐ 02 <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-sky-100 to-amber-200">
                  PHƯỜNG TÂN HƯNG
                </span>
              </h2>

              <p className="text-slate-100 text-sm sm:text-base leading-relaxed mb-8 max-w-3xl font-normal">
                Cổng thông tin điện tử và hệ sinh thái số phục vụ cư dân Khu phố 02. Kết nối trực tiếp với Ủy ban Nhân dân Phường Tân Hưng, cung ứng tiện ích số, giải quyết thủ tục dân sinh, theo dõi sự kiện cộng đồng và tiếp nhận phản ánh hiện trường 24/7.
              </p>

              {/* Action Buttons Cluster: ĐÃ BỎ NÚT TẢI APK, THAY ĐOÀN THỂ THÀNH MÀU XANH LÁ CÂY */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onNavigateTab('utilities-section')}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition-all hover:translate-y-[-1px] active:scale-95 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-cyan-200" />
                  <span>Tiện ích số &amp; DVC</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigateTab('incidents-section')}
                  className="inline-flex items-center gap-2 px-4.5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-red-700/30 transition-all hover:translate-y-[-1px] active:scale-95 cursor-pointer"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-300" />
                  <span>Phản ánh sự cố</span>
                </button>

                {/* Nút Đoàn thể chính trị màu xanh lá cây theo yêu cầu */}
                <button
                  onClick={() => onNavigateTab('orgs-section')}
                  className="inline-flex items-center gap-2 px-4.5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-700/30 transition-all hover:translate-y-[-1px] active:scale-95 cursor-pointer"
                >
                  <Landmark className="w-4 h-4 text-emerald-100" />
                  <span>Đoàn thể chính trị</span>
                </button>

                <button
                  onClick={() => onNavigateTab('activities-section')}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-100 font-semibold text-xs sm:text-sm border border-slate-600 transition-all hover:translate-y-[-1px] cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>Lịch hoạt động</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Executive Panel - ĐÃ BỎ ĐỒNG HỒ SỐ & BỎ MÁY CHỦ VẬN HÀNH */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#123668] to-[#0c234a] rounded-2xl border border-blue-400/40 p-5 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3.5 border-b border-blue-300/20 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center text-cyan-300">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider">
                      ĐƯỜNG DÂY NÓNG TRỰC BAN 24/7
                    </h3>
                    <div className="text-[11px] text-cyan-200">Khu phố 02 • Phường Tân Hưng</div>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  KẾT NỐI LIỀN
                </span>
              </div>

              {/* Direct Hotlines Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <a
                  href={`tel:${hotlineDigits}`}
                  className="bg-red-950/70 hover:bg-red-900/70 border border-red-400/50 p-3.5 rounded-xl transition-all group flex flex-col justify-between shadow-md"
                  title="Bấm gọi Trực ban Khu phố 02"
                >
                  <div className="flex items-center justify-between text-xs text-red-200 font-bold mb-1">
                    <span>Trực ban Khu phố</span>
                    <Phone className="w-3.5 h-3.5 text-amber-300 group-hover:scale-110 transition-transform animate-pulse" />
                  </div>
                  <div className="text-base font-black text-white font-mono group-hover:text-amber-200">
                    {communityInfo.hotline || '028 3775 1234'}
                  </div>
                  <div className="text-[10px] text-red-200/90 mt-1">Hỗ trợ khẩn cấp dân sinh</div>
                </a>

                <a
                  href={`tel:${policeDigits}`}
                  className="bg-blue-950/70 hover:bg-blue-900/70 border border-blue-400/50 p-3.5 rounded-xl transition-all group flex flex-col justify-between shadow-md"
                  title="Bấm gọi Công an Phường Tân Hưng"
                >
                  <div className="flex items-center justify-between text-xs text-cyan-200 font-bold mb-1">
                    <span>Công an Phường</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-300 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-base font-black text-white font-mono group-hover:text-cyan-200">
                    {communityInfo.policePhone ? communityInfo.policePhone.split('(')[0].trim() : '028 3771 5678'}
                  </div>
                  <div className="text-[10px] text-cyan-200/90 mt-1">An ninh trật tự &amp; PCCC</div>
                </a>
              </div>

              {/* Key Administration Overview */}
              <div className="space-y-2 text-xs text-slate-200 bg-slate-900/60 p-3.5 rounded-xl border border-blue-400/20">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Trưởng Khu phố:</span>
                  <strong className="text-white font-bold">{communityInfo.leaderName || 'Đang cập nhật'}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Phó Trưởng Khu phố:</span>
                  <strong className="text-white font-bold">{communityInfo.deputyName || 'Đang cập nhật'}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Địa chỉ Văn phòng:</span>
                  <strong className="text-amber-300 font-semibold">{communityInfo.address || '465/1/2 Trần Xuân Soạn'}</strong>
                </div>
              </div>
            </div>

            {/* Quick Action Links inside Command Box */}
            <div className="mt-4 pt-3 border-t border-blue-300/20 flex items-center justify-between gap-2 text-xs">
              <button
                onClick={() => onNavigateTab('map-section')}
                className="text-cyan-300 hover:text-white font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-cyan-300" />
                <span>Xem bản đồ vị trí</span>
              </button>

              <button
                onClick={() => onNavigateTab('committee-section')}
                className="text-amber-300 hover:text-white font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Ban Điều hành</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Demographics: ĐÃ GIỮ ĐÚNG 4 MỤC (CƯ DÂN, HỘ DÂN, VNEID MỨC 2, GIA ĐÌNH VĂN HÓA), BỎ DVC VÀ TỔ DÂN PHỐ.
            MỖI MỤC MỘT MÀU SẮC RỰC RỠ, SÁNG SỦA THEO YÊU CẦU */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 pb-2 border-b border-blue-400/30 gap-2 text-xs text-slate-200">
            <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-cyan-200">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>DỮ LIỆU DÂN CƯ &amp; CHUYỂN ĐỔI SỐ KHU PHỐ 02</span>
            </div>
            <span>Cập nhật chính thức: {formatVietnameseDate(demographics.updatedAt || new Date())}</span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* 1. Tổng số cư dân - Màu Xanh Dương / Cyan rực rỡ */}
            <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 rounded-2xl p-4 sm:p-5 shadow-lg shadow-blue-900/30 border border-blue-300/40 text-white flex flex-col justify-between group hover:translate-y-[-2px] transition-all duration-200">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black uppercase text-blue-100 tracking-wider">Cư dân</span>
                  <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-xs">
                  {formatNumberVietnamese(demographics.totalResidents)}
                </div>
              </div>
              <div className="text-xs text-blue-100 mt-2 font-medium">Nhân khẩu thường trú &amp; tạm trú</div>
            </div>

            {/* 2. Tổng số hộ dân - Màu Vàng Cam / Hổ phách ấm áp */}
            <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-orange-500 rounded-2xl p-4 sm:p-5 shadow-lg shadow-amber-900/30 border border-amber-300/40 text-white flex flex-col justify-between group hover:translate-y-[-2px] transition-all duration-200">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black uppercase text-amber-100 tracking-wider">Hộ gia đình</span>
                  <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Home className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-xs">
                  {formatNumberVietnamese(demographics.totalHouseholds)}
                </div>
              </div>
              <div className="text-xs text-amber-100 mt-2 font-medium">Hộ dân đang cư trú thực tế</div>
            </div>

            {/* 3. Tỷ lệ VNeID Mức 2 - Màu Xanh Lá Cây / Ngọc bích tươi sáng */}
            <div className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 rounded-2xl p-4 sm:p-5 shadow-lg shadow-emerald-900/30 border border-emerald-300/40 text-white flex flex-col justify-between group hover:translate-y-[-2px] transition-all duration-200">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black uppercase text-emerald-100 tracking-wider">VNeID Mức 2</span>
                  <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-xs">
                  {vneidRate}%
                </div>
                {/* Visual Progress bar */}
                <div className="w-full bg-black/25 h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className="bg-white h-full rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${vneidRate}%` }}
                  />
                </div>
              </div>
              <div className="text-xs text-emerald-100 mt-2 font-medium">Đạt chỉ tiêu Đề án 06</div>
            </div>

            {/* 4. Gia đình văn hóa - Màu Tím / Indigo sang trọng */}
            <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-violet-600 rounded-2xl p-4 sm:p-5 shadow-lg shadow-purple-900/30 border border-purple-300/40 text-white flex flex-col justify-between group hover:translate-y-[-2px] transition-all duration-200">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black uppercase text-purple-100 tracking-wider">Gia đình văn hóa</span>
                  <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Award className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-xs">
                  {demographics.culturalFamiliesRate ?? 0}%
                </div>
              </div>
              <div className="text-xs text-purple-100 mt-2 font-medium">Tiêu chuẩn văn hóa dân cư</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
