import React, { useState, useRef } from 'react';
import {
  Upload,
  FileVideo,
  FileText,
  Presentation,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Download,
  ExternalLink,
  Play,
  X,
  RefreshCw,
  FolderOpen,
  Sparkles,
  Link as LinkIcon,
  HelpCircle,
  Eye,
} from 'lucide-react';
import {
  SupportedResourceFormat,
  SUPPORTED_FORMAT_CONFIGS,
  validateResourceFile,
  normalizeVideoEmbedUrl,
} from '../utils/documentUploaderRules';
import { uploadFileApi } from '../services/api';
import { DigitalUtility } from '../types';

export interface UtilityResourceForm {
  videoGuideUrl?: string;
  videoGuideName?: string;
  wordGuideUrl?: string;
  wordGuideName?: string;
  pptGuideUrl?: string;
  pptGuideName?: string;
  pdfGuideUrl?: string;
  pdfGuideName?: string;
}

export interface DocumentUploaderProps {
  /** The current utility resources being edited/managed */
  resources: UtilityResourceForm;
  /** Callback fired whenever any resource (file, name, url) is updated or removed */
  onChange: (updated: UtilityResourceForm) => void;
  /** Name of the utility (e.g. "VNeID", "Dịch vụ công Quốc gia") */
  utilityName?: string;
  /** Notification feedback handler */
  onNotify?: (message: string, isError?: boolean) => void;
  /** Optional: list of all utilities to allow direct selection and resource management */
  digitalUtilities?: DigitalUtility[];
  /** Optional: callback to save resources directly for a chosen utility */
  onSaveDirectly?: (utilityId: string, updated: UtilityResourceForm) => Promise<void>;
  /** Optional styling class */
  className?: string;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  resources,
  onChange,
  utilityName = 'Tiện ích số',
  onNotify,
  digitalUtilities,
  onSaveDirectly,
  className = '',
}) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [activeUploadFormat, setActiveUploadFormat] = useState<SupportedResourceFormat | 'auto' | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [editingSlotName, setEditingSlotName] = useState<SupportedResourceFormat | null>(null);
  const [tempSlotName, setTempSlotName] = useState('');

  // Standalone utility selector inside the Administrative Modal
  const [selectedUtilityId, setSelectedUtilityId] = useState<string>('');
  const [isSavingDirectly, setIsSavingDirectly] = useState(false);

  // Hidden file inputs for specific slots
  const autoInputRef = useRef<HTMLInputElement>(null);
  const mp4InputRef = useRef<HTMLInputElement>(null);
  const docxInputRef = useRef<HTMLInputElement>(null);
  const pptxInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const notify = (msg: string, isError = false) => {
    if (onNotify) {
      onNotify(msg, isError);
    }
  };

  // Process a selected or dropped file
  const handleProcessFile = async (
    file: File,
    forcedFormat?: SupportedResourceFormat
  ) => {
    const validation = validateResourceFile({
      name: file.name,
      size: file.size,
      type: file.type,
    });

    if (!validation.valid || !validation.format) {
      notify(validation.error || 'Tệp không đúng định dạng cho phép', true);
      return;
    }

    const targetFormat = forcedFormat || validation.format;
    setActiveUploadFormat(targetFormat);
    setUploadProgress(`Đang xử lý ${file.name} (${validation.formattedSize})...`);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          const res = await uploadFileApi(file.name, base64);

          const updated: UtilityResourceForm = { ...resources };

          if (targetFormat === 'mp4') {
            updated.videoGuideUrl = res.fileUrl;
            updated.videoGuideName = file.name;
          } else if (targetFormat === 'docx') {
            updated.wordGuideUrl = res.fileUrl;
            updated.wordGuideName = file.name;
          } else if (targetFormat === 'pptx') {
            updated.pptGuideUrl = res.fileUrl;
            updated.pptGuideName = file.name;
          } else if (targetFormat === 'pdf') {
            updated.pdfGuideUrl = res.fileUrl;
            updated.pdfGuideName = file.name;
          }

          onChange(updated);
          notify(
            `Đã tải lên thành công tệp ${SUPPORTED_FORMAT_CONFIGS[targetFormat].shortLabel}: ${file.name} (${validation.formattedSize})`
          );
        } catch (err: any) {
          notify(`Lỗi tải lên: ${err.message || 'Không thể lưu tệp'}`, true);
        } finally {
          setActiveUploadFormat(null);
          setUploadProgress(null);
        }
      };

      reader.onerror = () => {
        notify('Lỗi đọc tệp từ thiết bị', true);
        setActiveUploadFormat(null);
        setUploadProgress(null);
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      notify(`Lỗi: ${err.message}`, true);
      setActiveUploadFormat(null);
      setUploadProgress(null);
    }
  };

  // Drag and drop event handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    // Process all dropped files sequentially
    for (let i = 0; i < files.length; i++) {
      await handleProcessFile(files[i]);
    }
  };

  // Remove a resource slot
  const handleRemoveSlot = (format: SupportedResourceFormat) => {
    const updated: UtilityResourceForm = { ...resources };
    if (format === 'mp4') {
      updated.videoGuideUrl = '';
      updated.videoGuideName = '';
    } else if (format === 'docx') {
      updated.wordGuideUrl = '';
      updated.wordGuideName = '';
    } else if (format === 'pptx') {
      updated.pptGuideUrl = '';
      updated.pptGuideName = '';
    } else if (format === 'pdf') {
      updated.pdfGuideUrl = '';
      updated.pdfGuideName = '';
    }
    onChange(updated);
    notify(`Đã gỡ bỏ tài nguyên ${SUPPORTED_FORMAT_CONFIGS[format].shortLabel}`);
  };

  // Start renaming a slot label
  const handleStartRename = (format: SupportedResourceFormat, currentName: string) => {
    setEditingSlotName(format);
    setTempSlotName(currentName);
  };

  // Save renamed slot label
  const handleSaveRename = (format: SupportedResourceFormat) => {
    const updated: UtilityResourceForm = { ...resources };
    const cleanName = tempSlotName.trim();
    if (format === 'mp4') updated.videoGuideName = cleanName;
    if (format === 'docx') updated.wordGuideName = cleanName;
    if (format === 'pptx') updated.pptGuideName = cleanName;
    if (format === 'pdf') updated.pdfGuideName = cleanName;

    onChange(updated);
    setEditingSlotName(null);
    notify('Đã cập nhật tên tài liệu');
  };

  // Handle direct utility selection (Standalone mode)
  const handleSelectUtilityToManage = (utilId: string) => {
    setSelectedUtilityId(utilId);
    if (!digitalUtilities) return;
    const target = digitalUtilities.find((u) => u.id === utilId);
    if (target) {
      onChange({
        videoGuideUrl: target.videoGuideUrl || '',
        videoGuideName: target.videoGuideName || '',
        wordGuideUrl: target.wordGuideUrl || '',
        wordGuideName: target.wordGuideName || '',
        pptGuideUrl: target.pptGuideUrl || '',
        pptGuideName: target.pptGuideName || '',
        pdfGuideUrl: target.pdfGuideUrl || '',
        pdfGuideName: target.pdfGuideName || '',
      });
      notify(`Đang tải tài nguyên hướng dẫn của tiện ích "${target.name}"`);
    }
  };

  // Save changes directly to selected utility
  const handleSaveToSelectedUtility = async () => {
    if (!selectedUtilityId || !onSaveDirectly) return;
    setIsSavingDirectly(true);
    try {
      await onSaveDirectly(selectedUtilityId, resources);
      notify('Đã lưu thành công bộ tài nguyên hướng dẫn vào tiện ích!');
    } catch (err: any) {
      notify(`Lỗi khi lưu tài nguyên: ${err.message}`, true);
    } finally {
      setIsSavingDirectly(false);
    }
  };

  // Count active uploaded resources
  const activeCount = [
    Boolean(resources.videoGuideUrl),
    Boolean(resources.wordGuideUrl),
    Boolean(resources.pptGuideUrl),
    Boolean(resources.pdfGuideUrl),
  ].filter(Boolean).length;

  return (
    <div
      className={`rounded-2xl border border-indigo-200 bg-gradient-to-b from-indigo-50/60 via-white to-slate-50/70 p-4 sm:p-5 shadow-xs space-y-5 ${className}`}
    >
      {/* 1. Header with Title, Utility Name, and Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-2xs">
              <FolderOpen className="w-4 h-4" />
            </span>
            <h4 className="text-sm font-extrabold uppercase tracking-tight text-slate-900">
              QUẢN LÝ TÀI NGUYÊN HƯỚNG DẪN TIỆN ÍCH DÂN CƯ (DOCUMENT UPLOADER)
            </h4>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Hỗ trợ 4 định dạng chính thức: <strong className="text-rose-700 font-bold">MP4</strong> (Video hướng dẫn),{' '}
            <strong className="text-blue-700 font-bold">DOCX</strong> (Văn bản / Biểu mẫu),{' '}
            <strong className="text-amber-700 font-bold">PPTX</strong> (Slide trình chiếu), và{' '}
            <strong className="text-emerald-700 font-bold">PDF</strong> (Sổ tay tra cứu).
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-900 border border-indigo-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-700" />
            <span>Đã nạp: <strong>{activeCount}/4</strong> định dạng</span>
          </span>
        </div>
      </div>

      {/* 1b. Standalone Selector: If digitalUtilities prop is passed, allow quick switching */}
      {digitalUtilities && digitalUtilities.length > 0 && (
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                Chọn tiện ích số cần quản lý tài nguyên:
              </span>
              <span className="text-[11px] text-slate-500">
                Chuyển nhanh giữa các ứng dụng VNeID, DVC Quốc gia, EVNHCMC, Sawaco, Help 114...
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedUtilityId}
              onChange={(e) => handleSelectUtilityToManage(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="">-- Chọn tiện ích số để tải tài nguyên --</option>
              {digitalUtilities.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.badge || u.categoryName})
                </option>
              ))}
            </select>

            {onSaveDirectly && selectedUtilityId && (
              <button
                type="button"
                onClick={handleSaveToSelectedUtility}
                disabled={isSavingDirectly}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:bg-slate-300"
              >
                {isSavingDirectly ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>Lưu tài nguyên tiện ích này</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. Unified Drag-and-Drop Ingest Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
          isDraggingOver
            ? 'border-indigo-600 bg-indigo-100/70 scale-[1.01] shadow-md'
            : 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-indigo-50/20'
        }`}
      >
        <input
          ref={autoInputRef}
          type="file"
          multiple
          accept=".mp4,video/mp4,.docx,.doc,.pptx,.ppt,.pdf,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-powerpoint"
          className="hidden"
          onChange={async (e) => {
            const files = e.target.files;
            if (!files || files.length === 0) return;
            for (let i = 0; i < files.length; i++) {
              await handleProcessFile(files[i]);
            }
            e.target.value = '';
          }}
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-xs">
            {activeUploadFormat ? (
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
            ) : (
              <Upload className="w-6 h-6" />
            )}
          </div>

          <div>
            <div className="text-sm font-extrabold text-slate-800">
              {uploadProgress || 'Kéo và thả tệp hướng dẫn vào đây, hoặc bấm để chọn tệp'}
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Hệ thống sẽ <strong>tự động nhận diện định dạng</strong> (MP4, DOCX, PPTX, PDF) và gắn ngay vào vị trí tài nguyên tương ứng của <strong>{utilityName}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-center pt-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200">
              MP4 VIDEO
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-200">
              WORD DOCX
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">
              POWERPOINT PPTX
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
              TÀI LIỆU PDF
            </span>
          </div>

          <button
            type="button"
            onClick={() => autoInputRef.current?.click()}
            disabled={Boolean(activeUploadFormat)}
            className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold shadow-xs cursor-pointer transition-all disabled:bg-slate-300"
          >
            <FolderOpen className="w-4 h-4" />
            <span>Chọn tệp từ máy tính</span>
          </button>
        </div>
      </div>

      {/* 3. Four Dedicated Resource Slots (MP4, DOCX, PPTX, PDF) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* SLOT 1: MP4 VIDEO HƯỚNG DẪN */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
                  <FileVideo className="w-4 h-4" />
                </span>
                <div>
                  <h5 className="text-xs font-extrabold text-slate-900">
                    1. Video clip hướng dẫn
                  </h5>
                  <span className="text-[10px] text-slate-500">Định dạng chuẩn MP4 hoặc link YouTube</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200">
                MP4
              </span>
            </div>

            {/* Hidden Input for MP4 */}
            <input
              ref={mp4InputRef}
              type="file"
              accept="video/mp4,.mp4"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleProcessFile(f, 'mp4');
                e.target.value = '';
              }}
            />

            {/* Current Resource Details */}
            {resources.videoGuideUrl ? (
              <div className="mt-3 p-3 rounded-xl bg-rose-50/70 border border-rose-200 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {editingSlotName === 'mp4' ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={tempSlotName}
                          onChange={(e) => setTempSlotName(e.target.value)}
                          className="w-full text-xs px-2 py-1 bg-white border border-rose-300 rounded focus:outline-none"
                          placeholder="Nhập tên video..."
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveRename('mp4')}
                          className="px-2 py-1 rounded bg-rose-600 text-white text-[10px] font-bold"
                        >
                          Lưu
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() =>
                          handleStartRename('mp4', resources.videoGuideName || 'Video hướng dẫn sử dụng')
                        }
                        className="text-xs font-bold text-rose-950 truncate cursor-pointer hover:underline flex items-center gap-1.5"
                        title="Bấm để sửa tên hiển thị"
                      >
                        <Play className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span className="truncate">
                          {resources.videoGuideName || 'Video hướng dẫn sử dụng'}
                        </span>
                      </div>
                    )}
                    <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                      Nguồn: {resources.videoGuideUrl.startsWith('data:') ? 'Tệp MP4 tải từ máy' : resources.videoGuideUrl}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setPreviewVideoUrl(resources.videoGuideUrl || null)}
                      className="p-1.5 rounded-lg bg-white border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                      title="Xem thử video"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="text-[11px] hidden sm:inline">Xem thử</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveSlot('mp4')}
                      className="p-1.5 rounded-lg bg-white border border-rose-200 text-rose-600 hover:bg-rose-200 hover:text-rose-900 cursor-pointer shadow-2xs"
                      title="Xóa video"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-xs text-slate-500 italic block">
                  Chưa đính kèm video hướng dẫn
                </span>
              </div>
            )}

            {/* Input URL for online video (YouTube / external CDN) */}
            <div className="mt-2.5">
              <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1 mb-1">
                <LinkIcon className="w-3 h-3 text-slate-500" />
                <span>Hoặc dán link video (YouTube / URL trực tuyến):</span>
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=... hoặc link MP4"
                  value={resources.videoGuideUrl && !resources.videoGuideUrl.startsWith('data:') ? resources.videoGuideUrl : ''}
                  onChange={(e) => {
                    const newUrl = e.target.value.trim();
                    onChange({
                      ...resources,
                      videoGuideUrl: newUrl,
                      videoGuideName: resources.videoGuideName || 'Video hướng dẫn trực tuyến',
                    });
                  }}
                  className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-400"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => mp4InputRef.current?.click()}
              disabled={activeUploadFormat === 'mp4'}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold cursor-pointer transition-colors shadow-2xs disabled:bg-slate-300"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{activeUploadFormat === 'mp4' ? 'Đang tải MP4...' : 'Tải lên tệp MP4'}</span>
            </button>
            <span className="text-[10px] text-slate-400">Tối đa 80MB</span>
          </div>
        </div>

        {/* SLOT 2: DOCX TÀI LIỆU WORD */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                  <FileText className="w-4 h-4" />
                </span>
                <div>
                  <h5 className="text-xs font-extrabold text-slate-900">
                    2. File Word (Hướng dẫn / Biểu mẫu)
                  </h5>
                  <span className="text-[10px] text-slate-500">Định dạng chuẩn DOCX hoặc DOC</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-200">
                DOCX
              </span>
            </div>

            {/* Hidden Input for DOCX */}
            <input
              ref={docxInputRef}
              type="file"
              accept=".docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleProcessFile(f, 'docx');
                e.target.value = '';
              }}
            />

            {/* Current Resource Details */}
            {resources.wordGuideUrl ? (
              <div className="mt-3 p-3 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {editingSlotName === 'docx' ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={tempSlotName}
                          onChange={(e) => setTempSlotName(e.target.value)}
                          className="w-full text-xs px-2 py-1 bg-white border border-blue-300 rounded focus:outline-none"
                          placeholder="Nhập tên tệp Word..."
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveRename('docx')}
                          className="px-2 py-1 rounded bg-blue-600 text-white text-[10px] font-bold"
                        >
                          Lưu
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() =>
                          handleStartRename('docx', resources.wordGuideName || 'Tài liệu hướng dẫn Word')
                        }
                        className="text-xs font-bold text-blue-950 truncate cursor-pointer hover:underline flex items-center gap-1.5"
                        title="Bấm để sửa tên hiển thị"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="truncate">
                          {resources.wordGuideName || 'Tài liệu hướng dẫn Word'}
                        </span>
                      </div>
                    )}
                    <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                      Trạng thái: Đã đính kèm tệp sẵn sàng cho dân cư tải về
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <a
                      href={resources.wordGuideUrl}
                      download={resources.wordGuideName || 'huong_dan_tien_ich.docx'}
                      className="p-1.5 rounded-lg bg-white border border-blue-200 text-blue-700 hover:bg-blue-100 text-xs font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                      title="Tải thử tệp Word"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="text-[11px] hidden sm:inline">Tải về</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleRemoveSlot('docx')}
                      className="p-1.5 rounded-lg bg-white border border-blue-200 text-rose-600 hover:bg-rose-200 hover:text-rose-900 cursor-pointer shadow-2xs"
                      title="Xóa tệp Word"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-xs text-slate-500 italic block">
                  Chưa đính kèm tệp văn bản Word
                </span>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => docxInputRef.current?.click()}
              disabled={activeUploadFormat === 'docx'}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold cursor-pointer transition-colors shadow-2xs disabled:bg-slate-300"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{activeUploadFormat === 'docx' ? 'Đang tải Word...' : 'Tải lên tệp Word (DOCX)'}</span>
            </button>
            <span className="text-[10px] text-slate-400">DOCX, DOC</span>
          </div>
        </div>

        {/* SLOT 3: PPTX SLIDE TRÌNH CHIẾU */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
                  <Presentation className="w-4 h-4" />
                </span>
                <div>
                  <h5 className="text-xs font-extrabold text-slate-900">
                    3. Slide trình chiếu (PowerPoint)
                  </h5>
                  <span className="text-[10px] text-slate-500">Định dạng chuẩn PPTX hoặc PPT</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                PPTX
              </span>
            </div>

            {/* Hidden Input for PPTX */}
            <input
              ref={pptxInputRef}
              type="file"
              accept=".pptx,.ppt,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-powerpoint"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleProcessFile(f, 'pptx');
                e.target.value = '';
              }}
            />

            {/* Current Resource Details */}
            {resources.pptGuideUrl ? (
              <div className="mt-3 p-3 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {editingSlotName === 'pptx' ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={tempSlotName}
                          onChange={(e) => setTempSlotName(e.target.value)}
                          className="w-full text-xs px-2 py-1 bg-white border border-amber-300 rounded focus:outline-none"
                          placeholder="Nhập tên slide PPT..."
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveRename('pptx')}
                          className="px-2 py-1 rounded bg-amber-600 text-white text-[10px] font-bold"
                        >
                          Lưu
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() =>
                          handleStartRename('pptx', resources.pptGuideName || 'Slide tập huấn PowerPoint')
                        }
                        className="text-xs font-bold text-amber-950 truncate cursor-pointer hover:underline flex items-center gap-1.5"
                        title="Bấm để sửa tên hiển thị"
                      >
                        <Presentation className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate">
                          {resources.pptGuideName || 'Slide tập huấn PowerPoint'}
                        </span>
                      </div>
                    )}
                    <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                      Trạng thái: Đã đính kèm slide tập huấn số cho khu phố
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <a
                      href={resources.pptGuideUrl}
                      download={resources.pptGuideName || 'slide_huong_dan.pptx'}
                      className="p-1.5 rounded-lg bg-white border border-amber-200 text-amber-700 hover:bg-amber-100 text-xs font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                      title="Tải thử slide PPT"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="text-[11px] hidden sm:inline">Tải về</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleRemoveSlot('pptx')}
                      className="p-1.5 rounded-lg bg-white border border-amber-200 text-rose-600 hover:bg-rose-200 hover:text-rose-900 cursor-pointer shadow-2xs"
                      title="Xóa tệp PPT"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-xs text-slate-500 italic block">
                  Chưa đính kèm slide PowerPoint
                </span>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => pptxInputRef.current?.click()}
              disabled={activeUploadFormat === 'pptx'}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-bold cursor-pointer transition-colors shadow-2xs disabled:bg-slate-300"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{activeUploadFormat === 'pptx' ? 'Đang tải PPT...' : 'Tải lên slide PPTX'}</span>
            </button>
            <span className="text-[10px] text-slate-400">PPTX, PPT</span>
          </div>
        </div>

        {/* SLOT 4: PDF SỔ TAY HƯỚNG DẪN */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                  <FileText className="w-4 h-4" />
                </span>
                <div>
                  <h5 className="text-xs font-extrabold text-slate-900">
                    4. Sổ tay / Cẩm nang (PDF)
                  </h5>
                  <span className="text-[10px] text-slate-500">Định dạng chuẩn Adobe PDF</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                PDF
              </span>
            </div>

            {/* Hidden Input for PDF */}
            <input
              ref={pdfInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleProcessFile(f, 'pdf');
                e.target.value = '';
              }}
            />

            {/* Current Resource Details */}
            {resources.pdfGuideUrl ? (
              <div className="mt-3 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {editingSlotName === 'pdf' ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={tempSlotName}
                          onChange={(e) => setTempSlotName(e.target.value)}
                          className="w-full text-xs px-2 py-1 bg-white border border-emerald-300 rounded focus:outline-none"
                          placeholder="Nhập tên tài liệu PDF..."
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveRename('pdf')}
                          className="px-2 py-1 rounded bg-emerald-600 text-white text-[10px] font-bold"
                        >
                          Lưu
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() =>
                          handleStartRename('pdf', resources.pdfGuideName || 'Sổ tay hướng dẫn PDF')
                        }
                        className="text-xs font-bold text-emerald-950 truncate cursor-pointer hover:underline flex items-center gap-1.5"
                        title="Bấm để sửa tên hiển thị"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">
                          {resources.pdfGuideName || 'Sổ tay hướng dẫn PDF'}
                        </span>
                      </div>
                    )}
                    <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                      Trạng thái: Người dân có thể đọc trực tuyến hoặc tải về
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <a
                      href={resources.pdfGuideUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                      title="Mở xem trước PDF trong tab mới"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="text-[11px] hidden sm:inline">Xem PDF</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleRemoveSlot('pdf')}
                      className="p-1.5 rounded-lg bg-white border border-emerald-200 text-rose-600 hover:bg-rose-200 hover:text-rose-900 cursor-pointer shadow-2xs"
                      title="Xóa tệp PDF"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-xs text-slate-500 italic block">
                  Chưa đính kèm cẩm nang số PDF
                </span>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => pdfInputRef.current?.click()}
              disabled={activeUploadFormat === 'pdf'}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold cursor-pointer transition-colors shadow-2xs disabled:bg-slate-300"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{activeUploadFormat === 'pdf' ? 'Đang tải PDF...' : 'Tải lên tệp PDF'}</span>
            </button>
            <span className="text-[10px] text-slate-400">PDF chuẩn</span>
          </div>
        </div>
      </div>

      {/* 4. Video Player Preview Modal */}
      {previewVideoUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 text-white rounded-2xl max-w-2xl w-full overflow-hidden border border-slate-700 shadow-2xl flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileVideo className="w-4 h-4 text-rose-500" />
                <h4 className="text-sm font-bold">Xem thử Video Hướng Dẫn: {resources.videoGuideName || utilityName}</h4>
              </div>
              <button
                type="button"
                onClick={() => setPreviewVideoUrl(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-black flex items-center justify-center min-h-[300px]">
              {previewVideoUrl.includes('youtube') || previewVideoUrl.includes('youtu.be') ? (
                <iframe
                  src={normalizeVideoEmbedUrl(previewVideoUrl)}
                  className="w-full aspect-video rounded-lg"
                  title="Video hướng dẫn"
                  allowFullScreen
                />
              ) : (
                <video
                  src={previewVideoUrl}
                  controls
                  autoPlay
                  className="w-full max-h-[60vh] rounded-lg"
                >
                  Trình duyệt không hỗ trợ phát trực tiếp video.
                </video>
              )}
            </div>

            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Định dạng tương thích với giao diện tra cứu của người dân</span>
              <button
                type="button"
                onClick={() => setPreviewVideoUrl(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold"
              >
                Đóng xem thử
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
