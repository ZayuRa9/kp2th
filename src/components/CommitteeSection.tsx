import React, { useState } from 'react';
import {
  Users,
  Phone,
  Calendar,
  Briefcase,
  Award,
  Clock,
  Shield,
  PhoneForwarded,
  X,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { CommitteeMember, CommunityInfo } from '../types';
import { extractPhoneDigits, isWithinReceivingHours } from '../utils/rules';

interface CommitteeSectionProps {
  members: CommitteeMember[];
  communityInfo?: CommunityInfo;
  onOpenAdminModal?: () => void;
}

export const CommitteeSection: React.FC<CommitteeSectionProps> = ({
  members,
  communityInfo,
  onOpenAdminModal,
}) => {
  // Test/Demo mode override: 'auto' (real clock) | 'in_hours' | 'out_hours'
  const [simulationMode, setSimulationMode] = useState<'auto' | 'in_hours' | 'out_hours'>('auto');

  // Modal xác nhận cuộc gọi (Ngoài giờ tiếp dân & Trong giờ tiếp dân)
  const [callModalData, setCallModalData] = useState<{
    member: CommitteeMember;
    isInHours: boolean;
  } | null>(null);

  const policePhone = communityInfo?.policePhone || '028 3771 5678 (Công an Phường Tân Hưng)';
  const cleanPolicePhone = extractPhoneDigits(policePhone) || '02837715678';

  // Chuẩn hóa chức danh: Trưởng khu phố / Phó Trưởng khu phố
  const formatPosition = (pos: string) => {
    if (!pos) return 'Cán bộ Khu phố';
    let formatted = pos;
    formatted = formatted.replace(/Trưởng\s+ban\s+điều\s+hành/gi, 'Trưởng khu phố');
    formatted = formatted.replace(/Trưởng\s+ban/gi, 'Trưởng khu phố');
    formatted = formatted.replace(/Phó\s+ban\s+điều\s+hành/gi, 'Phó Trưởng khu phố');
    formatted = formatted.replace(/Phó\s+ban/gi, 'Phó Trưởng khu phố');
    return formatted;
  };

  const checkMemberInHours = (member: CommitteeMember): boolean => {
    if (simulationMode === 'in_hours') return true;
    if (simulationMode === 'out_hours') return false;
    return isWithinReceivingHours(member.receivingHours);
  };

  const initiateCall = (member: CommitteeMember, isInHours: boolean) => {
    setCallModalData({ member, isInHours });
  };

  return (
    <section id="committee-section" className="py-7 sm:py-9 bg-white border-b border-slate-200">
      <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 pb-2.5 border-b border-slate-200 gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100/90 text-blue-900 border border-blue-200 text-[10.5px] font-bold mb-1">
              <Users className="w-3 h-3 text-blue-700" />
              <span>TỔ CHỨC BỘ MÁY ĐIỀU HÀNH DÂN CƯ CƠ SỞ</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>BAN ĐIỀU HÀNH KHU PHỐ 02</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {members.length} nhân sự
              </span>
            </h2>
            <p className="mt-0.5 text-xs text-slate-600 max-w-3xl leading-relaxed">
              Danh sách và thông tin liên hệ trực tiếp của Trưởng khu phố, Phó Trưởng khu phố và các cán bộ phụ trách địa bàn Khu phố 02 – Phường Tân Hưng.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <div className="text-xs text-slate-600 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>
                Giờ tiếp dân: <strong className="text-slate-800">07:30 - 11:30 &amp; 13:30 - 17:00</strong> (T2 - T6) | T7: 07:30 - 11:30
              </span>
            </div>

            {/* Chế độ kiểm tra chuyển tiếp cuộc gọi */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-semibold border border-slate-200">
              <button
                type="button"
                onClick={() => setSimulationMode('auto')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  simulationMode === 'auto' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Kiểm tra theo thời gian đồng hồ thực tế"
              >
                Giờ thực tế
              </button>
              <button
                type="button"
                onClick={() => setSimulationMode('in_hours')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  simulationMode === 'in_hours' ? 'bg-emerald-600 text-white shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Mô phỏng trong giờ tiếp dân"
              >
                Trong giờ
              </button>
              <button
                type="button"
                onClick={() => setSimulationMode('out_hours')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  simulationMode === 'out_hours' ? 'bg-rose-600 text-white shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Mô phỏng ngoài giờ tiếp dân (chuyển sang Công an Phường)"
              >
                Ngoài giờ (Chuyển CA)
              </button>
            </div>
          </div>
        </div>

        {/* Member cards grid */}
        {members.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50">
            <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">Chưa có thông tin cán bộ Ban Điều hành</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-4">
              Quản trị viên vui lòng đăng nhập vào trang Điều hành để cập nhật danh sách cán bộ (Họ tên, Ngày sinh, Chức vụ: Trưởng khu phố / Phó Trưởng khu phố, Số điện thoại, Thời gian tiếp dân).
            </p>
            {onOpenAdminModal && (
              <button
                onClick={onOpenAdminModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
              >
                Cập nhật danh sách cán bộ
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {members.map((member) => {
              const isInHours = checkMemberInHours(member);
              const positionTitle = formatPosition(member.position);
              const receivingTimeText = member.receivingHours || '07:30 - 11:30 & 13:30 - 17:00 (Thứ 2 - Thứ 6)';

              return (
                <div
                  key={member.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition-all p-5 flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Avatar, Chức vụ, Trạng thái tiếp dân */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-900 font-bold flex items-center justify-center text-base border-2 border-white shadow-xs shrink-0">
                        {member.fullName
                          .split(' ')
                          .map((n) => n[0])
                          .slice(-2)
                          .join('')
                          .toUpperCase() || 'KP'}
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                          <Award className="w-3.5 h-3.5 text-blue-600" />
                          {positionTitle}
                        </span>

                        {/* Status Badge: Trong giờ tiếp dân VS Ngoài giờ tiếp dân */}
                        {isInHours ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Trong giờ tiếp dân
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                            <PhoneForwarded className="w-3 h-3 text-rose-600" />
                            Hết giờ làm việc (Chuyển CA)
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 mb-1">{member.fullName}</h3>

                    <div className="space-y-2 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                      {member.birthDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>
                            Ngày sinh: <strong className="text-slate-800">{member.birthDate}</strong>
                          </span>
                        </div>
                      )}

                      <div className="flex items-start gap-2">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <span>Phụ trách: </span>
                          <strong className="text-slate-800">{member.responsibility}</strong>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <span>Lịch tiếp dân: </span>
                          <span className="text-slate-700 font-medium">{receivingTimeText}</span>
                        </div>
                      </div>

                      {/* Số điện thoại cán bộ */}
                      <div className="flex items-center gap-2 pt-1">
                        <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>SĐT liên hệ: </span>
                        <button
                          type="button"
                          onClick={() => initiateCall(member, isInHours)}
                          className="font-bold text-emerald-700 hover:text-emerald-800 underline decoration-emerald-400 hover:decoration-emerald-700 cursor-pointer"
                          title={`Bấm để gọi ${member.phoneNumber}`}
                        >
                          {member.phoneNumber}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Nút hành động cuộc gọi */}
                  <div className="mt-5 pt-3 border-t border-slate-100">
                    {isInHours ? (
                      <button
                        type="button"
                        onClick={() => initiateCall(member, true)}
                        className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs active:scale-95 group cursor-pointer"
                        title={`Bấm để gọi ngay: ${member.phoneNumber}`}
                      >
                        <Phone className="w-3.5 h-3.5 group-hover:scale-110 transition-transform animate-pulse text-white" />
                        <span>Bấm gọi cán bộ: {member.phoneNumber}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => initiateCall(member, false)}
                        className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs active:scale-95 group cursor-pointer"
                        title="Hết giờ làm việc - Bấm để chuyển tiếp cuộc gọi tới Công an Phường Tân Hưng"
                      >
                        <PhoneForwarded className="w-3.5 h-3.5 group-hover:scale-110 transition-transform animate-bounce text-amber-300" />
                        <span>Hết giờ làm việc - Bấm để gọi</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL THÔNG BÁO THỜI GIAN LÀM VIỆC & XÁC NHẬN GỌI ĐIỆN THOẠI */}
      {callModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
            {callModalData.isInHours ? (
              // CASE 1: TRONG GIỜ LÀM VIỆC
              <div className="p-6">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6 animate-pulse" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setCallModalData(null)}
                    className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 mb-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  Đang trong giờ tiếp công dân
                </div>

                <h3 className="text-lg font-extrabold text-slate-900 mb-1">
                  Kết Nối Cán Bộ Khu Phố 2
                </h3>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  Quý cư dân đang kết nối đến <strong>{formatPosition(callModalData.member.position)} {callModalData.member.fullName}</strong>. Cán bộ đang trong ca trực tiếp nhận và xử lý thủ tục hành chính, giải đáp dân cư.
                </p>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Họ và tên:</span>
                    <strong className="text-slate-900">{callModalData.member.fullName}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Chức vụ:</span>
                    <strong className="text-blue-700">{formatPosition(callModalData.member.position)}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Giờ làm việc:</span>
                    <span className="text-slate-800 font-medium">{callModalData.member.receivingHours || '07:30 - 11:30 & 13:30 - 17:00'}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                    <span className="text-slate-600 font-bold">Số điện thoại:</span>
                    <strong className="text-base text-emerald-700">{callModalData.member.phoneNumber}</strong>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <a
                    href={`tel:${extractPhoneDigits(callModalData.member.phoneNumber)}`}
                    onClick={() => setCallModalData(null)}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/30 transition-all active:scale-95"
                  >
                    <Phone className="w-4 h-4 text-white" />
                    <span>Xác nhận gọi ngay</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setCallModalData(null)}
                    className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            ) : (
              // CASE 2: HẾT GIỜ LÀM VIỆC -> ĐÚNG CHUẨN NỘI DUNG VÀ TÍNH NĂNG THEO YÊU CẦU
              <div className="p-6">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6 animate-pulse" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setCallModalData(null)}
                    className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    aria-label="Đóng thông báo"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 mb-2">
                  <PhoneForwarded className="w-3.5 h-3.5 text-rose-600" />
                  Ngoài giờ tiếp dân theo quy định
                </div>

                <h3 className="text-lg font-black text-slate-900 mb-2">
                  Thông Báo Thời Gian Làm Việc
                </h3>

                {/* Đúng chuẩn nội dung người dùng yêu cầu:
                    "Hiện đã hết giờ làm việc của ... kính mong quý cư dân thông cảm. Quý cư dân gọi đến số trực ban của công an phường để xử lý." */}
                <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300 text-slate-800 text-sm leading-relaxed mb-5 shadow-xs">
                  <p className="font-semibold text-slate-900">
                    Hiện đã hết giờ làm việc của {formatPosition(callModalData.member.position)}{' '}
                    <strong>{callModalData.member.fullName}</strong>, kính mong quý cư dân thông cảm.
                  </p>
                  <p className="mt-2 text-slate-700">
                    Quý cư dân gọi đến <strong>số trực ban của công an phường</strong> để xử lý.
                  </p>
                </div>

                {/* Khối thông tin Trực ban Công an Phường */}
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 mb-5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Shield className="w-4 h-4 text-rose-600 shrink-0" />
                    <span className="text-xs font-bold text-rose-950 uppercase tracking-wide">
                      Số trực ban Công an Phường Tân Hưng
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="text-lg sm:text-xl font-black text-rose-700 tracking-tight">
                      {cleanPolicePhone}
                    </div>
                    <span className="text-[11px] font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-md">
                      Trực ban 24/7
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Tiếp nhận tin báo an ninh trật tự, tố giác tội phạm, báo cháy và hỗ trợ cứu hộ khẩn cấp trên địa bàn.
                  </p>
                </div>

                {/* Các nút hành động:
                    1. Xác nhận gọi Công an Phường
                    2. Chức năng Việc khẩn: tiếp tục gọi cho cán bộ phụ trách
                    3. Đóng */}
                <div className="space-y-2.5">
                  {/* Nút gọi trực ban Công an Phường */}
                  <a
                    href={`tel:${cleanPolicePhone}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/30 transition-all active:scale-95 group"
                    title={`Bấm gọi Trực ban Công an Phường: ${cleanPolicePhone}`}
                  >
                    <Shield className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>Xác nhận gọi Trực ban Công an Phường ({cleanPolicePhone})</span>
                  </a>

                  {/* Chức năng VIỆC KHẨN: tiếp tục gọi cho cán bộ phụ trách */}
                  <a
                    href={`tel:${extractPhoneDigits(callModalData.member.phoneNumber)}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs transition-all active:scale-95 border border-amber-600/40 shadow-xs group"
                    title={`Việc khẩn cấp - Bấm để tiếp tục gọi cho cán bộ: ${callModalData.member.fullName}`}
                  >
                    <AlertTriangle className="w-4 h-4 text-slate-950 group-hover:rotate-12 transition-transform" />
                    <span>Việc khẩn: Tiếp tục gọi cho cán bộ ({callModalData.member.phoneNumber})</span>
                  </a>

                  {/* Nút hủy/đóng */}
                  <button
                    type="button"
                    onClick={() => setCallModalData(null)}
                    className="w-full py-2 px-3 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
