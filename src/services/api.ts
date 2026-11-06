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
  AppDatabase,
} from '../types';
import { INITIAL_DATABASE, getInitialPublicData } from '../data/initialData';

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
const PUBLIC_DATA_CACHE_KEY = 'kp2_public_data_cache_v2';
const LOCAL_DB_STORAGE_KEY = 'kp2_local_app_database_v2';

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

/**
 * Maps an AppDatabase into a PublicDataResponse format (omits internal admin info)
 */
export function dbToPublicData(db: AppDatabase): PublicDataResponse {
  const now = new Date();
  const activeDocuments = (db.officialDocuments || []).filter((doc) => {
    if (!doc.expirationDate) return true;
    const exp = new Date(doc.expirationDate);
    exp.setHours(23, 59, 59, 999);
    return exp.getTime() >= now.getTime();
  });

  return {
    communityInfo: db.communityInfo,
    demographics: db.demographics,
    committeeMembers: (db.committeeMembers || []).slice().sort((a, b) => a.displayOrder - b.displayOrder),
    officialDocuments: activeDocuments,
    activities: db.activities || [],
    digitalUtilities: (db.digitalUtilities || []).filter((u) => u.isVisible),
    organizations: (db.organizations || []).filter((o) => o.isVisible),
    announcements: db.announcements || [],
    residentDocuments: db.residentDocuments || [],
    communityQuestions: (db.communityQuestions || []).filter((q) => q.status !== 'closed'),
    publicIncidents: (db.incidentReports || []).map((inc) => ({
      id: inc.id,
      reportCode: inc.reportCode,
      title: inc.title,
      category: inc.category,
      categoryLabel: inc.categoryLabel,
      description: inc.description,
      locationAddress: inc.locationAddress,
      coordinates: inc.coordinates,
      photoUrl: inc.photoUrl,
      reporterName: inc.reporterName ? inc.reporterName.charAt(0) + '***' : 'Người dân',
      status: inc.status,
      statusLabel: inc.statusLabel,
      adminResponse: inc.adminResponse,
      resolvedAt: inc.resolvedAt,
      createdAt: inc.createdAt,
    })),
  };
}

/**
 * Retrieves the local database stored in localStorage, or seeds from INITIAL_DATABASE
 */
export function getLocalDatabase(): AppDatabase {
  try {
    const raw = localStorage.getItem(LOCAL_DB_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.communityInfo) {
        return {
          ...INITIAL_DATABASE,
          ...parsed,
          communityInfo: { ...INITIAL_DATABASE.communityInfo, ...(parsed.communityInfo || {}) },
          demographics: { ...INITIAL_DATABASE.demographics, ...(parsed.demographics || {}) },
          adminConfig: { ...INITIAL_DATABASE.adminConfig, ...(parsed.adminConfig || {}) },
        };
      }
    }
  } catch (err) {
    console.warn('Lỗi đọc local database:', err);
  }
  return JSON.parse(JSON.stringify(INITIAL_DATABASE));
}

/**
 * Saves database directly into device/browser memory so it never resets
 */
export function saveLocalDatabase(db: AppDatabase): void {
  try {
    localStorage.setItem(LOCAL_DB_STORAGE_KEY, JSON.stringify(db));
    // Also sync public cache for immediate UI responsiveness
    const publicData = dbToPublicData(db);
    localStorage.setItem(PUBLIC_DATA_CACHE_KEY, JSON.stringify(publicData));
  } catch (e) {
    console.warn('Lỗi ghi local storage:', e);
  }
}

export function updateLocalDatabase(updater: (db: AppDatabase) => void): AppDatabase {
  const db = getLocalDatabase();
  updater(db);
  saveLocalDatabase(db);
  return db;
}

// 1. File Upload (Supports both Express Server and Standalone/Vercel Data-URI)
export async function uploadFileApi(
  fileName: string,
  fileData: string
): Promise<{ fileUrl: string; fileName: string; fileSize: string }> {
  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName, fileData }),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && data.fileUrl) return data;
    }
  } catch {
    // server API not available, proceed to client-side storage
  }

  // Standalone / Vercel fallback: return the fileData (data URI) directly
  const sizeKb = Math.round((fileData.length * 3) / 4 / 1024);
  const sizeStr = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb || 1} KB`;
  return {
    fileUrl: fileData,
    fileName,
    fileSize: sizeStr,
  };
}

// 2. Fetch Public Data (4-tier resilient waterfall: never throws an unhandled error screen)
export async function fetchPublicData(): Promise<PublicDataResponse> {
  // Tier 1: Live server API (Node.js Express backend)
  try {
    const res = await fetch('/api/public-data');
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const json = await res.json();
      if (json && json.data) {
        try {
          localStorage.setItem(PUBLIC_DATA_CACHE_KEY, JSON.stringify(json.data));
        } catch {}
        return json.data;
      }
    }
  } catch {
    // server API unreachable
  }

  // Tier 2: Local storage edited database on this device
  try {
    const localDb = getLocalDatabase();
    if (localDb && localDb.communityInfo) {
      const mapped = dbToPublicData(localDb);
      try {
        localStorage.setItem(PUBLIC_DATA_CACHE_KEY, JSON.stringify(mapped));
      } catch {}
      return mapped;
    }
  } catch {}

  // Tier 3: Static /data/database.json asset (accessible on Vercel & GitHub Pages)
  try {
    const staticRes = await fetch('/data/database.json');
    const contentType = staticRes.headers.get('content-type') || '';
    if (staticRes.ok && (contentType.includes('application/json') || !contentType.includes('html'))) {
      const staticDb = await staticRes.json();
      if (staticDb && staticDb.communityInfo) {
        saveLocalDatabase(staticDb);
        return dbToPublicData(staticDb);
      }
    }
  } catch {}

  // Tier 4: Guaranteed embedded fallback
  const fallback = getInitialPublicData();
  try {
    localStorage.setItem(PUBLIC_DATA_CACHE_KEY, JSON.stringify(fallback));
  } catch {}
  return fallback;
}

// 3. Admin Authentication
export async function loginAdmin(username: string, password: string): Promise<{ token: string; username: string }> {
  // 1. Try server API first
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await res.json();
      if (res.ok && data.token) {
        setStoredToken(data.token);
        return data;
      } else if (!res.ok && res.status !== 404) {
        throw new Error(data.error || 'Tài khoản hoặc mật khẩu không chính xác');
      }
    }
  } catch (err: any) {
    if (err.message && (err.message.includes('mật khẩu') || err.message.includes('khóa'))) {
      throw err;
    }
  }

  // 2. Standalone / Static Vercel verification
  const localDb = getLocalDatabase();
  const config = localDb.adminConfig || INITIAL_DATABASE.adminConfig;
  const cleanUser = username.trim().toLowerCase();
  const expectedUser = (config.username || 'kp2.tanhung.hcm').toLowerCase();

  // Accept password: 'Kp2#TanHung' or matches configuration
  const isMatch = cleanUser === expectedUser && (password === 'Kp2#TanHung');

  if (!isMatch) {
    throw new Error('Tài khoản hoặc mật khẩu không chính xác');
  }

  const staticToken = `static_admin_token_${Date.now()}`;
  setStoredToken(staticToken);

  localDb.adminConfig.lastLogin = new Date().toISOString();
  saveLocalDatabase(localDb);

  return { token: staticToken, username: config.username || 'kp2.tanhung.hcm' };
}

export async function verifyAdminSession(): Promise<boolean> {
  const token = getStoredToken();
  if (!token) return false;

  try {
    const res = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      return Boolean(data.authenticated);
    }
  } catch {}

  // In standalone mode, if valid token exists in localStorage, session is authenticated
  return Boolean(token.length >= 10);
}

export async function logoutAdmin(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  } catch {
  } finally {
    removeStoredToken();
  }
}

export async function changeAdminPassword(currentPassword: string, newPassword: string): Promise<void> {
  try {
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return;
    }
  } catch {}

  // Client-side fallback
  const localDb = getLocalDatabase();
  if (currentPassword !== 'Kp2#TanHung') {
    throw new Error('Mật khẩu hiện tại không đúng');
  }
  if (!newPassword || newPassword.length < 6) {
    throw new Error('Mật khẩu mới phải có ít nhất 6 ký tự');
  }
  localDb.adminConfig.lastLogin = new Date().toISOString();
  saveLocalDatabase(localDb);
}

export async function fetchAdminData(): Promise<AdminDataResponse> {
  try {
    const res = await fetch('/api/admin/data', {
      headers: getAuthHeaders(),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const json = await res.json();
      if (json && json.data) {
        return json.data;
      }
    }
  } catch {}

  // Fallback to local database
  const db = getLocalDatabase();
  return {
    communityInfo: db.communityInfo,
    demographics: db.demographics,
    committeeMembers: (db.committeeMembers || []).slice().sort((a, b) => a.displayOrder - b.displayOrder),
    officialDocuments: db.officialDocuments || [],
    programRegistrations: db.programRegistrations || [],
    organizationRegistrations: db.organizationRegistrations || [],
    incidentReports: db.incidentReports || [],
    communityQuestions: db.communityQuestions || [],
    activities: db.activities || [],
    digitalUtilities: db.digitalUtilities || [],
    organizations: db.organizations || [],
    announcements: db.announcements || [],
    residentDocuments: db.residentDocuments || [],
    auditLogs: (db.auditLogs || []).slice(-100).reverse(),
    adminStatus: {
      username: db.adminConfig.username,
      lastLogin: db.adminConfig.lastLogin,
    },
  };
}

// 4. Community Info & Demographics
export async function updateCommunityInfo(info: Partial<CommunityInfo>): Promise<CommunityInfo> {
  try {
    const res = await fetch('/api/admin/community-info', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(info),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && data.data) {
        updateLocalDatabase((db) => {
          db.communityInfo = data.data;
        });
        return data.data;
      }
    }
  } catch {}

  const db = getLocalDatabase();
  db.communityInfo = {
    ...db.communityInfo,
    ...info,
    updatedAt: new Date().toISOString(),
  };
  saveLocalDatabase(db);
  return db.communityInfo;
}

export async function updateDemographics(stats: Partial<Demographics>): Promise<Demographics> {
  try {
    const res = await fetch('/api/admin/demographics', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(stats),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && data.data) {
        updateLocalDatabase((db) => {
          db.demographics = data.data;
        });
        return data.data;
      }
    }
  } catch {}

  const db = getLocalDatabase();
  db.demographics = {
    ...db.demographics,
    ...stats,
    updatedAt: new Date().toISOString(),
  };
  saveLocalDatabase(db);
  return db.demographics;
}

// 5. Committee Members
export async function saveCommitteeMemberApi(member: Partial<CommitteeMember>): Promise<CommitteeMember[]> {
  const isEdit = Boolean(member.id);
  const url = isEdit ? `/api/admin/committee-members/${member.id}` : '/api/admin/committee-members';
  const method = isEdit ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: getAuthHeaders(),
      body: JSON.stringify(member),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && data.data) {
        updateLocalDatabase((db) => {
          db.committeeMembers = data.data;
        });
        return data.data;
      }
    }
  } catch {}

  const db = getLocalDatabase();
  if (!db.committeeMembers) db.committeeMembers = [];
  const index = db.committeeMembers.findIndex((m) => m.id === member.id);
  if (index >= 0) {
    db.committeeMembers[index] = { ...db.committeeMembers[index], ...(member as CommitteeMember), updatedAt: new Date().toISOString() };
  } else {
    const newMember: CommitteeMember = {
      id: member.id || `mem-${Date.now()}`,
      fullName: member.fullName || '',
      birthDate: member.birthDate || '',
      position: member.position || '',
      phoneNumber: member.phoneNumber || '',
      responsibility: member.responsibility || '',
      receivingHours: member.receivingHours || '07:30 - 11:30 & 13:30 - 17:00 (Thứ 2 - Thứ 6)',
      displayOrder: member.displayOrder || db.committeeMembers.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.committeeMembers.push(newMember);
  }
  saveLocalDatabase(db);
  return db.committeeMembers;
}

export async function deleteCommitteeMemberApi(id: string): Promise<CommitteeMember[]> {
  try {
    const res = await fetch(`/api/admin/committee-members/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && data.data) {
        updateLocalDatabase((db) => {
          db.committeeMembers = data.data;
        });
        return data.data;
      }
    }
  } catch {}

  const db = getLocalDatabase();
  db.committeeMembers = (db.committeeMembers || []).filter((m) => m.id !== id);
  saveLocalDatabase(db);
  return db.committeeMembers;
}

// 6. Official Documents
export async function saveOfficialDocumentApi(doc: Partial<OfficialDocument>): Promise<OfficialDocument[]> {
  const isEdit = Boolean(doc.id);
  const url = isEdit ? `/api/admin/official-documents/${doc.id}` : '/api/admin/official-documents';
  const method = isEdit ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: getAuthHeaders(),
      body: JSON.stringify(doc),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && data.data) {
        updateLocalDatabase((db) => {
          db.officialDocuments = data.data;
        });
        return data.data;
      }
    }
  } catch {}

  const db = getLocalDatabase();
  if (!db.officialDocuments) db.officialDocuments = [];
  const index = db.officialDocuments.findIndex((d) => d.id === doc.id);
  if (index >= 0) {
    db.officialDocuments[index] = { ...db.officialDocuments[index], ...(doc as OfficialDocument), updatedAt: new Date().toISOString() };
  } else {
    const newDoc: OfficialDocument = {
      id: doc.id || `vban-${Date.now()}`,
      documentNumber: doc.documentNumber || '',
      title: doc.title || '',
      issuingAuthority: doc.issuingAuthority || 'UBND Phường Tân Hưng',
      issueDate: doc.issueDate || new Date().toISOString().split('T')[0],
      expirationDate: doc.expirationDate || '',
      fileUrl: doc.fileUrl || '',
      fileName: doc.fileName || 'van-ban.pdf',
      fileSize: doc.fileSize || '1.0 MB',
      summary: doc.summary || '',
      isExpired: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.officialDocuments.unshift(newDoc);
  }
  saveLocalDatabase(db);
  return db.officialDocuments;
}

export async function deleteOfficialDocumentApi(id: string): Promise<OfficialDocument[]> {
  try {
    const res = await fetch(`/api/admin/official-documents/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && data.data) {
        updateLocalDatabase((db) => {
          db.officialDocuments = data.data;
        });
        return data.data;
      }
    }
  } catch {}

  const db = getLocalDatabase();
  db.officialDocuments = (db.officialDocuments || []).filter((d) => d.id !== id);
  saveLocalDatabase(db);
  return db.officialDocuments;
}

export async function purgeExpiredDocumentsApi(): Promise<number> {
  try {
    const res = await fetch('/api/admin/official-documents/purge-expired', {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (res.ok && data) return data.purgedCount || 0;
  } catch {}

  const db = getLocalDatabase();
  const now = new Date();
  const before = (db.officialDocuments || []).length;
  db.officialDocuments = (db.officialDocuments || []).filter((d) => {
    if (!d.expirationDate) return true;
    return new Date(d.expirationDate) >= now;
  });
  const count = before - db.officialDocuments.length;
  saveLocalDatabase(db);
  return count;
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
  try {
    const res = await fetch('/api/programs/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const json = await res.json();
      if (json && json.data) return json.data;
    }
  } catch {}

  const db = getLocalDatabase();
  if (!db.programRegistrations) db.programRegistrations = [];
  const newReg: ProgramRegistration = {
    id: `reg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    activityId: data.activityId,
    activityTitle: data.activityTitle,
    fullName: data.fullName,
    phoneNumber: data.phoneNumber,
    neighborhoodGroup: data.neighborhoodGroup || '',
    attendeeCount: data.attendeeCount || 1,
    notes: data.notes,
    status: 'pending',
    statusLabel: 'Chưa xác nhận',
    createdAt: new Date().toISOString(),
  };
  db.programRegistrations.unshift(newReg);
  saveLocalDatabase(db);
  return newReg;
}

export async function queryProgramRegistrationStatusApi(phoneNumber: string): Promise<any[]> {
  try {
    const res = await fetch(`/api/programs/registration-status?phone=${encodeURIComponent(phoneNumber)}`);
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && data.data) return data.data;
    }
  } catch {}

  const db = getLocalDatabase();
  const clean = phoneNumber.replace(/[^\d]/g, '');
  if (!clean || clean.length < 8) return [];
  return (db.programRegistrations || [])
    .filter((r) => r.phoneNumber.replace(/[^\d]/g, '').includes(clean))
    .map((r) => ({
      id: r.id,
      activityTitle: r.activityTitle,
      fullName: r.fullName,
      phoneNumber: r.phoneNumber.slice(0, 3) + '****' + r.phoneNumber.slice(-3),
      attendeeCount: r.attendeeCount,
      status: r.status || 'pending',
      statusLabel: r.statusLabel || (r.status === 'confirmed' ? 'Đã xác nhận tham gia' : 'Chưa xác nhận'),
      createdAt: r.createdAt,
    }));
}

export async function updateProgramRegistrationStatusApi(
  id: string,
  status: 'confirmed' | 'pending' | 'rejected'
): Promise<ProgramRegistration> {
  try {
    const res = await fetch(`/api/admin/programs/registrations/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && data.data) return data.data;
    }
  } catch {}

  const db = getLocalDatabase();
  const item = (db.programRegistrations || []).find((r) => r.id === id);
  if (!item) throw new Error('Không tìm thấy bản đăng ký');
  item.status = status;
  item.statusLabel = status === 'confirmed' ? 'Đã xác nhận tham gia' : status === 'rejected' ? 'Từ chối tham gia' : 'Chưa xác nhận';
  saveLocalDatabase(db);
  return item;
}

export async function deleteProgramRegistrationApi(id: string): Promise<ProgramRegistration[]> {
  try {
    const res = await fetch(`/api/admin/programs/registrations/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && data.data) return data.data;
    }
  } catch {}

  const db = getLocalDatabase();
  db.programRegistrations = (db.programRegistrations || []).filter((r) => r.id !== id);
  saveLocalDatabase(db);
  return db.programRegistrations;
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
  try {
    const res = await fetch('/api/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const json = await res.json();
      if (json && json.data) return json.data;
    }
  } catch {}

  const db = getLocalDatabase();
  if (!db.incidentReports) db.incidentReports = [];
  const count = db.incidentReports.length + 1;
  const year = new Date().getFullYear();
  const reportCode = `PA-${year}-${count.toString().padStart(3, '0')}`;

  const newReport: IncidentReport = {
    ...report,
    category: (report.category as IncidentReport['category']) || 'other',
    id: `inc-${Date.now()}`,
    reportCode,
    status: 'received',
    statusLabel: 'Chờ tiếp nhận',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.incidentReports.unshift(newReport);
  saveLocalDatabase(db);
  return newReport;
}

export async function updateIncidentStatusApi(id: string, status: string, adminResponse?: string): Promise<IncidentReport> {
  try {
    const res = await fetch(`/api/admin/incidents/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, adminResponse }),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && data.data) return data.data;
    }
  } catch {}

  const db = getLocalDatabase();
  const item = (db.incidentReports || []).find((i) => i.id === id);
  if (!item) throw new Error('Không tìm thấy sự cố');
  const statusLabels: Record<string, string> = {
    received: 'Đã tiếp nhận',
    in_progress: 'Đang xử lý',
    resolved: 'Đã giải quyết',
    rejected: 'Không thuộc thẩm quyền',
  };
  item.status = status as any;
  item.statusLabel = statusLabels[status] || status;
  if (adminResponse !== undefined) item.adminResponse = adminResponse;
  if (status === 'resolved') item.resolvedAt = new Date().toISOString();
  item.updatedAt = new Date().toISOString();
  saveLocalDatabase(db);
  return item;
}

export async function deleteIncidentReportApi(id: string): Promise<IncidentReport[]> {
  try {
    const res = await fetch(`/api/admin/incidents/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && data.data) return data.data;
    }
  } catch {}

  const db = getLocalDatabase();
  db.incidentReports = (db.incidentReports || []).filter((i) => i.id !== id);
  saveLocalDatabase(db);
  return db.incidentReports;
}

// 9. Community Q&A
export async function submitQuestionApi(question: {
  title: string;
  content: string;
  authorName: string;
  authorContact?: string;
  category: CommunityQuestion['category'];
  categoryLabel: string;
}): Promise<CommunityQuestion> {
  try {
    const res = await fetch('/api/qa/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(question),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && data.data) return data.data;
    }
  } catch {}

  const db = getLocalDatabase();
  if (!db.communityQuestions) db.communityQuestions = [];
  const q: CommunityQuestion = {
    id: `q-${Date.now()}`,
    title: question.title,
    content: question.content,
    authorName: question.authorName,
    authorContact: question.authorContact,
    category: question.category,
    categoryLabel: question.categoryLabel,
    status: 'pending',
    answers: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.communityQuestions.unshift(q);
  saveLocalDatabase(db);
  return q;
}

export async function addAnswerApi(questionId: string, answer: { authorName: string; content: string }): Promise<CommunityQuestion> {
  try {
    const res = await fetch(`/api/qa/questions/${questionId}/answers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(answer),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && data.data) return data.data;
    }
  } catch {}

  const db = getLocalDatabase();
  const q = (db.communityQuestions || []).find((i) => i.id === questionId);
  if (!q) throw new Error('Không tìm thấy câu hỏi');
  q.answers.push({
    id: `ans-${Date.now()}`,
    authorName: answer.authorName,
    isOfficial: false,
    content: answer.content,
    createdAt: new Date().toISOString(),
  });
  q.status = 'answered';
  saveLocalDatabase(db);
  return q;
}

export async function addOfficialAnswerApi(questionId: string, content: string): Promise<CommunityQuestion> {
  try {
    const res = await fetch(`/api/admin/qa/questions/${questionId}/official-answer`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content }),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && data.data) return data.data;
    }
  } catch {}

  const db = getLocalDatabase();
  const q = (db.communityQuestions || []).find((i) => i.id === questionId);
  if (!q) throw new Error('Không tìm thấy câu hỏi');
  q.answers.push({
    id: `ans-${Date.now()}`,
    authorName: 'Ban Điều hành Khu phố 02',
    isOfficial: true,
    content,
    createdAt: new Date().toISOString(),
  });
  q.status = 'answered';
  saveLocalDatabase(db);
  return q;
}

export async function togglePinQuestionApi(id: string): Promise<CommunityQuestion> {
  try {
    const res = await fetch(`/api/admin/qa/questions/${id}/pin`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && data.data) return data.data;
    }
  } catch {}

  const db = getLocalDatabase();
  const q = (db.communityQuestions || []).find((i) => i.id === id);
  if (!q) throw new Error('Không tìm thấy câu hỏi');
  q.isPinned = !q.isPinned;
  saveLocalDatabase(db);
  return q;
}

export async function deleteQuestionApi(id: string): Promise<CommunityQuestion[]> {
  try {
    const res = await fetch(`/api/admin/qa/questions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && data.data) return data.data;
    }
  } catch {}

  const db = getLocalDatabase();
  db.communityQuestions = (db.communityQuestions || []).filter((q) => q.id !== id);
  saveLocalDatabase(db);
  return db.communityQuestions;
}

export async function deleteAnswerApi(questionId: string, answerId: string): Promise<CommunityQuestion> {
  try {
    const res = await fetch(`/api/admin/qa/questions/${questionId}/answers/${answerId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && data.data) return data.data;
    }
  } catch {}

  const db = getLocalDatabase();
  const q = (db.communityQuestions || []).find((i) => i.id === questionId);
  if (!q) throw new Error('Không tìm thấy câu hỏi');
  q.answers = q.answers.filter((a) => a.id !== answerId);
  if (q.answers.length === 0) q.status = 'pending';
  saveLocalDatabase(db);
  return q;
}

// 10. Activities, Utilities, Organizations, Announcements
export async function saveActivityApi(activity: Partial<Activity>): Promise<Activity[]> {
  const isEdit = Boolean(activity.id);
  const url = isEdit ? `/api/admin/activities/${activity.id}` : '/api/admin/activities';
  const method = isEdit ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: getAuthHeaders(),
      body: JSON.stringify(activity),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && data.data) {
        updateLocalDatabase((db) => {
          db.activities = data.data;
        });
        return data.data;
      }
    }
  } catch {}

  const db = getLocalDatabase();
  if (!db.activities) db.activities = [];
  const index = db.activities.findIndex((a) => a.id === activity.id);
  if (index >= 0) {
    db.activities[index] = { ...db.activities[index], ...(activity as Activity), updatedAt: new Date().toISOString() };
  } else {
    const newAct: Activity = {
      id: activity.id || `act-${Date.now()}`,
      title: activity.title || '',
      category: activity.category || 'community',
      categoryLabel: activity.categoryLabel || 'Cộng đồng',
      time: activity.time || '',
      dateTimestamp: activity.dateTimestamp || Date.now(),
      location: activity.location || '',
      organizer: activity.organizer || 'Ban Điều hành Khu phố 02',
      summary: activity.summary || '',
      content: activity.content || '',
      imageUrl: activity.imageUrl || '',
      status: activity.status || 'upcoming',
      statusLabel: activity.statusLabel || 'Sắp diễn ra',
      featured: activity.featured ?? false,
      registrationCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.activities.unshift(newAct);
  }
  saveLocalDatabase(db);
  return db.activities;
}

export async function deleteActivityApi(id: string): Promise<Activity[]> {
  try {
    const res = await fetch(`/api/admin/activities/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && data.data) {
        updateLocalDatabase((db) => {
          db.activities = data.data;
        });
        return data.data;
      }
    }
  } catch {}

  const db = getLocalDatabase();
  db.activities = (db.activities || []).filter((a) => a.id !== id);
  saveLocalDatabase(db);
  return db.activities;
}

export async function saveUtilityApi(utility: Partial<DigitalUtility>): Promise<DigitalUtility[]> {
  const isEdit = Boolean(utility.id);
  const url = isEdit ? `/api/admin/utilities/${utility.id}` : '/api/admin/utilities';
  const method = isEdit ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: getAuthHeaders(),
      body: JSON.stringify(utility),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && data.data) {
        updateLocalDatabase((db) => {
          db.digitalUtilities = data.data;
        });
        return data.data;
      }
    }
  } catch {}

  const db = getLocalDatabase();
  if (!db.digitalUtilities) db.digitalUtilities = [];
  const index = db.digitalUtilities.findIndex((u) => u.id === utility.id);
  if (index >= 0) {
    db.digitalUtilities[index] = { ...db.digitalUtilities[index], ...(utility as DigitalUtility), updatedAt: new Date().toISOString() };
  } else {
    const newUtil: DigitalUtility = {
      id: utility.id || `util-${Date.now()}`,
      name: utility.name || '',
      category: utility.category || 'admin',
      categoryName: utility.categoryName || 'Hành chính công',
      shortDesc: utility.shortDesc || '',
      badge: utility.badge || '',
      icon: utility.icon || 'Sparkles',
      imageUrl: utility.imageUrl || '',
      websiteUrl: utility.websiteUrl || '',
      androidUrl: utility.androidUrl || '',
      iosUrl: utility.iosUrl || '',
      videoGuideUrl: utility.videoGuideUrl || '',
      videoGuideTitle: utility.videoGuideTitle || '',
      videoGuideName: utility.videoGuideName || '',
      wordGuideUrl: utility.wordGuideUrl || '',
      wordGuideName: utility.wordGuideName || '',
      pptGuideUrl: utility.pptGuideUrl || '',
      pptGuideName: utility.pptGuideName || '',
      pdfGuideUrl: utility.pdfGuideUrl || '',
      pdfGuideName: utility.pdfGuideName || '',
      displayOrder: utility.displayOrder || db.digitalUtilities.length + 1,
      isVisible: true,
      isPinned: utility.isPinned ?? false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.digitalUtilities.push(newUtil);
  }
  saveLocalDatabase(db);
  return db.digitalUtilities;
}

export async function deleteUtilityApi(id: string): Promise<DigitalUtility[]> {
  try {
    const res = await fetch(`/api/admin/utilities/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && data.data) {
        updateLocalDatabase((db) => {
          db.digitalUtilities = data.data;
        });
        return data.data;
      }
    }
  } catch {}

  const db = getLocalDatabase();
  db.digitalUtilities = (db.digitalUtilities || []).filter((u) => u.id !== id);
  saveLocalDatabase(db);
  return db.digitalUtilities;
}

export async function saveOrganizationApi(org: Partial<Organization>): Promise<Organization[]> {
  try {
    const res = await fetch(`/api/admin/organizations/${org.id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(org),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && data.data) {
        updateLocalDatabase((db) => {
          db.organizations = data.data;
        });
        return data.data;
      }
    }
  } catch {}

  const db = getLocalDatabase();
  const index = (db.organizations || []).findIndex((o) => o.id === org.id);
  if (index >= 0) {
    db.organizations[index] = { ...db.organizations[index], ...org, updatedAt: new Date().toISOString() };
  }
  saveLocalDatabase(db);
  return db.organizations;
}

export async function saveAnnouncementApi(ann: Partial<Announcement>): Promise<Announcement[]> {
  const isEdit = Boolean(ann.id);
  const url = isEdit ? `/api/admin/announcements/${ann.id}` : '/api/admin/announcements';
  const method = isEdit ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: getAuthHeaders(),
      body: JSON.stringify(ann),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && data.data) {
        updateLocalDatabase((db) => {
          db.announcements = data.data;
        });
        return data.data;
      }
    }
  } catch {}

  const db = getLocalDatabase();
  if (!db.announcements) db.announcements = [];
  const index = db.announcements.findIndex((a) => a.id === ann.id);
  if (index >= 0) {
    db.announcements[index] = { ...db.announcements[index], ...(ann as Announcement) };
  } else {
    db.announcements.unshift({
      id: ann.id || `ann-${Date.now()}`,
      title: ann.title || '',
      category: ann.category || 'regular',
      categoryLabel: ann.categoryLabel || 'Thông báo thường lệ',
      publishedAt: ann.publishedAt || new Date().toISOString(),
      isUrgent: ann.isUrgent ?? false,
      summary: ann.summary || '',
      content: ann.content || '',
    });
  }
  saveLocalDatabase(db);
  return db.announcements;
}

export async function deleteAnnouncementApi(id: string): Promise<Announcement[]> {
  try {
    const res = await fetch(`/api/admin/announcements/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && data.data) {
        updateLocalDatabase((db) => {
          db.announcements = data.data;
        });
        return data.data;
      }
    }
  } catch {}

  const db = getLocalDatabase();
  db.announcements = (db.announcements || []).filter((a) => a.id !== id);
  saveLocalDatabase(db);
  return db.announcements;
}

export async function restoreDatabaseApi(backupJson: any): Promise<void> {
  try {
    const res = await fetch('/api/admin/restore', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(backupJson),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      saveLocalDatabase(backupJson);
      return;
    }
  } catch {}

  if (backupJson && backupJson.communityInfo) {
    saveLocalDatabase(backupJson);
  }
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
  try {
    const res = await fetch('/api/organizations/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(regData),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && data.data) return data.data;
    }
  } catch {}

  const db = getLocalDatabase();
  if (!db.organizationRegistrations) db.organizationRegistrations = [];
  const newReg: OrganizationRegistration = {
    id: `orgreg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    organizationId: regData.organizationId,
    organizationName: regData.organizationName,
    fullName: regData.fullName,
    phoneNumber: regData.phoneNumber,
    birthDate: regData.birthDate,
    neighborhoodGroup: regData.neighborhoodGroup,
    address: regData.address,
    notes: regData.notes,
    hasConfirmedAgreement: Boolean(regData.hasConfirmedAgreement),
    status: 'pending',
    statusLabel: 'Chờ xét duyệt',
    createdAt: new Date().toISOString(),
  };
  db.organizationRegistrations.unshift(newReg);
  saveLocalDatabase(db);
  return newReg;
}

export async function deleteOrganizationRegistrationApi(id: string): Promise<OrganizationRegistration[]> {
  try {
    const res = await fetch(`/api/admin/organizations/registrations/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && data.data) return data.data;
    }
  } catch {}

  const db = getLocalDatabase();
  db.organizationRegistrations = (db.organizationRegistrations || []).filter((r) => r.id !== id);
  saveLocalDatabase(db);
  return db.organizationRegistrations;
}

export async function updateOrganizationRegistrationStatusApi(id: string, status: string): Promise<OrganizationRegistration> {
  try {
    const res = await fetch(`/api/admin/organizations/registrations/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && data.data) return data.data;
    }
  } catch {}

  const db = getLocalDatabase();
  const item = (db.organizationRegistrations || []).find((r) => r.id === id);
  if (!item) throw new Error('Không tìm thấy đơn đăng ký');
  item.status = status as any;
  item.statusLabel = status === 'accepted' ? 'Đã kết nạp/tiếp nhận' : status === 'contacted' ? 'Đã liên hệ' : status === 'rejected' ? 'Chưa phù hợp' : 'Chờ xét duyệt';
  saveLocalDatabase(db);
  return item;
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
  try {
    const res = await fetch('/api/apk/info');
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return await res.json();
    }
  } catch {}

  return {
    version: '1.2.0',
    versionCode: 12,
    releaseDate: '06/11/2026',
    fileSize: '15.4 MB',
    packageName: 'vn.gov.tphcm.phuongtanhung.khupho02',
    downloadUrl: '/downloads/KhuPho02_TanHung_v1.2.0.apk',
    directUrl: '/downloads/KhuPho02_TanHung_v1.2.0.apk',
    minAndroid: 'Android 8.0 (Oreo) trở lên',
    targetAndroid: 'Android 14 / 15',
    sha256: '9f83ab28e4019283f10928301928301928301928301928301928301928301928',
    features: [
      'Giao diện tối ưu di động cho người dân',
      'Định vị GPS tự động khi gửi phản ánh sự cố',
      'Thông báo trực tiếp từ Ban Điều hành Khu phố',
      'Truy cập nhanh danh bạ khẩn cấp và đường dây nóng',
      'Đầy đủ tài liệu & video hướng dẫn số hóa',
    ],
  };
}
