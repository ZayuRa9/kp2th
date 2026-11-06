import React from 'react';
import {
  MapPin,
  Navigation,
  ExternalLink,
  Shield,
  Building,
  Stethoscope,
  Phone,
  Compass,
  CheckCircle2,
  Map,
  Share2,
} from 'lucide-react';
import { CommunityInfo } from '../types';
import { extractPhoneDigits } from '../utils/rules';

interface WardMapSectionProps {
  communityInfo: CommunityInfo;
}

export const WardMapSection: React.FC<WardMapSectionProps> = ({ communityInfo }) => {
  const fixedOfficeAddress = communityInfo.address || '465/1/2 Trần Xuân Soạn, Khu phố 2, Phường Tân Hưng, Thành phố Hồ Chí Minh';
  const rawCoords = communityInfo.coordinates || '10.751307, 106.707736';
  const cleanCoords = rawCoords.replace(/\s+/g, '');
  const navigationUrl = `https://www.google.com/maps/dir/?api=1&destination=${cleanCoords}`;
  const embedMapUrl = `https://maps.google.com/maps?q=${cleanCoords}&z=18&t=&ie=UTF8&iwloc=&output=embed`;

  return (
    <section id="map-section" className="py-7 sm:py-9 bg-slate-50 border-b border-slate-200">
      <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 pb-2.5 border-b border-slate-200 gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100/90 text-blue-900 border border-blue-200 text-[10.5px] font-bold mb-1">
              <MapPin className="w-3 h-3 text-blue-700" />
              <span>ĐỊA GIỚI HÀNH CHÍNH &amp; VỊ TRÍ BẢN ĐỒ SỐ</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>BẢN ĐỒ SỐ &amp; VĂN PHÒNG KHU PHỐ 02</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Tọa độ GPS chuẩn
              </span>
            </h2>
            <p className="mt-0.5 text-xs text-slate-600 max-w-3xl leading-relaxed">
              Trụ sở Ban Điều hành Khu phố 02 tọa lạc tại <strong>{fixedOfficeAddress}</strong> (<strong>{cleanCoords}</strong>).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href={navigationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs sm:text-sm font-bold transition-all shadow-md active:scale-95 group"
              title="Mở ứng dụng Google Maps dẫn đường trực tiếp tới Văn phòng KP2"
            >
              <Navigation className="w-4 h-4 animate-pulse group-hover:scale-110 transition-transform" />
              <span>Dẫn đường Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>
        </div>

        {/* Full-Width Grid: Map (8 cols) + Key Facilities (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Interactive Google Map iframe */}
          <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-between">
            {/* Top Coordinate Ribbon */}
            <div className="p-3.5 bg-slate-100/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700">
              <div className="flex items-center gap-2 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Trụ sở KP2: <strong>{fixedOfficeAddress}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 font-mono text-xs font-bold">
                  <Compass className="w-3.5 h-3.5 text-blue-600" />
                  <span>GPS: {cleanCoords}</span>
                </span>
              </div>
            </div>

            {/* Map Container */}
            <div className="relative w-full h-[380px] sm:h-[480px] lg:h-[520px] bg-slate-200">
              <iframe
                title="Bản đồ tọa độ Văn phòng Khu phố 02 - Phường Tân Hưng"
                src={embedMapUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />
            </div>

            {/* Bottom Status Bar */}
            <div className="p-3.5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Đã xác thực tọa độ vị trí thực tế tại hẻm 465/1/2 Trần Xuân Soạn</span>
              </div>
              <a
                href={navigationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold flex items-center gap-1.5 text-xs shadow-xs transition-colors"
              >
                <Navigation className="w-3.5 h-3.5 text-white" />
                <span>Mở bản đồ dẫn đường</span>
              </a>
            </div>
          </div>

          {/* Key Landmarks, Boundaries & Direct Emergency Contacts (4 cols) */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
                <Building className="w-4 h-4 text-blue-700" />
                <span>Cơ quan &amp; Địa điểm trọng yếu</span>
              </h3>

              <div className="space-y-3">
                {/* 1. Văn phòng KP2 */}
                <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 shadow-xs">
                  <div className="flex items-start gap-2.5">
                    <Building className="w-4 h-4 text-blue-700 mt-0.5 shrink-0" />
                    <div className="w-full">
                      <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                        <span>Văn phòng Ban Điều hành KP2</span>
                        <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-bold uppercase">Trụ sở</span>
                      </div>
                      <div className="text-xs text-slate-700 mt-1 font-medium">{fixedOfficeAddress}</div>
                      <div className="text-[11px] text-blue-800 font-mono mt-0.5">Tọa độ: {cleanCoords}</div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <a
                          href={navigationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-all shadow-xs active:scale-95"
                        >
                          <Navigation className="w-3.5 h-3.5 text-white" />
                          <span>Dẫn đường Google Maps</span>
                        </a>

                        <a
                          href={`tel:${extractPhoneDigits(communityInfo.hotline)}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs active:scale-95"
                        >
                          <Phone className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
                          <span>Gọi Trực ban: {communityInfo.hotline}</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Trạm Y tế Phường */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-start gap-2.5">
                    <Stethoscope className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div className="w-full">
                      <div className="text-xs font-bold text-slate-900">Trạm Y tế Phường Tân Hưng</div>
                      <div className="text-xs text-slate-600 mt-0.5">Tiếp nhận sơ cấp cứu, tiêm chủng &amp; khám chữa bệnh ban đầu</div>
                      <a
                        href={`tel:${extractPhoneDigits(communityInfo.healthClinicPhone)}`}
                        className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs active:scale-95"
                      >
                        <Phone className="w-3.5 h-3.5 text-white" />
                        <span>{communityInfo.healthClinicPhone} (Gọi liền)</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* 3. Công an Phường */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-start gap-2.5">
                    <Shield className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                    <div className="w-full">
                      <div className="text-xs font-bold text-slate-900">Công an Phường Tân Hưng</div>
                      <div className="text-xs text-slate-600 mt-0.5">Tiếp nhận tin báo tội phạm, trật tự an toàn giao thông &amp; PCCC</div>
                      <a
                        href={`tel:${extractPhoneDigits(communityInfo.policePhone)}`}
                        className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs active:scale-95"
                      >
                        <Phone className="w-3.5 h-3.5 text-white" />
                        <span>{communityInfo.policePhone} (Gọi liền)</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
