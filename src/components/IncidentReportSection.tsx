import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  MapPin,
  Camera,
  Navigation,
  Send,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Trash2,
  Zap,
  Flame,
  Search,
  Check,
  ChevronRight,
  Phone,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { PublicIncident } from '../services/api';
import { submitIncidentReportApi, uploadFileApi } from '../services/api';
import { formatVietnameseDate, extractPhoneDigits } from '../utils/rules';
import { useToast } from '../context/ToastContext';

interface IncidentReportSectionProps {
  incidents: PublicIncident[];
  onRefresh?: () => void;
}

const CATEGORIES = [
  { value: 'infrastructure', label: 'Hạ tầng đô thị (Đèn đường, cống rãnh, vỉa hè)', icon: Zap },
  { value: 'environment', label: 'Môi trường & Rác thải sinh hoạt', icon: Trash2 },
  { value: 'security', label: 'An ninh trật tự khu dân cư', icon: ShieldAlert },
  { value: 'fire_safety', label: 'An toàn PCCC & Lối thoát hiểm', icon: Flame },
  { value: 'order', label: 'Lấn chiếm lòng lề đường, trật tự hẻm', icon: AlertTriangle },
  { value: 'other', label: 'Vấn đề dân sinh khác', icon: AlertTriangle },
];

export const IncidentReportSection: React.FC<IncidentReportSectionProps> = ({ incidents, onRefresh }) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('infrastructure');
  const [description, setDescription] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | undefined>();
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');

  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsMessage, setGpsMessage] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccessCode, setSubmitSuccessCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Quick lookup state
  const [quickLookupQuery, setQuickLookupQuery] = useState('');
  const [listSearchTerm, setListSearchTerm] = useState('');
  const [listStatusFilter, setListStatusFilter] = useState('all');

  // Get current device GPS location
  const handleGetGpsLocation = () => {
    if (!navigator.geolocation) {
      setGpsMessage('Thiết bị không hỗ trợ định vị GPS');
      return;
    }
    setGpsLoading(true);
    setGpsMessage(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));
        setCoordinates({ lat, lng });
        setGpsLoading(false);
        setGpsMessage(`Đã lấy tọa độ: ${lat}, ${lng}`);
        if (!locationAddress) {
          setLocationAddress(`Gần tọa độ [${lat}, ${lng}], Khu phố 02, Phường Tân Hưng`);
        }
      },
      (err) => {
        setGpsLoading(false);
        setGpsMessage(`Không thể lấy vị trí (${err.message}). Vui lòng nhập địa chỉ cụ thể.`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Handle local photo file upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn tệp hình ảnh (JPG, PNG)');
      return;
    }

    setUploadingPhoto(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        setPhotoPreview(base64Data);
        try {
          const res = await uploadFileApi(file.name, base64Data);
          setPhotoUrl(res.fileUrl);
        } catch {
          setError('Không thể lưu ảnh lên máy chủ. Bạn vẫn có thể gửi phản ánh.');
        } finally {
          setUploadingPhoto(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !locationAddress.trim() || !reporterName.trim() || !reporterPhone.trim()) {
      setError('Vui lòng điền đầy đủ các mục đánh dấu (*)');
      return;
    }

    setSubmitting(true);
    setError(null);

    const catObj = CATEGORIES.find((c) => c.value === category);

    try {
      const res = await submitIncidentReportApi({
        title: title.trim(),
        category,
        categoryLabel: catObj?.label || 'Sự cố dân sinh',
        description: description.trim(),
        locationAddress: locationAddress.trim(),
        coordinates,
        photoUrl: photoUrl || photoPreview,
        reporterName: reporterName.trim(),
        reporterPhone: reporterPhone.trim(),
      });

      setSubmitSuccessCode(res.reportCode);
      showToast({
        type: 'incident',
        title: `Tiếp nhận phản ánh ${res.reportCode}`,
        message: `Phản ánh "${title.trim()}" đã được ghi nhận vào hệ thống Khu phố 02 để xác minh xử lý.`,
        duration: 7000,
        actionLabel: 'Xem danh sách',
        onAction: () => setActiveTab('list'),
      });
      // Reset form
      setTitle('');
      setDescription('');
      setLocationAddress('');
      setPhotoUrl('');
      setPhotoPreview('');
      setCoordinates(undefined);
      setGpsMessage(null);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi gửi phản ánh sự cố');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredIncidents = useMemo(() => {
    return incidents.filter((item) => {
      const q = (listSearchTerm || quickLookupQuery).trim().toLowerCase();
      const matchSearch =
        !q ||
        item.reportCode.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.locationAddress.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q);
      const matchStatus = listStatusFilter === 'all' || item.status === listStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [incidents, listSearchTerm, quickLookupQuery, listStatusFilter]);

  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    received: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
    in_progress: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
    resolved: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
    rejected: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
  };

  return (
    <section id="incidents-section" className="py-7 sm:py-9 bg-white border-b border-slate-200">
      <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 pb-2.5 border-b border-slate-200 gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-100/90 text-red-900 border border-red-200 text-[10.5px] font-bold mb-1">
              <AlertTriangle className="w-3 h-3 text-red-700" />
              <span>TIẾP NHẬN PHẢN ÁNH – KIẾN NGHỊ HIỆN TRƯỜNG</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>PHẢN ÁNH SỰ CỐ DÂN CƯ</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                Xử lý 24/7
              </span>
            </h2>
            <p className="mt-0.5 text-xs text-slate-600 max-w-3xl leading-relaxed">
              Người dân chụp ảnh, định vị GPS gửi sự cố hạ tầng đô thị, an ninh trật tự, vệ sinh môi trường để Ban Điều hành xử lý kịp thời.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-xl shrink-0 border border-slate-200">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'create'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Gửi phản ánh mới
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'list'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Tiến độ xử lý</span>
              {incidents.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black">
                  {incidents.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab 1: Form Gửi Phản Ánh - 2-Column Balanced Command Layout */}
        {activeTab === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column (7 cols): The Form */}
            <div className="lg:col-span-7">
              {submitSuccessCode ? (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center shadow-xs">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1.5">Đã tiếp nhận phản ánh hiện trường!</h3>
                  <div className="inline-block px-3.5 py-1 rounded-lg bg-blue-100 text-blue-900 font-mono font-bold text-xs mb-3">
                    Mã phản ánh: {submitSuccessCode}
                  </div>
                  <p className="text-xs text-slate-600 max-w-md mx-auto mb-4 leading-relaxed">
                    Thông tin và hình ảnh đã được chuyển đến Ban Điều hành Khu phố 02 để xác minh và phối hợp các đơn vị xử lý.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2.5">
                    <button
                      onClick={() => {
                        setSubmitSuccessCode(null);
                        setActiveTab('list');
                      }}
                      className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
                    >
                      Xem danh sách phản ánh
                    </button>
                    <button
                      onClick={() => setSubmitSuccessCode(null)}
                      className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Gửi phản ánh khác
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
                  {error && (
                    <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-200">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Lĩnh vực / Danh mục sự cố <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {CATEGORIES.map((c) => {
                        const Icon = c.icon;
                        const isSelected = category === c.value;
                        return (
                          <button
                            type="button"
                            key={c.value}
                            onClick={() => setCategory(c.value)}
                            className={`p-2 rounded-xl border text-left flex items-center gap-2 text-xs transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-blue-50 border-blue-500 text-blue-900 font-bold shadow-2xs'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                            <span className="line-clamp-1">{c.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Tiêu đề phản ánh ngắn gọn <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Hố ga mất nắp hẻm 465 Trần Xuân Soạn"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Nội dung chi tiết sự cố <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Mô tả mức độ nguy hiểm, thời gian phát hiện, vị trí cụ thể..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white resize-y shadow-2xs"
                    />
                  </div>

                  {/* Địa điểm & GPS */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Địa điểm xảy ra sự cố <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        required
                        placeholder="Số nhà, tên hẻm, cột mốc nhận diện..."
                        value={locationAddress}
                        onChange={(e) => setLocationAddress(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={handleGetGpsLocation}
                        disabled={gpsLoading}
                        className="px-3 py-1.5 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0 disabled:opacity-50 cursor-pointer shadow-2xs"
                        title="Bấm để lấy tọa độ GPS tự động"
                      >
                        <Navigation className={`w-3.5 h-3.5 text-blue-700 ${gpsLoading ? 'animate-spin' : ''}`} />
                        <span>{gpsLoading ? 'Đang dò GPS...' : 'Lấy GPS'}</span>
                      </button>
                    </div>
                    {gpsMessage && (
                      <p className="text-[11px] text-blue-700 mt-1 font-medium">{gpsMessage}</p>
                    )}
                  </div>

                  {/* Hình ảnh hiện trường */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Hình ảnh hiện trường (Tùy chọn)
                    </label>
                    <div className="flex items-center gap-2.5">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-2xs">
                        <Camera className="w-3.5 h-3.5 text-blue-600" />
                        <span>{uploadingPhoto ? 'Đang xử lý ảnh...' : 'Tải lên / chụp ảnh'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handlePhotoUpload}
                          className="hidden"
                          disabled={uploadingPhoto}
                        />
                      </label>
                      {photoPreview && (
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-300 bg-slate-100 shrink-0">
                          <img src={photoPreview} alt="Xem trước" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              setPhotoPreview('');
                              setPhotoUrl('');
                            }}
                            className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px]"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Thông tin người gửi */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-200">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Họ và tên người phản ánh <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Nguyễn Văn A"
                        value={reporterName}
                        onChange={(e) => setReporterName(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Số điện thoại liên hệ <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="0912 345 678"
                        value={reporterPhone}
                        onChange={(e) => setReporterPhone(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white shadow-2xs"
                      />
                    </div>
                  </div>

                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-all shadow-md disabled:bg-blue-400 cursor-pointer active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{submitting ? 'Đang gửi phản ánh...' : 'Gửi phản ánh đến Ban Điều hành'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Right Column (5 cols): Quick Tracker & Resolution Protocol */}
            <div className="lg:col-span-5 space-y-3">
              {/* Quick Tracker Tool */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 shadow-xs">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-blue-700" />
                  <span>Tra cứu tiến độ phản ánh của bạn</span>
                </h3>
                <p className="text-xs text-slate-500 mb-2.5 leading-relaxed">
                  Nhập mã phản ánh (ví dụ: <strong className="text-slate-700 font-mono">KP2-2026-0001</strong>) hoặc số điện thoại để tra cứu kết quả xử lý.
                </p>

                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Mã phản ánh hoặc SĐT..."
                    value={quickLookupQuery}
                    onChange={(e) => setQuickLookupQuery(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white shadow-2xs"
                  />
                  <button
                    onClick={() => {
                      setListSearchTerm(quickLookupQuery);
                      setActiveTab('list');
                    }}
                    className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl transition-colors shrink-0 cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Search className="w-3 h-3" />
                    <span>Tra cứu</span>
                  </button>
                </div>
              </div>

              {/* 3-Step Resolution Protocol */}
              <div className="bg-gradient-to-br from-[#0c234a] to-[#081732] text-white rounded-2xl p-4 border border-blue-400/30 shadow-lg space-y-2.5">
                <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Quy trình xử lý phản ánh hiện trường</span>
                </div>

                <div className="space-y-2 text-xs text-slate-300 pt-0.5">
                  <div className="flex items-start gap-2">
                    <span className="w-4.5 h-4.5 rounded-full bg-blue-500/20 text-cyan-300 border border-cyan-400/30 flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <strong className="text-white block font-semibold text-[11.5px]">Tiếp nhận trong vòng 2 giờ</strong>
                      <span className="text-slate-400 text-[11px]">Phân loại và thông báo cán bộ phụ trách địa bàn.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="w-4.5 h-4.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <strong className="text-white block font-semibold text-[11.5px]">Xác minh hiện trường &amp; Phối hợp</strong>
                      <span className="text-slate-400 text-[11px]">Phối hợp Công an, Trạm Y tế, Đô thị kiểm tra thực tế.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="w-4.5 h-4.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      <strong className="text-white block font-semibold text-[11.5px]">Công khai kết quả giải quyết</strong>
                      <span className="text-slate-400 text-[11px]">Cập nhật kết quả và thông báo công khai trên hệ thống.</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10.5px] text-slate-400">Đã tiếp nhận: <strong className="text-white">{incidents.length} phản ánh</strong></span>
                  <button
                    onClick={() => setActiveTab('list')}
                    className="text-xs text-cyan-300 hover:text-white font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>Xem danh sách đầy đủ</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Danh Sách Phản Ánh Tiến Độ - Full Width */}
        {activeTab === 'list' && (
          <div className="space-y-4">
            {/* Search & Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo mã phản ánh, địa chỉ, tiêu đề..."
                  value={listSearchTerm}
                  onChange={(e) => setListSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white text-xs text-slate-800 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {[
                  { id: 'all', label: 'Tất cả' },
                  { id: 'received', label: 'Chờ tiếp nhận' },
                  { id: 'in_progress', label: 'Đang xử lý' },
                  { id: 'resolved', label: 'Đã hoàn thành' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setListStatusFilter(s.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      listStatusFilter === s.id
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Incidents Cards */}
            {filteredIncidents.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
                <CheckCircle2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-700">Không tìm thấy phản ánh nào phù hợp</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                  Thử tìm kiếm với từ khóa khác hoặc gửi phản ánh mới nếu bạn phát hiện sự cố dân sinh.
                </p>
                <button
                  onClick={() => {
                    setListSearchTerm('');
                    setListStatusFilter('all');
                  }}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Đặt lại bộ lọc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredIncidents.map((item) => {
                  const color = statusColors[item.status] || statusColors.received;

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-4 justify-between"
                    >
                      {item.photoUrl && (
                        <div className="w-full sm:w-36 h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                          <img src={item.photoUrl} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {item.reportCode}
                          </span>
                          <span className="text-xs px-2.5 py-0.5 rounded bg-blue-50 text-blue-800 font-medium">
                            {item.categoryLabel}
                          </span>
                          <span className={`text-xs px-2.5 py-0.5 rounded font-bold border ${color.bg} ${color.text} ${color.border}`}>
                            {item.statusLabel}
                          </span>
                          <span className="text-xs text-slate-400 ml-auto">
                            {formatVietnameseDate(item.createdAt)}
                          </span>
                        </div>

                        <h4 className="text-sm sm:text-base font-bold text-slate-900 mb-1 leading-snug">{item.title}</h4>
                        <p className="text-xs text-slate-600 mb-2 leading-relaxed line-clamp-2">{item.description}</p>

                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                          <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                          <span className="truncate">{item.locationAddress}</span>
                        </div>

                        {item.adminResponse && (
                          <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs">
                            <div className="font-bold text-emerald-900 flex items-center gap-1 mb-0.5">
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Ban Điều hành phản hồi giải quyết:</span>
                            </div>
                            <p className="text-emerald-800 text-[11.5px]">{item.adminResponse}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
