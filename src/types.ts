export interface CommunityInfo {
  id: string;
  name: string; // "Khu phố 02"
  ward: string; // "Phường Tân Hưng"
  city: string; // "Thành phố Hồ Chí Minh"
  bannerTitle?: string; // Dòng chữ biểu ngữ trên cùng
  address: string; // Trụ sở Ban điều hành Khu phố 02
  coordinates?: string; // Tọa độ ghim Google Maps chính xác (ví dụ: 10.751307, 106.707736)
  googleMapsPinUrl?: string; // Đường dẫn ghim Google Maps chính thức
  hotline: string; // Đường dây nóng
  policePhone: string; // Công an khu vực
  healthClinicPhone: string; // Trạm Y tế
  leaderName: string; // Trưởng khu phố
  leaderPhone: string;
  deputyName: string; // Phó Trưởng khu phố
  deputyPhone: string;
  email: string;
  workingHours: string;
  updatedAt: string;
}

export interface Demographics {
  totalResidents: number; // Tổng số cư dân
  totalHouseholds: number; // Tổng số hộ dân
  totalNeighborhoodGroups: number; // Số tổ dân phố
  vneidLevel2Rate: number; // Tỷ lệ định danh VNeID mức 2 (%)
  onlinePublicServiceRate: number; // Tỷ lệ nộp hồ sơ trực tuyến (%)
  cashlessPaymentRate: number; // Tỷ lệ thanh toán không tiền mặt (%)
  culturalFamiliesRate: number; // Tỷ lệ hộ gia đình văn hóa (%)
  elderlyCount: number; // Số người cao tuổi
  childrenCount: number; // Trẻ em dưới 16 tuổi
  updatedAt: string;
}

// Cán bộ Ban Điều hành Khu phố 02
export interface CommitteeMember {
  id: string;
  fullName: string; // Họ và tên
  birthDate: string; // Ngày tháng năm sinh (DD/MM/YYYY)
  position: string; // Chức vụ: Trưởng khu phố, Phó Trưởng khu phố, Bí thư chi bộ, v.v.
  phoneNumber: string; // Số điện thoại
  responsibility: string; // Phụ trách (lĩnh vực, địa bàn, tổ dân phố)
  receivingHours?: string; // Thời gian tiếp dân (VD: 07:30 - 11:30 & 13:30 - 17:00, Thứ 2 - Thứ 6)
  avatarUrl?: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Văn bản Khu phố có ngày hết hạn và tự động xóa
export interface OfficialDocument {
  id: string;
  documentNumber: string; // Số ký hiệu văn bản (e.g. 12/TB-KP2)
  title: string; // Tên / Trích yếu văn bản
  issuingAuthority: string; // Đơn vị ban hành (UBND Phường Tân Hưng, Khu phố 02...)
  issueDate: string; // Ngày ban hành (YYYY-MM-DD)
  expirationDate: string; // Ngày hết hạn (YYYY-MM-DD) - tự động xóa khi qua ngày này
  fileUrl: string; // Đường dẫn tệp PDF tải lên
  fileName: string; // Tên tệp
  fileSize?: string;
  summary?: string;
  isExpired?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Đăng ký tham gia chương trình / hoạt động
export interface ProgramRegistration {
  id: string;
  activityId: string;
  activityTitle: string;
  fullName: string;
  phoneNumber: string;
  neighborhoodGroup: string; // Tổ dân phố
  attendeeCount: number; // Số người tham gia
  notes?: string;
  status: 'pending' | 'confirmed' | 'rejected'; // Chưa xác nhận | Đã xác nhận tham gia | Từ chối
  statusLabel: string;
  confirmedAt?: string;
  confirmedBy?: string;
  createdAt: string;
}

// Đăng ký tham gia Đoàn thể / Hội chính trị - xã hội
export interface OrganizationRegistration {
  id: string;
  organizationId: string;
  organizationName: string;
  fullName: string;
  phoneNumber: string;
  birthDate?: string;
  neighborhoodGroup?: string;
  address?: string;
  notes?: string;
  hasConfirmedAgreement: boolean; // Bắt buộc người dân tích chọn cam kết tự nguyện
  status: 'pending' | 'accepted' | 'contacted' | 'rejected';
  statusLabel: string;
  createdAt: string;
}

// Phản ánh kiến nghị hiện trường
export interface IncidentReport {
  id: string;
  reportCode: string; // e.g. PA-2026-001
  title: string;
  category: 'infrastructure' | 'environment' | 'security' | 'fire_safety' | 'order' | 'other';
  categoryLabel: string;
  description: string;
  locationAddress: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  photoUrl?: string;
  reporterName: string;
  reporterPhone: string;
  status: 'received' | 'in_progress' | 'resolved' | 'rejected';
  statusLabel: string;
  adminResponse?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Hỏi đáp cộng đồng
export interface QuestionAnswer {
  id: string;
  authorName: string;
  isOfficial: boolean; // Ban Điều hành trả lời
  content: string;
  createdAt: string;
}

export interface CommunityQuestion {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorContact?: string;
  category: 'admin' | 'utility' | 'residence' | 'security' | 'other';
  categoryLabel: string;
  status: 'pending' | 'answered' | 'closed';
  isPinned?: boolean;
  answers: QuestionAnswer[];
  createdAt: string;
  updatedAt: string;
}

export type ActivityStatus = 'ongoing' | 'upcoming' | 'completed';

export interface Activity {
  id: string;
  title: string;
  category: 'community' | 'youth' | 'women' | 'veterans' | 'security' | 'campaign';
  categoryLabel: string;
  time: string;
  dateTimestamp: number;
  location: string;
  organizer: string;
  summary: string;
  content: string;
  imageUrl: string; // Ảnh chụp / Ảnh bìa sự kiện (như ảnh Facebook)
  coverImageUrl?: string; // Ảnh bìa lớn
  logoUrl?: string; // Logo biểu trưng (nếu có)
  status: ActivityStatus;
  statusLabel: string;
  featured: boolean;
  allowRegistration?: boolean; // Cho phép đăng ký tham gia trực tuyến
  maxRegistrations?: number;
  registrationCount?: number;
  createdAt: string;
  updatedAt: string;
}

export type UtilityCategory = 'admin' | 'welfare' | 'security' | 'living';

export interface DigitalUtility {
  id: string;
  name: string;
  category: UtilityCategory;
  categoryName: string;
  shortDesc: string;
  badge: string;
  icon: string;
  imageUrl: string;
  websiteUrl: string;
  androidUrl: string;
  iosUrl: string;
  videoGuideUrl: string;
  videoGuideTitle?: string;
  videoGuideName?: string;
  pdfGuideUrl: string;
  pdfGuideName?: string;
  wordGuideUrl?: string;
  wordGuideName?: string;
  pptGuideUrl?: string;
  pptGuideName?: string;
  displayOrder: number;
  isPinned?: boolean; // Ghim lên trang chủ (ưu tiên hiển thị 2 - 4 mục)
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  shortName: string;
  badge: string;
  logo: string;
  coverImage?: string;
  description: string;
  mission: string;
  memberBenefits: string[];
  eligibility: string;
  leaderInfo: string;
  googleFormsUrl?: string;
  status: 'recruiting' | 'continuous';
  statusLabel: string;
  displayOrder: number;
  isVisible: boolean;
  updatedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  category: 'urgent' | 'regular' | 'guideline' | 'cultural';
  categoryLabel: string;
  publishedAt: string;
  isUrgent: boolean;
  summary: string;
  content: string;
  attachmentUrl?: string;
  attachmentName?: string;
}

export interface ResidentDocument {
  id: string;
  code: string;
  title: string;
  department: string;
  description: string;
  fileType: 'pdf' | 'docx' | 'xlsx';
  fileSize: string;
  downloadUrl: string;
  guideText?: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  operator: string;
  timestamp: string;
  ipAddress?: string;
  status: 'success' | 'failure';
}

export interface AppDatabase {
  communityInfo: CommunityInfo;
  demographics: Demographics;
  committeeMembers: CommitteeMember[];
  officialDocuments: OfficialDocument[];
  programRegistrations: ProgramRegistration[];
  organizationRegistrations: OrganizationRegistration[];
  incidentReports: IncidentReport[];
  communityQuestions: CommunityQuestion[];
  activities: Activity[];
  digitalUtilities: DigitalUtility[];
  organizations: Organization[];
  announcements: Announcement[];
  residentDocuments: ResidentDocument[];
  adminConfig: {
    username: string;
    passwordHash: string;
    passwordSalt: string;
    failedAttempts: number;
    lockedUntil: number;
    lastLogin: string | null;
  };
  auditLogs: AuditLog[];
}

export interface ToastNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'alert' | 'incident' | 'event';
  title: string;
  message: string;
  timestamp: number;
  duration?: number; // ms, default 6000
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  metadata?: {
    code?: string;
    targetTab?: string;
    category?: string;
  };
}

