import {
  Activity,
  CommunityInfo,
  Demographics,
  DigitalUtility,
  Organization,
  OrganizationRegistration,
  Announcement,
  ResidentDocument,
  AuditLog,
  CommitteeMember,
  OfficialDocument,
  ProgramRegistration,
  IncidentReport,
  CommunityQuestion,
} from '../types';

export interface PublicIncident {
  id: string;
  reportCode: string;
  title: string;
  category: string;
  categoryLabel: string;
  description: string;
  locationAddress: string;
  coordinates?: { lat: number; lng: number };
  photoUrl?: string;
  reporterName: string;
  status: string;
  statusLabel: string;
  adminResponse?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface PublicDataResponse {
  communityInfo: CommunityInfo;
  demographics: Demographics;
  committeeMembers: CommitteeMember[];
  officialDocuments: OfficialDocument[];
  activities: Activity[];
  digitalUtilities: DigitalUtility[];
  organizations: Organization[];
  announcements: Announcement[];
  residentDocuments: ResidentDocument[];
  communityQuestions: CommunityQuestion[];
  publicIncidents: PublicIncident[];
}

export interface AdminDataResponse {
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
  auditLogs: AuditLog[];
  adminStatus: {
    username: string;
    lastLogin: string | null;
  };
}

const TOKEN_KEY = 'kp2_admin_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

function getAuthHeaders(): HeadersInit {
  const token = getStoredToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// 1. File Upload
export async function uploadFileApi(fileName: string, fileData: string): Promise<{ fileUrl: string; fileName: string; fileSize: string }> {
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileName, fileData }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Lỗi tải tệp lên');
  }
  return data;
}

const PUBLIC_DATA_CACHE_KEY = 'kp2_public_data_cache_v2';

// 2. Fetch Public Data
export async function fetchPublicData(): Promise<PublicDataResponse> {
  try {
    const res = await fetch('/api/public-data');
    if (res.ok) {
      const json = await res.json();
      if (json.data) {
        try {
          localStorage.setItem(PUBLIC_DATA_CACHE_KEY, JSON.stringify(json.data));
        } catch {
          // Ignore quota errors
        }
        return json.data;
      }
    }
  } catch (err) {
    console.warn('Lỗi kết nối /api/public-data, sử dụng dữ liệu đã lưu trong bộ nhớ máy:', err);
  }

  // Fallback to local storage if API is unreachable (e.g., static hosting on Vercel/GitHub)
  try {
    const cached = localStorage.getItem(PUBLIC_DATA_CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {}

  throw new Error('Không thể nạp dữ liệu từ máy chủ và chưa có bản lưu cục bộ.');
}

// 3. Auth
export async function loginAdmin(username: string, password: string): Promise<{ token: string; username: string }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Đăng nhập không thành công');
  }
  setStoredToken(data.token);
  return data;
}

export async function verifyAdminSession(): Promise<boolean> {
  const token = getStoredToken();
  if (!token) return false;
  try {
    const res = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    return Boolean(data.authenticated);
  } catch {
    return false;
  }
}

export async function logoutAdmin(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  } finally {
    removeStoredToken();
  }
}

export async function changeAdminPassword(currentPassword: string, newPassword: string): Promise<void> {
  const res = await fetch('/api/auth/change-password', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Không thể đổi mật khẩu');
  }
}

export async function fetchAdminData(): Promise<AdminDataResponse> {
  const res = await fetch('/api/admin/data', {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    if (res.status === 401) {
      removeStoredToken();
      throw new Error('Phiên đăng nhập đã hết hạn');
    }
    throw new Error('Không thể tải dữ liệu quản trị');
  }
  const json = await res.json();
  return json.data;
}

// 4. Community Info & Demographics
export async function updateCommunityInfo(info: Partial<CommunityInfo>): Promise<CommunityInfo> {
  const res = await fetch('/api/admin/community-info', {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(info),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Lỗi cập nhật thông tin');
  return data.data;
}

export async function updateDemographics(stats: Partial<Demographics>): Promise<Demographics> {
  const res = await fetch('/api/admin/demographics', {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(stats),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Lỗi cập nhật số liệu dân cư');
  return data.data;
}

// 5. Committee Members
export async function saveCommitteeMemberApi(member: Partial<CommitteeMember>): Promise<CommitteeMember[]> {
  const isEdit = Boolean(member.id);
  const url = isEdit ? `/api/admin/committee-members/${member.id}` : '/api/admin/committee-members';
  const method = isEdit ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: getAuthHeaders(),
    body: JSON.stringify(member),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Lỗi lưu thông tin cán bộ');
  return data.data;
}

export async function deleteCommitteeMemberApi(id: string): Promise<CommitteeMember[]> {
  const res = await fetch(`/api/admin/committee-members/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Lỗi xóa thông tin cán bộ');
  return data.data;
}

// 6. Official Documents
export async function saveOfficialDocumentApi(doc: Partial<OfficialDocument>): Promise<OfficialDocument[]> {
  const isEdit = Boolean(doc.id);
  const url = isEdit ? `/api/admin/official-documents/${doc.id}` : '/api/admin/official-documents';
  const method = isEdit ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: getAuthHeaders(),
    body: JSON.stringify(doc),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Lỗi lưu văn bản');
  return data.data;
}

export async function deleteOfficialDocumentApi(id: string): Promise<OfficialDocument[]> {
  const res = await fetch(`/api/admin/official-documents/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Lỗi xóa văn bản');
  return data.data;
}

export async function purgeExpiredDocumentsApi(): Promise<number> {
  const res = await fetch('/api/admin/official-documents/purge-expired', {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Lỗi dọn dẹp văn bản');
  return data.purgedCount || 0;
}

// 7. Program Registration
export async function registerProgramApi(data: {
  activityId: string;
  activityTitle: string;
  fullName: string;
  phoneNumber: string;
  neighborhoodGroup?: string;
  attendeeCount?: number;
  notes?: string;
}): Promise<ProgramRegistration> {
  const res = await fetch('/api/programs/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Lỗi đăng ký tham gia');
  return json.data;
}

export async function queryProgramRegistrationStatusApi(phoneNumber: string): Promise<any[]> {
  const res = await fetch(`/api/programs/registration-status?phone=${encodeURIComponent(phoneNumber)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Lỗi tra cứu trạng thái');
  return data.data || [];
}

export async function updateProgramRegistrationStatusApi(
  id: string,
  status: 'confirmed' | 'pending' | 'rejected'
): Promise<ProgramRegistration> {
  const res = await fetch(`/api/admin/programs/registrations/${id}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Lỗi cập nhật trạng thái đăng ký');
  return data.data;
}

export async function deleteProgramRegistrationApi(id: string): Promise<ProgramRegistration[]> {
  const res = await fetch(`/api/admin/programs/registrations/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Lỗi xóa đăng ký');
  return data.data;
}

// 8. Incident Reporting
export async function submitIncidentReportApi(report: {
  title: string;
  category: string;
  categoryLabel: string;
  description: string;
  locationAddress: string;
  coordinates?: { lat: number; lng: number };
  photoUrl?: string;
  reporterName: string;
  reporterPhone: string;
}): Promise<IncidentReport> {
  const res = await fetch('/api/incidents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(report),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Lỗi gửi phản ánh');
  return json.data;
}

export async function updateIncidentStatusApi(id: string, status: string, adminResponse?: string): Promise<IncidentReport> {
  const res = await fetch(`/api/admin/incidents/${id}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status, adminResponse }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Lỗi cập nhật trạng thái');
  return data.data;
}

export async function deleteIncidentReportApi(id: string): Promise<IncidentReport[]> {
  const res = await fetch(`/api/admin/incidents/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Lỗi xóa phản ánh');
  return data.data;
}

// 9. Community Q&A
export async function submitQuestionApi(question: {
  title: string;
  content: string;
  authorName: string;
  authorContact?: string;
  category: string;
  categoryLabel: string;
}): Promise<CommunityQuestion> {
  const res = await fetch('/api/qa/questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(question),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Lỗi gửi câu hỏi');
  return data.data;
}

export async function addAnswerApi(questionId: string, answer: { authorName: string; content: string }): Promise<CommunityQuestion> {
  const res = await fetch(`/api/qa/questions/${questionId}/answers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(answer),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Lỗi gửi câu trả lời');
  return data.data;
}

export async function addOfficialAnswerApi(questionId: string, content: string): Promise<CommunityQuestion> {
  const res = await fetch(`/api/admin/qa/questions/${questionId}/official-answer`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ content }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Lỗi gửi phản hồi chính thức');
  return data.data;
}

export async function togglePinQuestionApi(id: string): Promise<CommunityQuestion> {
  const res = await fetch(`/api/admin/qa/questions/${id}/pin`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Lỗi ghim câu hỏi');
  return data.data;
}

export async function deleteQuestionApi(id: string): Promise<CommunityQuestion[]> {
  const res = await fetch(`/api/admin/qa/questions/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Lỗi xóa câu hỏi');
  return data.data;
}

export async function deleteAnswerApi(questionId: string, answerId: string): Promise<CommunityQuestion> {
  const res = await fetch(`/api/admin/qa/questions/${questionId}/answers/${answerId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Lỗi xóa phản hồi');
  return data.data;
}

// 10. Activities, Utilities, Organizations, Announcements
export async function saveActivityApi(activity: Partial<Activity>): Promise<Activity[]> {
  const isEdit = Boolean(activity.id);
  const url = isEdit ? `/api/admin/activities/${activity.id}` : '/api/admin/activities';
  const method = isEdit ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: getAuthHeaders(),
    body: JSON.stringify(activity),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Lỗi lưu thông tin hoạt động');
  return data.data;
}

export async function deleteActivityApi(id: string): Promise<Activity[]> {
  const res = await fetch(`/api/admin/activities/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Lỗi xóa hoạt động');
  return data.data;
}

export async function saveUtilityApi(utility: Partial<DigitalUtility>): Promise<DigitalUtility[]> {
  const isEdit = Boolean(utility.id);
  const url = isEdit ? `/api/admin/utilities/${utility.id}` : '/api/admin/utilities';
  const method = isEdit ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: getAuthHeaders(),
    body: JSON.stringify(utility),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Lỗi lưu tiện ích số');
  return data.data;
}

export async function deleteUtilityApi(id: string): Promise<DigitalUtility[]> {
  const res = await fetch(`/api/admin/utilities/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Lỗi xóa tiện ích số');
  return data.data;
}

export async function saveOrganizationApi(org: Partial<Organization>): Promise<Organization[]> {
  const url = `/api/admin/organizations/${org.id}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(org),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Lỗi cập nhật tổ chức');
  return data.data;
}

export async function saveAnnouncementApi(ann: Partial<Announcement>): Promise<Announcement[]> {
  const isEdit = Boolean(ann.id);
  const url = isEdit ? `/api/admin/announcements/${ann.id}` : '/api/admin/announcements';
  const method = isEdit ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: getAuthHeaders(),
    body: JSON.stringify(ann),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Lỗi lưu thông báo');
  return data.data;
}

export async function deleteAnnouncementApi(id: string): Promise<Announcement[]> {
  const res = await fetch(`/api/admin/announcements/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Lỗi xóa thông báo');
  return data.data;
}

export async function restoreDatabaseApi(backupJson: any): Promise<void> {
  const res = await fetch('/api/admin/restore', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(backupJson),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Lỗi phục hồi dữ liệu');
}

// 11. Đăng ký tham gia Đoàn thể (Thay thế hoàn toàn Google Forms)
export async function registerOrganizationApi(regData: {
  organizationId: string;
  organizationName: string;
  fullName: string;
  phoneNumber: string;
  birthDate?: string;
  neighborhoodGroup?: string;
  address?: string;
  notes?: string;
  hasConfirmedAgreement: boolean;
}): Promise<OrganizationRegistration> {
  const res = await fetch('/api/organizations/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(regData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Lỗi gửi đăng ký tham gia đoàn thể');
  return data.data;
}

export async function deleteOrganizationRegistrationApi(id: string): Promise<OrganizationRegistration[]> {
  const res = await fetch(`/api/admin/organizations/registrations/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Lỗi xóa đơn đăng ký');
  return data.data;
}

export async function updateOrganizationRegistrationStatusApi(id: string, status: string): Promise<OrganizationRegistration> {
  const res = await fetch(`/api/admin/organizations/registrations/${id}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Lỗi cập nhật trạng thái');
  return data.data;
}

// 12. APK Info
export interface ApkInfo {
  version: string;
  versionCode: number;
  releaseDate: string;
  fileSize: string;
  packageName: string;
  downloadUrl: string;
  directUrl: string;
  minAndroid: string;
  targetAndroid: string;
  sha256: string;
  features: string[];
}

export async function fetchApkInfo(): Promise<ApkInfo> {
  const res = await fetch('/api/apk/info');
  if (!res.ok) {
    throw new Error('Không thể lấy thông tin gói cài đặt APK');
  }
  const data = await res.json();
  return data;
}

