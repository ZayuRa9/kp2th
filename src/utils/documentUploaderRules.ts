/**
 * Pure helper and validation functions for DocumentUploader
 * Supports MP4, DOCX, PPTX, and PDF utility resources
 */

export type SupportedResourceFormat = 'mp4' | 'docx' | 'pptx' | 'pdf';

export interface FileValidationResult {
  valid: boolean;
  format: SupportedResourceFormat | null;
  error?: string;
  formattedSize: string;
}

export interface FormatMeta {
  format: SupportedResourceFormat;
  label: string;
  shortLabel: string;
  badgeText: string;
  badgeClass: string;
  accept: string;
  extensions: string[];
  description: string;
  mimePatterns: string[];
}

export const SUPPORTED_FORMAT_CONFIGS: Record<SupportedResourceFormat, FormatMeta> = {
  mp4: {
    format: 'mp4',
    label: 'Video hướng dẫn (MP4)',
    shortLabel: 'Video MP4',
    badgeText: 'MP4 VIDEO',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
    accept: 'video/mp4,.mp4',
    extensions: ['.mp4'],
    description: 'Video clip hướng dẫn các bước thao tác thực tế trên điện thoại hoặc máy tính',
    mimePatterns: ['video/mp4'],
  },
  docx: {
    format: 'docx',
    label: 'Tài liệu Word (DOCX / DOC)',
    shortLabel: 'Word DOCX',
    badgeText: 'WORD DOCX',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
    accept: '.docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword',
    extensions: ['.docx', '.doc'],
    description: 'Văn bản hướng dẫn chi tiết, biểu mẫu kê khai thông tin chuẩn hành chính',
    mimePatterns: [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ],
  },
  pptx: {
    format: 'pptx',
    label: 'Slide trình chiếu (PPTX / PPT)',
    shortLabel: 'PowerPoint PPTX',
    badgeText: 'POWERPOINT PPTX',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    accept: '.pptx,.ppt,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-powerpoint',
    extensions: ['.pptx', '.ppt'],
    description: 'Slide trình chiếu tập huấn, infographic và tóm tắt quy trình số hóa',
    mimePatterns: [
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-powerpoint',
    ],
  },
  pdf: {
    format: 'pdf',
    label: 'Sổ tay tra cứu (PDF)',
    shortLabel: 'Tài liệu PDF',
    badgeText: 'TÀI LIỆU PDF',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    accept: '.pdf,application/pdf',
    extensions: ['.pdf'],
    description: 'Sổ tay cẩm nang số, văn bản quy định và tài liệu hướng dẫn lưu trữ',
    mimePatterns: ['application/pdf'],
  },
};

/**
 * Detects format based on file name extension and optional mime type
 */
export function detectResourceFormat(
  fileName: string,
  mimeType?: string
): SupportedResourceFormat | null {
  if (!fileName) return null;
  const lowerName = fileName.toLowerCase().trim();
  const lowerMime = (mimeType || '').toLowerCase().trim();

  // 1. Check by extension
  if (lowerName.endsWith('.mp4')) return 'mp4';
  if (lowerName.endsWith('.docx') || lowerName.endsWith('.doc')) return 'docx';
  if (lowerName.endsWith('.pptx') || lowerName.endsWith('.ppt')) return 'pptx';
  if (lowerName.endsWith('.pdf')) return 'pdf';

  // 2. Check by MIME type
  if (lowerMime === 'video/mp4') return 'mp4';
  if (
    lowerMime.includes('wordprocessingml') ||
    lowerMime === 'application/msword'
  ) {
    return 'docx';
  }
  if (
    lowerMime.includes('presentationml') ||
    lowerMime.includes('powerpoint')
  ) {
    return 'pptx';
  }
  if (lowerMime === 'application/pdf') return 'pdf';

  return null;
}

/**
 * Formats byte size into human readable string (KB, MB)
 */
export function formatByteSize(bytes: number | undefined | null): string {
  if (bytes === undefined || bytes === null || isNaN(bytes) || bytes <= 0) {
    return '0 KB';
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

/**
 * Validates file upload for utility resources
 * Max recommended size: 80MB (for base64/localStorage resilience)
 */
export const MAX_FILE_SIZE_BYTES = 80 * 1024 * 1024; // 80 MB

export function validateResourceFile(
  file: { name: string; size: number; type?: string }
): FileValidationResult {
  const formattedSize = formatByteSize(file.size);
  const format = detectResourceFormat(file.name, file.type);

  if (!format) {
    return {
      valid: false,
      format: null,
      error: `Định dạng tệp "${file.name}" không hợp lệ. Vui lòng chọn tệp MP4, DOCX, PPTX hoặc PDF.`,
      formattedSize,
    };
  }

  if (file.size <= 0) {
    return {
      valid: false,
      format,
      error: `Tệp "${file.name}" rỗng (dung lượng 0 byte).`,
      formattedSize,
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      format,
      error: `Dung lượng tệp (${formattedSize}) vượt quá giới hạn tối đa 80MB cho phép.`,
      formattedSize,
    };
  }

  return {
    valid: true,
    format,
    formattedSize,
  };
}

/**
 * Normalizes online video URLs (YouTube watch, embed, youtu.be, or direct MP4 link)
 */
export function normalizeVideoEmbedUrl(url: string | undefined | null): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  try {
    if (trimmed.includes('youtube.com/watch?v=')) {
      const videoId = trimmed.split('v=')[1]?.split('&')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : trimmed;
    }
    if (trimmed.includes('youtu.be/')) {
      const videoId = trimmed.split('youtu.be/')[1]?.split('?')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : trimmed;
    }
    return trimmed;
  } catch {
    return trimmed;
  }
}
