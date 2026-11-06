import React from 'react';
import { X, Smartphone, ShieldCheck, Download, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ApkGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
}

export const ApkGuideModal: React.FC<ApkGuideModalProps> = ({ isOpen, onClose, onDownload }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Smartphone className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">Hướng Dẫn Cài Đặt Ứng Dụng Android (.APK)</h3>
              <p className="text-xs text-emerald-100">Khu phố 02 – Phường Tân Hưng (Phiên bản v1.2.0)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed text-emerald-900">
              <p className="font-bold mb-1">Gói cài đặt an toàn &amp; chính thức</p>
              Gói cài đặt <span className="font-mono font-semibold">KhuPho02_TanHung_v1.2.0.apk</span> được phát hành trực tiếp bởi Ban Điều hành Khu phố 02, Phường Tân Hưng. Ứng dụng không chứa mã độc, không thu thập dữ liệu cá nhân ngoài thông tin phản ánh do người dân chủ động gửi.
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">1</span>
              Bước 1: Tải tệp tin cài đặt về máy
            </h4>
            <p className="text-xs text-slate-600 pl-8">
              Nhấn nút <span className="font-semibold text-emerald-700">"Tải gói cài đặt APK"</span> hoặc quét mã QR bằng camera điện thoại. Trình duyệt Chrome / Cốc Cốc trên điện thoại sẽ bắt đầu tải tệp về thư mục Tải về.
            </p>

            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">2</span>
              Bước 2: Mở tệp vừa tải
            </h4>
            <p className="text-xs text-slate-600 pl-8">
              Kéo thanh thông báo trên đỉnh màn hình xuống và nhấn vào thông báo <span className="font-semibold">"Đã tải xong KhuPho02_TanHung_v1.2.0.apk"</span>, hoặc vào ứng dụng <span className="font-semibold">Quản lý tệp (File Manager) &gt; Tải về (Downloads)</span> và bấm vào tệp APK.
            </p>

            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">3</span>
              Bước 3: Cho phép cài đặt ứng dụng từ nguồn này
            </h4>
            <div className="pl-8 text-xs text-slate-600 space-y-2">
              <p>
                Nếu điện thoại hiển thị cảnh báo bảo mật mặc định của Android: <em>"Để bảo mật, điện thoại của bạn không được phép cài đặt ứng dụng không rõ nguồn gốc từ nguồn này"</em>:
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
                <div className="flex items-center gap-2 text-slate-800 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Bấm vào <strong>Cài đặt (Settings)</strong> trên hộp thoại cảnh báo.</span>
                </div>
                <div className="flex items-center gap-2 text-slate-800 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Gạt công tắc sang bật <strong>"Cho phép từ nguồn này" (Allow from this source)</strong>.</span>
                </div>
                <div className="flex items-center gap-2 text-slate-800 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Nhấn nút <strong>Trở lại (Back)</strong> một lần.</span>
                </div>
              </div>
            </div>

            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">4</span>
              Bước 4: Hoàn tất cài đặt và trải nghiệm
            </h4>
            <p className="text-xs text-slate-600 pl-8">
              Nhấn <strong>"Cài đặt" (Install)</strong>. Sau khoảng 3-5 giây, màn hình hiển thị <strong>"Ứng dụng đã được cài đặt"</strong>. Bạn nhấn <strong>"Mở"</strong> để bắt đầu sử dụng ngay.
            </p>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Ghi chú hỗ trợ:</strong> Nếu bà con gặp khó khăn trong quá trình cài đặt, vui lòng liên hệ Trụ sở Ban Điều hành Khu phố 02 hoặc Tổ trưởng Tổ Dân phố để được cán bộ đoàn thanh niên hỗ trợ trực tiếp.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition"
          >
            Đóng lại
          </button>
          <button
            type="button"
            onClick={() => {
              onDownload();
              onClose();
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Tải ngay APK (2.0 MB)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
