import crypto from 'crypto';

/**
 * Validates a web URL format (must be http, https or relative download path)
 */
export function isValidUrl(url: string | undefined | null, allowEmpty = true): boolean {
  if (!url || url.trim() === '') {
    return allowEmpty;
  }
  const trimmed = url.trim();
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) {
    return true;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Checks if a URL looks like a Google Forms registration link
 */
export function isGoogleFormsUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  const trimmed = url.trim().toLowerCase();
  return (
    trimmed.includes('docs.google.com/forms') ||
    trimmed.includes('forms.gle') ||
    trimmed.includes('forms.google.com')
  );
}

/**
 * Formats a number with Vietnamese thousands separator (dots)
 */
export function formatNumberVietnamese(num: number | undefined | null): string {
  if (num === undefined || num === null || isNaN(num)) return '0';
  return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Formats date into standard Vietnamese display
 */
export function formatVietnameseDate(input: string | number | Date | undefined | null): string {
  if (!input) return '';
  const d = new Date(input);
  if (isNaN(d.getTime())) return String(input);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Checks if a document has expired based on expiration date (YYYY-MM-DD)
 */
export function isDocumentExpired(expirationDateStr: string | undefined | null, now = new Date()): boolean {
  if (!expirationDateStr || expirationDateStr.trim() === '') {
    return false;
  }
  const exp = new Date(expirationDateStr);
  if (isNaN(exp.getTime())) return false;
  // End of the expiration day (23:59:59.999)
  exp.setHours(23, 59, 59, 999);
  return exp.getTime() < now.getTime();
}

/**
 * Validates Committee Member Input
 */
export function validateCommitteeMemberInput(data: {
  fullName?: string;
  position?: string;
  phoneNumber?: string;
  responsibility?: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!data.fullName || data.fullName.trim().length < 2) {
    errors.push('Họ và tên cán bộ không được để trống');
  }
  if (!data.position || data.position.trim().length < 2) {
    errors.push('Chức vụ không được để trống');
  }
  if (!data.phoneNumber || data.phoneNumber.trim().length < 8) {
    errors.push('Số điện thoại liên hệ không hợp lệ');
  }
  if (!data.responsibility || data.responsibility.trim().length < 2) {
    errors.push('Nhiệm vụ / Lĩnh vực phụ trách không được để trống');
  }
  return { valid: errors.length === 0, errors };
}

/**
 * Validates Official Document Input
 */
export function validateOfficialDocumentInput(data: {
  documentNumber?: string;
  title?: string;
  issuingAuthority?: string;
  expirationDate?: string;
  fileUrl?: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!data.documentNumber || data.documentNumber.trim().length < 2) {
    errors.push('Số hiệu văn bản không được để trống');
  }
  if (!data.title || data.title.trim().length < 5) {
    errors.push('Tiêu đề văn bản phải có ít nhất 5 ký tự');
  }
  if (!data.issuingAuthority || data.issuingAuthority.trim().length < 2) {
    errors.push('Đơn vị ban hành không được để trống');
  }
  if (!data.expirationDate || isNaN(new Date(data.expirationDate).getTime())) {
    errors.push('Ngày hết hạn văn bản không hợp lệ');
  }
  if (!data.fileUrl || data.fileUrl.trim().length < 3) {
    errors.push('Vui lòng tải lên tệp PDF của văn bản');
  }
  return { valid: errors.length === 0, errors };
}

/**
 * Validates Incident Report Input
 */
export function validateIncidentInput(data: {
  title?: string;
  description?: string;
  locationAddress?: string;
  reporterName?: string;
  reporterPhone?: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!data.title || data.title.trim().length < 4) {
    errors.push('Tiêu đề phản ánh phải có ít nhất 4 ký tự');
  }
  if (!data.description || data.description.trim().length < 10) {
    errors.push('Nội dung mô tả sự cố cần ít nhất 10 ký tự');
  }
  if (!data.locationAddress || data.locationAddress.trim().length < 5) {
    errors.push('Vui lòng nhập địa chỉ hoặc vị trí cụ thể của sự cố');
  }
  if (!data.reporterName || data.reporterName.trim().length < 2) {
    errors.push('Họ tên người phản ánh không được để trống');
  }
  if (!data.reporterPhone || data.reporterPhone.trim().length < 8) {
    errors.push('Số điện thoại liên hệ để xác minh không hợp lệ');
  }
  return { valid: errors.length === 0, errors };
}

/**
 * Validates Activity Form input
 */
export function validateActivityInput(data: {
  title?: string;
  time?: string;
  location?: string;
  summary?: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!data.title || data.title.trim().length < 5) {
    errors.push('Tên hoạt động phải có ít nhất 5 ký tự');
  }
  if (!data.time || data.time.trim().length < 3) {
    errors.push('Thời gian hoạt động không được để trống');
  }
  if (!data.location || data.location.trim().length < 3) {
    errors.push('Địa điểm tổ chức không được để trống');
  }
  if (!data.summary || data.summary.trim().length < 10) {
    errors.push('Tóm tắt nội dung hoạt động cần ít nhất 10 ký tự');
  }
  return { valid: errors.length === 0, errors };
}

/**
 * Validates Digital Utility Form input
 */
export function validateUtilityInput(data: {
  name?: string;
  category?: string;
  websiteUrl?: string;
  androidUrl?: string;
  iosUrl?: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!data.name || data.name.trim().length < 2) {
    errors.push('Tên tiện ích không được để trống');
  }
  if (!data.category || !['admin', 'welfare', 'security', 'living'].includes(data.category)) {
    errors.push('Danh mục tiện ích không hợp lệ');
  }
  if (data.websiteUrl && !isValidUrl(data.websiteUrl, true)) {
    errors.push('Đường dẫn Website không đúng định dạng HTTP/HTTPS');
  }
  if (data.androidUrl && !isValidUrl(data.androidUrl, true)) {
    errors.push('Đường dẫn Android (Google Play) không đúng định dạng');
  }
  if (data.iosUrl && !isValidUrl(data.iosUrl, true)) {
    errors.push('Đường dẫn iOS (App Store) không đúng định dạng');
  }
  return { valid: errors.length === 0, errors };
}

/**
 * Validates Demographics Input (must be non-negative numbers)
 */
export function validateDemographicsInput(data: {
  totalResidents?: number;
  totalHouseholds?: number;
  totalNeighborhoodGroups?: number;
  vneidLevel2Rate?: number;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (data.totalResidents === undefined || data.totalResidents < 0) {
    errors.push('Tổng số cư dân phải là số không âm');
  }
  if (data.totalHouseholds === undefined || data.totalHouseholds < 0) {
    errors.push('Tổng số hộ dân phải là số không âm');
  }
  if (data.vneidLevel2Rate !== undefined && (data.vneidLevel2Rate < 0 || data.vneidLevel2Rate > 100)) {
    errors.push('Tỷ lệ VNeID mức 2 phải từ 0% đến 100%');
  }
  return { valid: errors.length === 0, errors };
}

/**
 * Cryptographic PBKDF2 hash for admin password
 */
export function hashAdminPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

/**
 * Verifies rate limiting for failed login attempts
 */
export function checkLoginRateLimit(
  failedAttempts: number,
  lockedUntil: number,
  currentTimeMs: number = Date.now()
): { isLocked: boolean; remainingSeconds: number } {
  if (lockedUntil > currentTimeMs) {
    const remainingSeconds = Math.ceil((lockedUntil - currentTimeMs) / 1000);
    return { isLocked: true, remainingSeconds };
  }
  return { isLocked: false, remainingSeconds: 0 };
}

/**
 * Extracts dialable phone digits from any text for direct tel: links.
 * Works with full phone numbers, phone numbers followed by notes, emergency 3-digit codes.
 * Examples:
 * - "028 3775 1234" -> "02837751234"
 * - "028 3771 5678 (Công an Phường Tân Hưng)" -> "02837715678"
 * - "+84 903 123 456" -> "+84903123456"
 * - "0903.123.456" -> "0903123456"
 * - "114" -> "114"
 */
export function extractPhoneDigits(input: string | undefined | null): string {
  if (!input) return '';
  const trimmed = input.trim();
  // Emergency 3-digit numbers
  if (/^(113|114|115)$/.test(trimmed)) {
    return trimmed;
  }
  // Match sequence of digits/symbols that form the phone number
  const match = trimmed.match(/(\+?[0-9][0-9\s.\-()]{5,}[0-9])/);
  if (match) {
    return match[1].replace(/[^\d+]/g, '');
  }
  // Fallback: extract all digits/plus
  return trimmed.replace(/[^\d+]/g, '');
}

/**
 * Checks whether the current moment (or specified date) is within official receiving hours.
 * If receivingHoursString is provided, parses time intervals like "07:30 - 11:30 & 13:30 - 17:00".
 * Default schedule:
 * - Monday to Friday: 07:30 - 11:30 and 13:30 - 17:00
 * - Saturday: 07:30 - 11:30
 * - Sunday: Closed (outside receiving hours)
 */
export function isWithinReceivingHours(receivingHoursString?: string, now = new Date()): boolean {
  const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  // Sunday is non-working day
  if (day === 0) {
    return false;
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // If a custom string with time intervals exists, parse intervals
  if (receivingHoursString && receivingHoursString.trim()) {
    const timeMatches = [...receivingHoursString.matchAll(/(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/g)];
    if (timeMatches.length > 0) {
      for (const m of timeMatches) {
        const startMins = parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
        const endMins = parseInt(m[3], 10) * 60 + parseInt(m[4], 10);
        // On Saturday, only morning shift is active if Saturday is mentioned or default
        if (day === 6 && startMins >= 12 * 60) {
          continue;
        }
        if (currentMinutes >= startMins && currentMinutes <= endMins) {
          return true;
        }
      }
      return false;
    }
  }

  // Default Standard Khu Phố 02 Receiving Hours:
  // Morning: 07:30 (450m) to 11:30 (690m)
  const isMorningShift = currentMinutes >= 450 && currentMinutes <= 690;
  if (isMorningShift) {
    return true;
  }

  // Afternoon: 13:30 (810m) to 17:00 (1020m) (Mon - Fri only)
  if (day >= 1 && day <= 5) {
    const isAfternoonShift = currentMinutes >= 810 && currentMinutes <= 1020;
    if (isAfternoonShift) {
      return true;
    }
  }

  return false;
}

export interface MonthlyStatistics {
  monthYear: string;
  activities: {
    totalRegistrations: number;
    confirmedRegistrations: number;
    pendingRegistrations: number;
    rejectedRegistrations: number;
    totalAttendees: number;
  };
  incidents: {
    totalIncidents: number;
    resolvedCount: number;
    inProgressCount: number;
    receivedCount: number;
    resolutionRate: number; // %
  };
  communityQA: {
    totalQuestions: number;
    answeredCount: number;
    pendingCount: number;
    responseRate: number; // %
  };
  documents: {
    totalDocuments: number;
    activeCount: number;
    expiredCount: number;
  };
}

/**
 * Aggregates monthly performance metrics for Ban Điều hành Khu phố 02
 */
export function aggregateMonthlyStatistics(
  data: {
    programRegistrations?: Array<{ createdAt?: string; status?: string; attendeeCount?: number }>;
    incidentReports?: Array<{ createdAt?: string; status?: string }>;
    communityQuestions?: Array<{ createdAt?: string; status?: string }>;
    officialDocuments?: Array<{ issueDate?: string; expirationDate?: string; isExpired?: boolean }>;
  },
  filterMonthYear?: string // 'YYYY-MM' or 'all'
): MonthlyStatistics {
  const isAll = !filterMonthYear || filterMonthYear === 'all';

  const matchesMonth = (dateStr?: string): boolean => {
    if (isAll) return true;
    if (!dateStr) return false;
    return dateStr.startsWith(filterMonthYear);
  };

  const regs = data.programRegistrations || [];
  const filteredRegs = regs.filter((r) => matchesMonth(r.createdAt));
  const totalRegistrations = filteredRegs.length;
  const confirmedRegistrations = filteredRegs.filter((r) => r.status === 'confirmed').length;
  const pendingRegistrations = filteredRegs.filter((r) => r.status === 'pending' || !r.status).length;
  const rejectedRegistrations = filteredRegs.filter((r) => r.status === 'rejected').length;
  const totalAttendees = filteredRegs.reduce((sum, r) => sum + (Number(r.attendeeCount) || 1), 0);

  const incidents = data.incidentReports || [];
  const filteredIncidents = incidents.filter((i) => matchesMonth(i.createdAt));
  const totalIncidents = filteredIncidents.length;
  const resolvedCount = filteredIncidents.filter((i) => i.status === 'resolved').length;
  const inProgressCount = filteredIncidents.filter((i) => i.status === 'in_progress').length;
  const receivedCount = filteredIncidents.filter((i) => i.status === 'received').length;
  const resolutionRate = totalIncidents > 0 ? Math.round((resolvedCount / totalIncidents) * 100) : 100;

  const questions = data.communityQuestions || [];
  const filteredQuestions = questions.filter((q) => matchesMonth(q.createdAt));
  const totalQuestions = filteredQuestions.length;
  const answeredCount = filteredQuestions.filter((q) => q.status === 'answered').length;
  const pendingQuestionsCount = filteredQuestions.filter((q) => q.status === 'pending').length;
  const responseRate = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 100;

  const now = new Date();
  const docs = data.officialDocuments || [];
  const filteredDocs = docs.filter((d) => matchesMonth(d.issueDate));
  const totalDocuments = filteredDocs.length;
  const expiredDocs = filteredDocs.filter((d) => {
    if (d.isExpired) return true;
    if (d.expirationDate && new Date(d.expirationDate) < now) return true;
    return false;
  }).length;
  const activeDocs = totalDocuments - expiredDocs;

  return {
    monthYear: filterMonthYear || 'all',
    activities: {
      totalRegistrations,
      confirmedRegistrations,
      pendingRegistrations,
      rejectedRegistrations,
      totalAttendees,
    },
    incidents: {
      totalIncidents,
      resolvedCount,
      inProgressCount,
      receivedCount,
      resolutionRate,
    },
    communityQA: {
      totalQuestions,
      answeredCount,
      pendingCount: pendingQuestionsCount,
      responseRate,
    },
    documents: {
      totalDocuments,
      activeCount: activeDocs,
      expiredCount: expiredDocs,
    },
  };
}

export interface DetectedUpdateNotification {
  id: string;
  type: 'incident' | 'event' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  actionUrl?: string;
  actionLabel?: string;
}

/**
 * Diffs previous and current lists of incidents & activities to detect new items and status changes
 */
export function diffNewEventsAndIncidents(
  prevIncidents: Array<{ id: string; title: string; status: string; statusLabel?: string; locationAddress?: string }> = [],
  currIncidents: Array<{ id: string; title: string; status: string; statusLabel?: string; locationAddress?: string }> = [],
  prevActivities: Array<{ id: string; title: string; timeRange?: string }> = [],
  currActivities: Array<{ id: string; title: string; timeRange?: string }> = []
): DetectedUpdateNotification[] {
  const notifications: DetectedUpdateNotification[] = [];
  const now = new Date().toISOString();

  // If this is the initial load (prev lists are empty), do not spam notifications
  if (prevIncidents.length === 0 && prevActivities.length === 0) {
    return notifications;
  }

  const prevIncidentMap = new Map(prevIncidents.map((i) => [i.id, i]));
  const prevActivityMap = new Map(prevActivities.map((a) => [a.id, a]));

  // Check for new incidents
  for (const curr of currIncidents) {
    const prev = prevIncidentMap.get(curr.id);
    if (!prev) {
      notifications.push({
        id: `inc-new-${curr.id}-${Date.now()}`,
        type: 'incident',
        title: '📢 Phản ánh sự cố mới tiếp nhận',
        message: `Sự cố: "${curr.title}"${curr.locationAddress ? ` tại ${curr.locationAddress}` : ''} vừa được gửi tới hệ thống.`,
        timestamp: now,
        actionUrl: '#incidents-section',
        actionLabel: 'Xem phản ánh',
      });
    } else if (prev.status !== curr.status) {
      notifications.push({
        id: `inc-update-${curr.id}-${Date.now()}`,
        type: curr.status === 'resolved' ? 'success' : 'info',
        title: '✅ Cập nhật tiến độ xử lý sự cố',
        message: `Sự cố "${curr.title}" đã chuyển trạng thái: ${curr.statusLabel || curr.status}.`,
        timestamp: now,
        actionUrl: '#incidents-section',
        actionLabel: 'Xem chi tiết',
      });
    }
  }

  // Check for new activities
  for (const curr of currActivities) {
    if (!prevActivityMap.has(curr.id)) {
      notifications.push({
        id: `act-new-${curr.id}-${Date.now()}`,
        type: 'event',
        title: '🎉 Sự kiện khu dân cư mới',
        message: `Hoạt động "${curr.title}"${curr.timeRange ? ` (${curr.timeRange})` : ''} vừa được Ban Điều hành công bố!`,
        timestamp: now,
        actionUrl: '#activities-section',
        actionLabel: 'Đăng ký ngay',
      });
    }
  }

  return notifications;
}

export interface ApkPackageInfo {
  appName: string;
  packageName: string;
  versionName: string;
  versionCode: number;
  fileSizeMb: number;
  releaseDate: string;
  minAndroidVersion: string;
  downloadUrl: string;
  filename: string;
}

/**
 * Returns mobile APK application metadata for Khu phố 02 – Phường Tân Hưng
 */
export function getApkPackageInfo(): ApkPackageInfo {
  return {
    appName: 'Khu Phố 02 - Phường Tân Hưng',
    packageName: 'vn.gov.tphcm.phuongtanhung.khupho02',
    versionName: '1.2.0',
    versionCode: 12,
    fileSizeMb: 15.4,
    releaseDate: '06/11/2026',
    minAndroidVersion: 'Android 8.0 (Oreo) trở lên',
    downloadUrl: '/api/download/apk',
    filename: 'KhuPho02_TanHung_v1.2.0.apk',
  };
}
