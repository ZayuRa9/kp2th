import React, { useState } from 'react';
import { X, UserCheck, Calendar, MapPin, Phone, Users, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Activity } from '../types';
import { registerProgramApi } from '../services/api';
import { useToast } from '../context/ToastContext';

interface ProgramRegistrationModalProps {
  activity: Activity | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ProgramRegistrationModal: React.FC<ProgramRegistrationModalProps> = ({
  activity,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [neighborhoodGroup, setNeighborhoodGroup] = useState('');
  const [attendeeCount, setAttendeeCount] = useState(1);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!activity) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phoneNumber.trim()) {
      setError('Vui lòng nhập đầy đủ họ tên và số điện thoại liên hệ');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await registerProgramApi({
        activityId: activity.id,
        activityTitle: activity.title,
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        neighborhoodGroup,
        attendeeCount: Number(attendeeCount) || 1,
        notes: notes.trim(),
      });
      setSuccess(true);
      showToast({
        type: 'event',
        title: `Đã gửi đăng ký tham gia hoạt động`,
        message: `${fullName.trim()} đã đăng ký tham gia "${activity.title}". Ban Tổ chức sẽ liên hệ qua SĐT ${phoneNumber.trim()}.`,
        duration: 7000,
        actionLabel: 'Xem hoạt động',
        metadata: { targetTab: 'activities-section' },
      });
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Lỗi gửi đăng ký tham gia');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-700/80 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">ĐĂNG KÝ THAM GIA CHƯƠNG TRÌNH</h3>
              <p className="text-xs text-blue-200">Ban Điều hành Khu phố 02 – Phường Tân Hưng</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-5 space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                <Clock className="w-8 h-8 animate-pulse" />
              </div>
              
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black uppercase tracking-wider mb-2">
                  Trạng thái: Chưa xác nhận
                </span>
                <h4 className="text-lg font-extrabold text-slate-900">Tiếp nhận đăng ký thành công!</h4>
              </div>

              <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 text-xs text-amber-950 text-left space-y-2 leading-relaxed">
                <div className="font-bold flex items-center gap-1.5 text-amber-900">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-700" />
                  <span>Quy định xác nhận tham gia:</span>
                </div>
                <p>
                  Hệ thống đã chuyển thông tin của người dân <strong>{fullName}</strong> (SĐT: <strong>{phoneNumber}</strong>) tới <strong>Người quản lý phần mềm</strong>.
                </p>
                <p className="font-semibold text-rose-800 bg-white/80 p-2 rounded-lg border border-amber-200">
                  ⚠️ Lưu ý: Khi người quản lý phần mềm duyệt "Xác nhận tham gia" thì bạn mới đủ điều kiện tham gia. Nếu hệ thống vẫn hiện "Chưa xác nhận" thì bạn chưa thể tham gia chương trình.
                </p>
                <p className="text-[11px] text-slate-600">
                  Bạn có thể sử dụng số điện thoại <strong>{phoneNumber}</strong> tại mục "Tra cứu trạng thái" để kiểm tra kết quả bất kỳ lúc nào.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  Đã hiểu và Đóng lại
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Program Overview */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-slate-700 space-y-1">
                <div className="font-bold text-blue-900 text-sm line-clamp-2">{activity.title}</div>
                <div className="flex items-center gap-1.5 text-slate-600 pt-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                  <span>{activity.time}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span className="line-clamp-1">{activity.location}</span>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs font-medium border border-red-200">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Họ và tên người đăng ký <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Số điện thoại liên hệ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Ví dụ: 0912 345 678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Địa chỉ / Nơi ở tại Khu phố 02 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Tự nhập số nhà, tên hẻm tại Khu phố 2..."
                    value={neighborhoodGroup}
                    onChange={(e) => setNeighborhoodGroup(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Số người cùng tham gia <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    required
                    value={attendeeCount}
                    onChange={(e) => setAttendeeCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-36 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold text-slate-900 bg-white"
                    placeholder="Tự nhập số người"
                  />
                  <span className="text-xs text-slate-600 font-medium">người (Người dân tự nhập số người cùng tham gia)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ghi chú hoặc yêu cầu hỗ trợ (nếu có)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú về nhu cầu đi lại, câu hỏi về chương trình..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                >
                  {loading ? 'Đang gửi thông tin...' : 'Xác nhận đăng ký'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
