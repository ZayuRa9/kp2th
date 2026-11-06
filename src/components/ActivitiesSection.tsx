import React, { useState } from 'react';
import { Calendar, Clock, MapPin, User, ArrowRight, X, UserCheck, Search, CheckCircle2, AlertCircle, Pin, ShieldCheck } from 'lucide-react';
import { Activity, ActivityStatus } from '../types';
import { ProgramRegistrationModal } from './ProgramRegistrationModal';
import { queryProgramRegistrationStatusApi } from '../services/api';

interface ActivitiesSectionProps {
  activities: Activity[];
  onRefresh?: () => void;
}

export const ActivitiesSection: React.FC<ActivitiesSectionProps> = ({ activities, onRefresh }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | ActivityStatus>('all');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [registeringActivity, setRegisteringActivity] = useState<Activity | null>(null);

  // Status Lookup Modal State
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [lookupPhone, setLookupPhone] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResults, setLookupResults] = useState<any[] | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const filters = [
    { id: 'all', label: 'Tất cả hoạt động' },
    { id: 'ongoing', label: 'Đang triển khai' },
    { id: 'upcoming', label: 'Sắp diễn ra' },
    { id: 'completed', label: 'Đã hoàn thành' },
  ];

  const filtered = activities.filter((act) => {
    if (activeFilter === 'all') return true;
    return act.status === activeFilter;
  });

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupPhone.trim() || lookupPhone.trim().length < 8) {
      setLookupError('Vui lòng nhập số điện thoại hợp lệ (tối thiểu 8 số)');
      return;
    }
    setLookupLoading(true);
    setLookupError(null);
    try {
      const res = await queryProgramRegistrationStatusApi(lookupPhone.trim());
      setLookupResults(res);
      if (res.length === 0) {
        setLookupError('Không tìm thấy lượt đăng ký nào tương ứng với số điện thoại này.');
      }
    } catch (err: any) {
      setLookupError(err.message || 'Lỗi tra cứu thông tin');
    } finally {
      setLookupLoading(false);
    }
  };

  const getStatusBadge = (status: ActivityStatus) => {
    switch (status) {
      case 'ongoing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Đang triển khai
          </span>
        );
      case 'upcoming':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Sắp diễn ra
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold uppercase tracking-wider">
            Đã hoàn thành
          </span>
        );
    }
  };

  return (
    <section id="activities-section" className="py-7 sm:py-9 bg-slate-50 border-b border-slate-200">
      <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 pb-2.5 border-b border-slate-200 gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-[10.5px] font-bold mb-1">
              <Calendar className="w-3 h-3 text-amber-700" />
              <span>ĐỜI SỐNG CỘNG ĐỒNG DÂN CƯ</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>HOẠT ĐỘNG &amp; SỰ KIỆN CỘNG ĐỒNG</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {activities.length} sự kiện
              </span>
            </h2>
            <p className="mt-0.5 text-xs text-slate-600 max-w-3xl leading-relaxed">
              Các phong trào thi đua, sự kiện văn hóa thể thao tại Khu phố 02. Đăng ký trực tuyến và nhận xác nhận từ Ban Điều hành.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setIsLookupOpen(true);
                setLookupResults(null);
                setLookupError(null);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-blue-300 text-blue-700 hover:bg-blue-50 text-xs font-bold shadow-xs hover:shadow-sm transition-all cursor-pointer"
            >
              <Search className="w-3 h-3 text-blue-600" />
              <span>Tra cứu kết quả xác nhận</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        {activities.length > 0 && (
          <div className="flex items-center gap-1.5 mb-4 overflow-x-auto no-scrollbar pb-1">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id as any)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeFilter === f.id
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {/* Empty state or Grid */}
        {activities.length === 0 ? (
          <div className="text-center py-10 px-4 rounded-2xl border-2 border-dashed border-slate-200 bg-white max-w-2xl mx-auto">
            <Calendar className="w-9 h-9 text-slate-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">Chưa có hoạt động nào được ghim</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Các hoạt động và sự kiện khi được đăng tải sẽ luôn được ghim trên hệ thống cho tới khi quản lý phần mềm gỡ bỏ.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filtered.map((activity) => (
              <div
                key={activity.id}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-400 transition-all duration-300 flex flex-col justify-between group transform hover:-translate-y-1"
              >
                <div>
                  {/* Image or Banner */}
                  <div className="relative h-36 overflow-hidden bg-slate-900 flex items-center justify-center">
                    {activity.imageUrl ? (
                      <img
                        src={activity.imageUrl}
                        alt={activity.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                        onClick={() => setSelectedActivity(activity)}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-center p-3 text-center">
                        <Calendar className="w-8 h-8 text-cyan-400 mb-1 opacity-80" />
                        <span className="text-xs font-bold text-white line-clamp-2">{activity.title}</span>
                      </div>
                    )}

                    {/* Overlay status badge and Pin tag */}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5 flex-wrap">
                      {getStatusBadge(activity.status)}
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-black/60 text-amber-300 backdrop-blur-xs">
                        <Pin className="w-2.5 h-2.5 text-amber-400" />
                        Luôn ghim
                      </span>
                    </div>

                    {/* Logo biểu trưng góc phải */}
                    {activity.logoUrl && (
                      <div className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-white/95 backdrop-blur-md p-1 shadow-xs border border-white/60 flex items-center justify-center z-10">
                        <img src={activity.logoUrl} alt="Logo sự kiện" className="w-full h-full object-contain" />
                      </div>
                    )}

                    <div className="absolute bottom-2 left-2">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-black/70 text-white backdrop-blur-xs border border-white/20">
                        {activity.categoryLabel}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-3 space-y-1.5">
                    <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2">
                      {activity.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {activity.summary}
                    </p>

                    <div className="space-y-1 pt-1.5 border-t border-slate-100 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-blue-600 shrink-0" />
                        <span className="font-medium text-slate-700 truncate">{activity.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                        <span className="truncate">{activity.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{activity.organizer}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-3 pt-0 space-y-1.5">
                  {activity.status !== 'completed' && (
                    <button
                      onClick={() => setRegisteringActivity(activity)}
                      className="w-full py-1.5 px-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer active:scale-95"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Đăng ký tham gia (Chờ QL duyệt)</span>
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedActivity(activity)}
                    className="w-full py-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Xem nội dung chi tiết</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Activity Details Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="relative h-48 bg-slate-900 overflow-hidden flex items-center justify-center">
              {selectedActivity.imageUrl ? (
                <img
                  src={selectedActivity.imageUrl}
                  alt={selectedActivity.title}
                  className="w-full h-full object-cover opacity-80"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-blue-900 to-indigo-950 flex items-center justify-center">
                  <Calendar className="w-14 h-14 text-blue-300 opacity-60" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent"></div>
              <button
                onClick={() => setSelectedActivity(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-5 right-5">
                <div className="flex items-center gap-2 mb-1">
                  {getStatusBadge(selectedActivity.status)}
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500 text-slate-950">
                    📌 Hoạt động luôn ghim
                  </span>
                </div>
                <h3 className="text-white font-extrabold text-lg sm:text-xl drop-shadow-xs">
                  {selectedActivity.title}
                </h3>
              </div>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4 text-xs text-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Thời gian</div>
                    <div className="font-semibold text-slate-800">{selectedActivity.time}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-600" />
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Địa điểm</div>
                    <div className="font-semibold text-slate-800">{selectedActivity.location}</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-2">Tóm tắt nội dung</h4>
                <p className="leading-relaxed bg-blue-50/60 p-3.5 rounded-xl border border-blue-100 text-blue-900">
                  {selectedActivity.summary}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-2">Kế hoạch triển khai chi tiết</h4>
                <div className="leading-relaxed space-y-2 text-slate-700 whitespace-pre-line">
                  {selectedActivity.content}
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 leading-relaxed">
                <strong>Quy định tham gia:</strong> Sau khi người dân đăng ký, Người quản lý phần mềm sẽ kiểm tra danh sách và bấm xác nhận tham gia. Khi người quản lý xác nhận thành công thì người dân mới đủ điều kiện tham gia.
              </div>

              <div className="pt-2 border-t border-slate-100 text-slate-500">
                <span className="font-bold text-slate-700">Đơn vị chủ trì: </span>
                <span>{selectedActivity.organizer}</span>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
              {selectedActivity.status !== 'completed' ? (
                <button
                  onClick={() => {
                    const act = selectedActivity;
                    setSelectedActivity(null);
                    setRegisteringActivity(act);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Đăng ký tham gia</span>
                </button>
              ) : (
                <div></div>
              )}
              <button
                onClick={() => setSelectedActivity(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold cursor-pointer"
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tra Cứu Trạng Thái Đăng Ký Modal */}
      {isLookupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-cyan-300" />
                <div>
                  <h3 className="text-base font-extrabold">TRA CỨU XÁC NHẬN THAM GIA HOẠT ĐỘNG</h3>
                  <p className="text-xs text-blue-200">Khu phố 02 – Phường Tân Hưng</p>
                </div>
              </div>
              <button
                onClick={() => setIsLookupOpen(false)}
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <form onSubmit={handleLookup} className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">
                  Nhập số điện thoại bạn đã dùng để đăng ký:
                </label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    required
                    placeholder="Ví dụ: 0973 489 789"
                    value={lookupPhone}
                    onChange={(e) => setLookupPhone(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold"
                  />
                  <button
                    type="submit"
                    disabled={lookupLoading}
                    className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>{lookupLoading ? 'Đang tìm...' : 'Tra cứu'}</span>
                  </button>
                </div>
              </form>

              {lookupError && (
                <div className="p-3 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{lookupError}</span>
                </div>
              )}

              {lookupResults && lookupResults.length > 0 && (
                <div className="space-y-3 max-h-60 overflow-y-auto pt-2">
                  <div className="text-xs font-bold text-slate-700">
                    Tìm thấy {lookupResults.length} lượt đăng ký:
                  </div>
                  {lookupResults.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-extrabold text-slate-900 text-sm">{item.activityTitle}</div>
                        {item.status === 'confirmed' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-600 text-white font-extrabold text-[10px] shrink-0">
                            <CheckCircle2 className="w-3 h-3" />
                            ĐÃ XÁC NHẬN THAM GIA
                          </span>
                        ) : item.status === 'rejected' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-600 text-white font-extrabold text-[10px] shrink-0">
                            <X className="w-3 h-3" />
                            TỪ CHỐI TIẾP NHẬN
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 font-extrabold text-[10px] shrink-0">
                            <Clock className="w-3 h-3" />
                            CHƯA XÁC NHẬN
                          </span>
                        )}
                      </div>

                      <div className="text-slate-600 flex items-center justify-between">
                        <span>Người đăng ký: <strong>{item.fullName}</strong></span>
                        <span>Số người: <strong>{item.attendeeCount}</strong></span>
                      </div>

                      {item.status === 'confirmed' ? (
                        <div className="p-2 bg-emerald-100/70 border border-emerald-300 text-emerald-900 rounded-lg text-[11px] font-bold">
                          🎉 Người quản lý đã xác nhận tham gia! Bạn đã đủ điều kiện tham dự hoạt động.
                        </div>
                      ) : item.status === 'rejected' ? (
                        <div className="p-2 bg-rose-100/70 border border-rose-300 text-rose-900 rounded-lg text-[11px] font-medium">
                          Rất tiếc hồ sơ đăng ký chưa được chấp thuận do đã đủ số lượng hoặc chưa phù hợp.
                        </div>
                      ) : (
                        <div className="p-2 bg-amber-100/70 border border-amber-300 text-amber-900 rounded-lg text-[11px] font-semibold">
                          ⏳ Đang chờ người quản lý phần mềm duyệt. Hiện bạn <strong>chưa thể tham gia</strong> cho đến khi có xác nhận.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Program Registration Modal */}
      {registeringActivity && (
        <ProgramRegistrationModal
          activity={registeringActivity}
          onClose={() => setRegisteringActivity(null)}
          onSuccess={() => {
            if (onRefresh) onRefresh();
          }}
        />
      )}
    </section>
  );
};
