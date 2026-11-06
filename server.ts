import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { dbManager } from './server/db';
import {
  hashAdminPassword,
  checkLoginRateLimit,
  validateActivityInput,
  validateUtilityInput,
  validateDemographicsInput,
  validateCommitteeMemberInput,
  validateOfficialDocumentInput,
  validateIncidentInput,
} from './src/utils/rules';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const IS_PROD = process.env.NODE_ENV === 'production';
const UPLOAD_DIR = path.resolve(process.cwd(), 'public', 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Serve public uploaded files (PDFs, incident images, guides)
app.use('/uploads', express.static(UPLOAD_DIR));
const DOWNLOADS_DIR = path.resolve(process.cwd(), 'public', 'downloads');
if (!fs.existsSync(DOWNLOADS_DIR)) {
  fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
}
app.use('/downloads', express.static(DOWNLOADS_DIR));

// Support large JSON payloads (e.g. for base64 files and images)
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Active session tokens map in memory: token -> { username, expiresAt }
const activeSessions = new Map<string, { username: string; expiresAt: number }>();

function generateSessionToken(username: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  activeSessions.set(token, { username, expiresAt });
  return token;
}

function verifyAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Yêu cầu đăng nhập quản trị viên' });
  }

  const token = authHeader.split(' ')[1];
  const session = activeSessions.get(token);

  if (!session) {
    return res.status(401).json({ error: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ' });
  }

  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    return res.status(401).json({ error: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại' });
  }

  session.expiresAt = Date.now() + 24 * 60 * 60 * 1000;
  next();
}

// ---------------- API ROUTES ----------------

// 1. File Upload (PDFs, Images, Word documents)
app.post('/api/upload', (req: Request, res: Response) => {
  try {
    const { fileName, fileData } = req.body;
    if (!fileName || !fileData) {
      return res.status(400).json({ error: 'Dữ liệu tệp không hợp lệ' });
    }

    // Clean base64 string
    const base64Content = fileData.includes(';base64,') ? fileData.split(';base64,')[1] : fileData;
    const buffer = Buffer.from(base64Content, 'base64');

    // Generate safe unique filename
    const ext = path.extname(fileName) || '.pdf';
    const baseName = path.basename(fileName, ext).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);
    const uniqueFilename = `${Date.now()}-${baseName}${ext}`;
    const targetPath = path.join(UPLOAD_DIR, uniqueFilename);

    fs.writeFileSync(targetPath, buffer);

    const sizeInKb = Math.round(buffer.length / 1024);
    const sizeStr = sizeInKb > 1024 ? `${(sizeInKb / 1024).toFixed(1)} MB` : `${sizeInKb} KB`;

    res.json({
      success: true,
      fileUrl: `/uploads/${uniqueFilename}`,
      fileName: fileName,
      fileSize: sizeStr,
      message: 'Tải lên tệp thành công',
    });
  } catch (err: any) {
    console.error('Lỗi tải tệp:', err);
    res.status(500).json({ error: 'Lỗi máy chủ khi lưu tệp tải lên' });
  }
});

// 2. Public Data endpoint for citizens
app.get('/api/public-data', (req: Request, res: Response) => {
  try {
    const data = dbManager.getPublicData();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi tải dữ liệu công khai' });
  }
});

// 2b. APK download and info endpoints
app.get('/api/download/apk', (req: Request, res: Response) => {
  try {
    const apkPath = path.resolve(DOWNLOADS_DIR, 'KhuPho02_TanHung_v1.2.0.apk');
    if (fs.existsSync(apkPath)) {
      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
      res.setHeader('Content-Disposition', 'attachment; filename="KhuPho02_TanHung_v1.2.0.apk"');
      return res.sendFile(apkPath);
    }
    return res.status(404).json({ error: 'Tệp APK chưa sẵn sàng' });
  } catch (err: any) {
    console.error('Lỗi tải tệp APK:', err);
    res.status(500).json({ error: 'Lỗi máy chủ khi tải tệp APK' });
  }
});

app.get('/api/apk/info', (req: Request, res: Response) => {
  res.json({
    success: true,
    version: '1.2.0',
    versionCode: 120,
    releaseDate: '2026-11-06',
    fileSize: '2.0 MB',
    packageName: 'vn.gov.tphcm.phuongtanhung.khupho02',
    downloadUrl: '/api/download/apk',
    directUrl: '/downloads/KhuPho02_TanHung_v1.2.0.apk',
    minAndroid: 'Android 7.0 (Nougat) trở lên',
    targetAndroid: 'Android 14 (API 34)',
    sha256: 'a9b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
    features: [
      'Nhận thông báo sự cố & thông báo khẩn cấp tức thì (Push Notification)',
      'Gửi phản ánh hiện trường kèm định vị GPS & chụp ảnh nhanh',
      'Đăng ký tham gia hoạt động, đoàn thể khu phố trực tiếp',
      'Tra cứu danh bạ tiện ích số & hồ sơ dịch vụ công ngoại tuyến (Offline cache)',
      'Hỏi đáp cộng đồng dân cư trực tiếp với Ban Điều hành'
    ]
  });
});

// 3. Authentication: Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

    if (!username || !password) {
      return res.status(400).json({ error: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu' });
    }

    const adminConfig = dbManager.getAdminConfig();
    const rateCheck = checkLoginRateLimit(adminConfig.failedAttempts, adminConfig.lockedUntil);

    if (rateCheck.isLocked) {
      dbManager.logAudit('Đăng nhập bị từ chối', `Tài khoản tạm khóa do sai mật khẩu quá 5 lần. Còn ${rateCheck.remainingSeconds}s`, username, 'failure', ip);
      return res.status(429).json({
        error: `Tài khoản bị tạm khóa do nhập sai nhiều lần. Vui lòng thử lại sau ${rateCheck.remainingSeconds} giây.`,
        remainingSeconds: rateCheck.remainingSeconds,
      });
    }

    if (username.trim() !== adminConfig.username) {
      const newAttempts = adminConfig.failedAttempts + 1;
      const lockedUntil = newAttempts >= 5 ? Date.now() + 5 * 60 * 1000 : 0;
      dbManager.updateFailedLogin(newAttempts, lockedUntil);
      dbManager.logAudit('Đăng nhập thất bại', `Sai tên đăng nhập: ${username}`, username, 'failure', ip);
      return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không chính xác' });
    }

    const calculatedHash = hashAdminPassword(password, adminConfig.passwordSalt);
    if (calculatedHash !== adminConfig.passwordHash) {
      const newAttempts = adminConfig.failedAttempts + 1;
      const lockedUntil = newAttempts >= 5 ? Date.now() + 5 * 60 * 1000 : 0;
      dbManager.updateFailedLogin(newAttempts, lockedUntil);
      dbManager.logAudit('Đăng nhập thất bại', `Sai mật khẩu cho tài khoản ${username}. Lần sai: ${newAttempts}/5`, username, 'failure', ip);

      if (newAttempts >= 5) {
        return res.status(429).json({
          error: 'Bạn đã nhập sai mật khẩu 5 lần liên tiếp. Tài khoản bị tạm khóa 5 phút để bảo mật.',
          remainingSeconds: 300,
        });
      }

      return res.status(401).json({
        error: `Tên đăng nhập hoặc mật khẩu không chính xác (Còn ${5 - newAttempts} lần thử)`,
      });
    }

    // Success
    dbManager.recordSuccessLogin();
    const token = generateSessionToken(username);
    dbManager.logAudit('Đăng nhập thành công', `Quản trị viên đăng nhập hệ thống Khu phố 02`, username, 'success', ip);

    res.json({
      success: true,
      token,
      username,
      message: 'Đăng nhập thành công',
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi xử lý đăng nhập máy chủ' });
  }
});

// 4. Authentication: Verify session
app.post('/api/auth/verify', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.json({ authenticated: false });
  }
  const token = authHeader.split(' ')[1];
  const session = activeSessions.get(token);
  if (session && Date.now() <= session.expiresAt) {
    return res.json({ authenticated: true, username: session.username });
  }
  return res.json({ authenticated: false });
});

// 5. Authentication: Logout
app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    activeSessions.delete(token);
  }
  res.json({ success: true, message: 'Đã đăng xuất' });
});

// 6. Authentication: Change Password
app.post('/api/auth/change-password', verifyAuthMiddleware, (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Mật khẩu mới phải có ít nhất 8 ký tự' });
    }

    const adminConfig = dbManager.getAdminConfig();
    const currentHash = hashAdminPassword(currentPassword, adminConfig.passwordSalt);
    if (currentHash !== adminConfig.passwordHash) {
      return res.status(400).json({ error: 'Mật khẩu hiện tại không chính xác' });
    }

    const newSalt = crypto.randomBytes(16).toString('hex');
    const newHash = hashAdminPassword(newPassword, newSalt);
    dbManager.changeAdminPassword(newHash, newSalt);

    res.json({ success: true, message: 'Đổi mật khẩu quản trị viên thành công' });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi đổi mật khẩu' });
  }
});

// 7. Admin Data (protected)
app.get('/api/admin/data', verifyAuthMiddleware, (req: Request, res: Response) => {
  try {
    const data = dbManager.getAdminData();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi tải dữ liệu quản trị' });
  }
});

// 8. Admin: Update Community Info & Demographics
app.put('/api/admin/community-info', verifyAuthMiddleware, (req: Request, res: Response) => {
  try {
    const updated = dbManager.updateCommunityInfo(req.body);
    res.json({ success: true, data: updated, message: 'Cập nhật thông tin Khu phố 02 thành công' });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi cập nhật thông tin' });
  }
});

app.put('/api/admin/demographics', verifyAuthMiddleware, (req: Request, res: Response) => {
  try {
    const validation = validateDemographicsInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.errors.join(', ') });
    }
    const updated = dbManager.updateDemographics(req.body);
    res.json({ success: true, data: updated, message: 'Cập nhật chỉ số dân cư thành công' });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi cập nhật chỉ số dân cư' });
  }
});

// 9. Committee Members CRUD
app.post('/api/admin/committee-members', verifyAuthMiddleware, (req: Request, res: Response) => {
  try {
    const validation = validateCommitteeMemberInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.errors.join(', ') });
    }
    const list = dbManager.saveCommitteeMember(req.body);
    res.json({ success: true, data: list, message: 'Thêm cán bộ thành công' });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi lưu thông tin cán bộ' });
  }
});

app.put('/api/admin/committee-members/:id', verifyAuthMiddleware, (req: Request, res: Response) => {
  try {
    const data = { ...req.body, id: req.params.id };
    const validation = validateCommitteeMemberInput(data);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.errors.join(', ') });
    }
    const list = dbManager.saveCommitteeMember(data);
    res.json({ success: true, data: list, message: 'Cập nhật cán bộ thành công' });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi cập nhật thông tin cán bộ' });
  }
});

app.delete('/api/admin/committee-members/:id', verifyAuthMiddleware, (req: Request, res: Response) => {
  try {
    const list = dbManager.deleteCommitteeMember(req.params.id);
    res.json({ success: true, data: list, message: 'Xóa cán bộ thành công' });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi xóa thông tin cán bộ' });
  }
});

// 10. Official Documents CRUD (PDF, issuingAuthority, expirationDate, auto-delete)
app.post('/api/admin/official-documents', verifyAuthMiddleware, (req: Request, res: Response) => {
  try {
    const validation = validateOfficialDocumentInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.errors.join(', ') });
    }
    const list = dbManager.saveOfficialDocument(req.body);
    res.json({ success: true, data: list, message: 'Ban hành văn bản thành công' });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi ban hành văn bản' });
  }
});

app.put('/api/admin/official-documents/:id', verifyAuthMiddleware, (req: Request, res: Response) => {
  try {
    const data = { ...req.body, id: req.params.id };
    const validation = validateOfficialDocumentInput(data);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.errors.join(', ') });
    }
    const list = dbManager.saveOfficialDocument(data);
    res.json({ success: true, data: list, message: 'Cập nhật văn bản thành công' });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi cập nhật văn bản' });
  }
});

app.delete('/api/admin/official-documents/:id', verifyAuthMiddleware, (req: Request, res: Response) => {
  try {
    const list = dbManager.deleteOfficialDocument(req.params.id);
    res.json({ success: true, data: list, message: 'Xóa văn bản thành công' });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi xóa văn bản' });
  }
});

app.post('/api/admin/official-documents/purge-expired', verifyAuthMiddleware, (req: Request, res: Response) => {
  try {
    const result = dbManager.purgeExpiredDocuments();
    res.json({ success: true, message: `Đã tự động dọn dẹp ${result.purgedCount} văn bản hết hạn`, purgedCount: result.purgedCount });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi dọn dẹp văn bản hết hạn' });
  }
});

// 11. Program Registration
app.post('/api/programs/register', (req: Request, res: Response) => {
  try {
    const { activityId, activityTitle, fullName, phoneNumber, neighborhoodGroup, attendeeCount, notes } = req.body;
    if (!activityId || !fullName || !phoneNumber) {
      return res.status(400).json({ error: 'Vui lòng cung cấp đầy đủ họ tên và số điện thoại liên hệ' });
    }
    const reg = dbManager.registerProgram({
      activityId,
      activityTitle: activityTitle || 'Chương trình Khu phố',
      fullName,
      phoneNumber,
      neighborhoodGroup: neighborhoodGroup || '',
      attendeeCount: parseInt(attendeeCount, 10) || 1,
      notes: notes || '',
    });
    res.json({
      success: true,
      data: reg,
      message: 'Đăng ký tham gia thành công. Đang chờ người quản lý phần mềm xác nhận tham gia.',
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi tiếp nhận đăng ký chương trình' });
  }
});

// Tra cứu trạng thái đăng ký của người dân bằng số điện thoại
app.get('/api/programs/registration-status', (req: Request, res: Response) => {
  try {
    const phone = req.query.phone as string;
    if (!phone) {
      return res.status(400).json({ error: 'Vui lòng nhập số điện thoại cần tra cứu' });
    }
    const results = dbManager.getProgramRegistrationStatus(phone);
    res.json({ success: true, data: results });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi tra cứu trạng thái đăng ký' });
  }
});

// Người quản lý phần mềm xác nhận hoặc từ chối tham gia hoạt động
app.put('/api/admin/programs/registrations/:id/status', verifyAuthMiddleware, (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!status || !['confirmed', 'pending', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
    }
    const updated = dbManager.updateProgramRegistrationStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ error: 'Không tìm thấy hồ sơ đăng ký' });
    }
    res.json({
      success: true,
      data: updated,
      message: status === 'confirmed' ? 'Đã xác nhận cho người dân tham gia hoạt động' : 'Đã cập nhật trạng thái hồ sơ',
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi cập nhật trạng thái đăng ký' });
  }
});

app.delete('/api/admin/programs/registrations/:id', verifyAuthMiddleware, (req: Request, res: Response) => {
  try {
    const list = dbManager.deleteProgramRegistration(req.params.id);
    res.json({ success: true, data: list, message: 'Xóa đăng ký thành công' });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi xóa đăng ký' });
  }
});

// 11b. Organization Registrations (Đoàn thể & Hội)
app.post('/api/organizations/register', (req: Request, res: Response) => {
  try {
    const { organizationId, organizationName, fullName, phoneNumber, birthDate, neighborhoodGroup, address, notes, hasConfirmedAgreement } = req.body;
    
    if (!organizationId || !organizationName) {
      return res.status(400).json({ error: 'Vui lòng chọn đoàn thể muốn tham gia' });
    }
    if (!fullName || fullName.trim().length < 2) {
      return res.status(400).json({ error: 'Vui lòng nhập họ và tên hợp lệ' });
    }
    if (!phoneNumber || phoneNumber.trim().length < 8) {
      return res.status(400).json({ error: 'Vui lòng nhập số điện thoại liên hệ hợp lệ' });
    }
    if (!hasConfirmedAgreement) {
      return res.status(400).json({ error: 'Bạn phải tích chọn ô xác nhận đồng ý cam kết tự nguyện tham gia trước khi gửi thông tin' });
    }

    const reg = dbManager.registerOrganization({
      organizationId,
      organizationName,
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim(),
      birthDate: birthDate?.trim() || '',
      neighborhoodGroup: neighborhoodGroup?.trim() || '',
      address: address?.trim() || '',
      notes: notes?.trim() || '',
      hasConfirmedAgreement: true,
    });

    res.json({ success: true, data: reg, message: `Đã tiếp nhận hồ sơ đăng ký tham gia ${organizationName}. Ban Điều hành & Đoàn thể sẽ liên hệ với bạn trong thời gian sớm nhất.` });
  } catch (err: any) {
    console.error('Lỗi tiếp nhận hồ sơ đoàn thể:', err);
    res.status(500).json({ error: 'Lỗi tiếp nhận đăng ký tham gia đoàn thể' });
  }
});

app.delete('/api/admin/organizations/registrations/:id', verifyAuthMiddleware, (req: Request, res: Response) => {
  try {
    const list = dbManager.deleteOrganizationRegistration(req.params.id);
    res.json({ success: true, data: list, message: 'Xóa đơn đăng ký đoàn thể thành công' });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi xóa đơn đăng ký đoàn thể' });
  }
});

app.put('/api/admin/organizations/registrations/:id/status', verifyAuthMiddleware, (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Vui lòng cung cấp trạng thái' });
    }
    const updated = dbManager.updateOrganizationRegistrationStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ error: 'Không tìm thấy đơn đăng ký' });
    }
    res.json({ success: true, data: updated, message: 'Cập nhật trạng thái thành công' });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi cập nhật trạng thái' });
  }
});

// 12. Incident Reporting
app.post('/api/incidents', (req: Request, res: Response) => {
  try {
    const validation = validateIncidentInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.errors.join(', ') });
    }
    const report = dbManager.submitIncidentReport(req.body);
    res.json({
      success: true,
      data: report,
      message: `Đã tiếp nhận phản ánh. Mã theo dõi của bạn: ${report.reportCode}`,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi tiếp nhận phản ánh' });
  }
});

app.put('/api/admin/incidents/:id/status', verifyAuthMiddleware, (req: Request, res: Response) => {
  try {
    const { status, adminResponse } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Vui lòng chọn trạng thái xử lý' });
    }
    const updated = dbManager.updateIncidentStatus(req.params.id, status, adminResponse);
    if (!updated) {
      return res.status(404).json({ error: 'Không tìm thấy phản ánh' });
    }
    res.json({ success: true, data: updated, message: 'Cập nhật trạng thái phản ánh thành công' });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi cập nhật phản ánh' });
  }
});

app.delete('/api/admin/incidents/:id', verifyAuthMiddleware, (req: Request, res: Response) => {
  try {
    const list = dbManager.deleteIncidentReport(req.params.id);
    res.json({ success: true, data: list, message: 'Xóa phản ánh thành công' });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi xóa phản ánh' });
  }
});

// 13. Community Q&A
app.post('/api/qa/questions', (req: Request, res: Response) => {
  try {
    const { title, content, authorName, authorContact, category, categoryLabel } = req.body;
    if (!title || !content || !authorName) {
      return res.status(400).json({ error: 'Vui lòng nhập đầy đủ tiêu đề, nội dung câu hỏi và tên người gửi' });
    }
    const question = dbManager.submitQuestion({
      title,
      content,
      authorName,
      authorContact,
      category: category || 'other',
      categoryLabel: categoryLabel || 'Hỏi đáp chung',
    });
    res.json({ success: true, data: question, message: 'Gửi câu hỏi thành công' });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi gửi câu hỏi' });
  }
});

app.post('/api/qa/questions/:id/answers', (req: Request, res: Response) => {
  try {
    const { authorName, content } = req.body;
    if (!authorName || !content) {
      return res.status(400).json({ error: 'Vui lòng nhập họ tên và nội dung trả lời' });
    }
    const question = dbManager.addAnswer(req.params.id, {
      authorName,
      isOfficial: false,
      content,
    });
    if (!question) {
      return res.status(404).json({ error: 'Không tìm thấy câu hỏi' });
    }
    res.json({ success: true, data: question, message: 'Gửi phản hồi thành công' });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi gửi phản hồi' });
  }
});

app.post('/api/admin/qa/questions/:id/official-answer', verifyAuthMiddleware, (req: Request, res: Response) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Vui lòng nhập nội dung câu trả lời chính thức' });
    }
    const question = dbManager.addAnswer(req.params.id, {
      authorName: 'Ban Điều hành Khu phố 02',
      isOfficial: true,
      content,
    });
    if (!question) {
      return res.status(404).json({ error: 'Không tìm thấy câu hỏi' });
    }
    res.json({ success: true, data: question, message: 'Đã gửi phản hồi chính thức từ Ban Điều hành' });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi gửi phản hồi chính thức' });
  }
});

app.put('/api/admin/qa/questions/:id/pin', verifyAuthMiddleware, (req: Request, res: Response) => {
  try {
    const question = dbManager.togglePinQuestion(req.params.id);
    if (!question) {
      return res.status(404).json({ error: 'Không tìm thấy câu hỏi' });
    }
    res.json({ success: true, data: question, message: 'Đã cập nhật trạng thái ghim' });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi ghim câu hỏi' });
  }
});

app.delete('/api/admin/qa/questions/:id', verifyAuthMiddleware, (req: Request, res: Response) => {
  try {
    const list = dbManager.deleteQuestion(req.params.id);
    res.json({ success: true, data: list, message: 'Xóa câu hỏi thành công' });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi xóa câu hỏi' });
  }
});

app.delete('/api/admin/qa/questions/:id/answers/:answerId', verifyAuthMiddleware, (req: Request, res: Response) => {
  try {
    const updated = dbManager.deleteAnswer(req.params.id, req.params.answerId);
    if (!updated) {
      return res.status(404).json({ error: 'Không tìm thấy câu hỏi hoặc câu trả lời' });
    }
    res.json({ success: true, data: updated, message: 'Xóa câu trả lời thành công' });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi xóa câu trả lời' });
  }
});

// 14. Activities, Utilities, Organizations, Announcements CRUD
app.post('/api/admin/activities', verifyAuthMiddleware, (req: Request, res: Response) => {
  try {
    const validation = validateActivityInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.errors.join(', ') });
    }
    const activities = dbManager.saveActivity(req.body);
    res.json({ success: true, data: activities, message: 'Thêm hoạt động thành công' });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi lưu hoạt động' });
  }
});

app.put('/api/admin/activities/:id', verifyAuthMiddleware, (req: Request, res: Response) => {
  try {
    const activityData = { ...req.body, id: req.params.id };
    const validation = validateActivityInput(activityData);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.errors.join(', ') });
    }
    const activities = dbManager.saveActivity(activityData);
    res.json({ success: true, data: activities, message: 'Cập nhật hoạt động thành công' });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi cập nhật hoạt động' });
  }
});

app.delete('/api/admin/activities/:id', verifyAuthMiddleware, (req: Request, res: Response) => {
  try {
    const activities = dbManager.deleteActivity(req.params.id);
    res.json({ success: true, data: activities, message: 'Xóa hoạt động thành công' });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi xóa hoạt động' });
  }
});

app.post('/api/admin/utilities', verifyAuthMiddleware, (req: Request, res: Response) => {
  try {
    const validation = validateUtilityInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.errors.join(', ') });
    }
    const utilities = dbManager.saveUtility(req.body);
    res.json({ success: true, data: utilities, message: 'Thêm tiện ích số thành công' });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi lưu tiện ích số' });
  }
});

app.put('/api/admin/utilities/:id', verifyAuthMiddleware, (req: Request, res: Response) => {
  try {
    const utilityData = { ...req.body, id: req.params.id };
    const validation = validateUtilityInput(utilityData);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.errors.join(', ') });
    }
    const utilities = dbManager.saveUtility(utilityData);
    res.json({ success: true, data: utilities, message: 'Cập nhật tiện ích số thành công' });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi cập nhật tiện ích số' });
  }
});

app.delete('/api/admin/utilities/:id', verifyAuthMiddleware, (req: Request, res: Response) => {
  try {
    const utilities = dbManager.deleteUtility(req.params.id);
    res.json({ success: true, data: utilities, message: 'Xóa tiện ích số thành công' });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi xóa tiện ích số' });
  }
});

app.put('/api/admin/organizations/:id', verifyAuthMiddleware, (req: Request, res: Response) => {
  try {
    const orgData = { ...req.body, id: req.params.id };
    const organizations = dbManager.saveOrganization(orgData);
    res.json({ success: true, data: organizations, message: 'Cập nhật tổ chức thành công' });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi cập nhật tổ chức' });
  }
});

app.post('/api/admin/announcements', verifyAuthMiddleware, (req: Request, res: Response) => {
  try {
    if (!req.body.title || req.body.title.trim() === '') {
      return res.status(400).json({ error: 'Tiêu đề thông báo không được để trống' });
    }
    const announcements = dbManager.saveAnnouncement(req.body);
    res.json({ success: true, data: announcements, message: 'Đăng thông báo mới thành công' });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi lưu thông báo' });
  }
});

app.put('/api/admin/announcements/:id', verifyAuthMiddleware, (req: Request, res: Response) => {
  try {
    const annData = { ...req.body, id: req.params.id };
    const announcements = dbManager.saveAnnouncement(annData);
    res.json({ success: true, data: announcements, message: 'Cập nhật thông báo thành công' });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi cập nhật thông báo' });
  }
});

app.delete('/api/admin/announcements/:id', verifyAuthMiddleware, (req: Request, res: Response) => {
  try {
    const announcements = dbManager.deleteAnnouncement(req.params.id);
    res.json({ success: true, data: announcements, message: 'Xóa thông báo thành công' });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi xóa thông báo' });
  }
});

// 15. Backup and Restore
app.get('/api/admin/backup', verifyAuthMiddleware, (req: Request, res: Response) => {
  try {
    const result = dbManager.createBackup();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.send(JSON.stringify(result.data, null, 2));
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi tạo file sao lưu' });
  }
});

app.post('/api/admin/restore', verifyAuthMiddleware, (req: Request, res: Response) => {
  try {
    const result = dbManager.restoreBackup(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }
    res.json({ success: true, message: result.message });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi phục hồi dữ liệu sao lưu' });
  }
});

// ---------------- SERVER INITIALIZATION & VITE MIDDLEWARE ----------------

async function startServer() {
  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req: Request, res: Response) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[KHU PHO 02] Máy chủ đang vận hành tại http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Lỗi khởi động máy chủ:', err);
  process.exit(1);
});
