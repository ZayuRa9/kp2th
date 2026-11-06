import React from 'react';
import { Landmark, Phone, Mail, MapPin, Clock, ShieldCheck, Lock } from 'lucide-react';
import { CommunityInfo } from '../types';
import { extractPhoneDigits } from '../utils/rules';

interface FooterProps {
  communityInfo: CommunityInfo;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  communityInfo,
  onOpenAdmin,
  isAdminLoggedIn,
}) => {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      {/* Main Footer Info */}
      <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 sm:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shrink-0 shadow-md">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-red-400 uppercase tracking-widest">
                  UBND PHƯỜNG TÂN HƯNG
                </div>
                <h3 className="text-base font-extrabold text-white tracking-tight">
                  KHU PHỐ 02
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Hệ thống thông tin quản lý, dịch vụ tiện ích số và hỗ trợ điều hành cộng đồng dân cư thống nhất Khu phố 02, Phường Tân Hưng, Thành phố Hồ Chí Minh.
            </p>

            <div className="text-xs text-slate-400 space-y-1.5 pt-1">
              <div>
                <span className="text-slate-500">Trưởng khu phố:</span>{' '}
                <span className="text-slate-200 font-semibold">{communityInfo.leaderName || 'Đang cập nhật'}</span>
                {communityInfo.leaderPhone && (
                  <a
                    href={`tel:${extractPhoneDigits(communityInfo.leaderPhone)}`}
                    className="ml-2 text-blue-400 hover:text-blue-300 font-semibold underline"
                    title="Bấm gọi liền"
                  >
                    ({communityInfo.leaderPhone})
                  </a>
                )}
              </div>
              <div>
                <span className="text-slate-500">Phó Trưởng khu phố:</span>{' '}
                <span className="text-slate-200 font-semibold">{communityInfo.deputyName || 'Đang cập nhật'}</span>
                {communityInfo.deputyPhone && (
                  <a
                    href={`tel:${extractPhoneDigits(communityInfo.deputyPhone)}`}
                    className="ml-2 text-blue-400 hover:text-blue-300 font-semibold underline"
                    title="Bấm gọi liền"
                  >
                    ({communityInfo.deputyPhone})
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Col 2: Direct Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white border-b border-slate-800 pb-2">
              ĐỊA CHỈ &amp; ĐƯỜNG DÂY NÓNG
            </h4>

            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <span>{communityInfo.address}</span>
                  <div className="mt-1">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${(communityInfo.coordinates || '10.751307,106.707736').replace(/\s+/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 hover:text-sky-300 font-semibold underline decoration-sky-400/50 inline-flex items-center gap-1"
                    >
                      <span>Dẫn đường tới Văn phòng Khu phố 2</span>
                    </a>
                  </div>
                </div>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a
                  href={`tel:${extractPhoneDigits(communityInfo.hotline)}`}
                  className="hover:text-emerald-300 font-bold text-amber-300 transition-colors"
                  title="Bấm gọi liền Hotline KP2"
                >
                  Hotline KP2: {communityInfo.hotline} <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded ml-1">Gọi liền</span>
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <a
                  href={`tel:${extractPhoneDigits(communityInfo.policePhone)}`}
                  className="hover:text-blue-300 transition-colors"
                  title="Bấm gọi liền Công an Phường"
                >
                  {communityInfo.policePhone} <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded ml-1">Gọi liền</span>
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                <a
                  href={`tel:${extractPhoneDigits(communityInfo.healthClinicPhone)}`}
                  className="hover:text-teal-300 transition-colors"
                  title="Bấm gọi liền Trạm Y tế"
                >
                  {communityInfo.healthClinicPhone} <span className="text-[10px] bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded ml-1">Gọi liền</span>
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="truncate">{communityInfo.email}</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Operational hours */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white border-b border-slate-800 pb-2">
              LỊCH LÀM VIỆC &amp; TIẾP CÔNG DÂN
            </h4>

            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-200">Giờ hành chính:</div>
                  <div>{communityInfo.workingHours}</div>
                </div>
              </li>
              <li className="pt-2 text-[11px] text-slate-500 leading-normal">
                Các vấn đề an ninh trật tự, báo cháy và sự cố khẩn cấp tiếp nhận 24/7 qua đường dây nóng trực ban khu phố và Tổng đài 1022.
              </li>
            </ul>
          </div>

          {/* Col 4: Digital Government Seal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white border-b border-slate-800 pb-2">
              CHUYỂN ĐỔI SỐ CƠ SỞ
            </h4>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2 text-xs">
              <div className="flex items-center gap-2 text-blue-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Nền tảng số thống nhất</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Đảm bảo dữ liệu chính xác, minh bạch, kết nối người dân với chính quyền cơ sở Phường Tân Hưng nhanh chóng và bảo mật.
              </p>
              <div className="pt-2 border-t border-slate-800 flex flex-col gap-1.5">
                <span className="text-[11px] text-slate-500">
                  Cổng dữ liệu điều hành điện tử khu phố hoạt động 24/7.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar & Discreet Admin Entry */}
      <div className="bg-black/60 border-t border-slate-900 px-4 sm:px-6 py-4 text-xs text-slate-500">
        <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            2026 Bản quyền thuộc về chi đoàn khu phố 2, phường Tân Hưng
          </div>

          {/* Discreet Admin Lock - not prominent in public nav */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors py-1 px-2 rounded-lg hover:bg-white/5 cursor-pointer"
              title="Khu vực quản trị điều hành nội bộ"
            >
              <Lock className={`w-3.5 h-3.5 ${isAdminLoggedIn ? 'text-amber-400' : ''}`} />
              <span className="text-[11px]">
                {isAdminLoggedIn ? 'Bảng Điều Hành KP2' : 'Điều hành nội bộ'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
