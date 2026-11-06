import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidUrl,
  isGoogleFormsUrl,
  formatNumberVietnamese,
  formatVietnameseDate,
  validateActivityInput,
  validateUtilityInput,
  validateDemographicsInput,
  hashAdminPassword,
  checkLoginRateLimit,
  isDocumentExpired,
  validateCommitteeMemberInput,
  validateOfficialDocumentInput,
  validateIncidentInput,
  extractPhoneDigits,
  isWithinReceivingHours,
  aggregateMonthlyStatistics,
  diffNewEventsAndIncidents,
  getApkPackageInfo,
} from './rules';

test('isValidUrl validates urls properly', () => {
  assert.equal(isValidUrl('https://dichvucong.gov.vn'), true);
  assert.equal(isValidUrl('http://phuongtanhung.hochiminhcity.gov.vn'), true);
  assert.equal(isValidUrl('/downloads/mau-ct01.pdf'), true);
  assert.equal(isValidUrl(''), true); // allow empty
  assert.equal(isValidUrl('invalid-url', false), false);
  assert.equal(isValidUrl('javascript:alert(1)', false), false);
});

test('isGoogleFormsUrl detects Google forms links', () => {
  assert.equal(isGoogleFormsUrl('https://docs.google.com/forms/d/e/1FAIpQLSc.../viewform'), true);
  assert.equal(isGoogleFormsUrl('https://forms.gle/xyz123'), true);
  assert.equal(isGoogleFormsUrl('https://facebook.com/group'), false);
  assert.equal(isGoogleFormsUrl(''), false);
});

test('formatNumberVietnamese formats thousands with dot', () => {
  assert.equal(formatNumberVietnamese(3842), '3.842');
  assert.equal(formatNumberVietnamese(968), '968');
  assert.equal(formatNumberVietnamese(1200500), '1.200.500');
  assert.equal(formatNumberVietnamese(0), '0');
});

test('formatVietnameseDate formats to dd/mm/yyyy', () => {
  const d = new Date('2025-11-15T08:00:00Z');
  const formatted = formatVietnameseDate(d);
  assert.match(formatted, /\d{2}\/\d{2}\/2025/);
});

test('isDocumentExpired accurately flags expired documents', () => {
  const pastDate = '2020-01-01';
  const futureDate = '2030-12-31';
  assert.equal(isDocumentExpired(pastDate), true);
  assert.equal(isDocumentExpired(futureDate), false);
  assert.equal(isDocumentExpired(''), false);
});

test('validateCommitteeMemberInput validates required officer fields', () => {
  const invalid = validateCommitteeMemberInput({ fullName: '' });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.length >= 3);

  const valid = validateCommitteeMemberInput({
    fullName: 'Nguyễn Văn Thành',
    position: 'Trưởng Ban Điều hành',
    phoneNumber: '0908123456',
    responsibility: 'Phụ trách chung và công tác chuyển đổi số',
  });
  assert.equal(valid.valid, true);
  assert.equal(valid.errors.length, 0);
});

test('validateOfficialDocumentInput validates required document fields', () => {
  const invalid = validateOfficialDocumentInput({ title: 'Kế hoạch' });
  assert.equal(invalid.valid, false);

  const valid = validateOfficialDocumentInput({
    documentNumber: '15/KH-UBND',
    title: 'Kế hoạch triển khai tiêm chủng mở rộng',
    issuingAuthority: 'UBND Phường Tân Hưng',
    expirationDate: '2026-12-31',
    fileUrl: '/uploads/ke-hoach.pdf',
  });
  assert.equal(valid.valid, true);
});

test('validateIncidentInput validates required incident fields', () => {
  const invalid = validateIncidentInput({ title: 'Cháy' });
  assert.equal(invalid.valid, false);

  const valid = validateIncidentInput({
    title: 'Nắp cống bị bể tại hẻm số 12',
    description: 'Nắp cống bị vỡ gây nguy hiểm cho người đi lại',
    locationAddress: 'Đầu hẻm 12 Đường số 9, KP2, Phường Tân Hưng',
    reporterName: 'Lê Văn An',
    reporterPhone: '0912345678',
  });
  assert.equal(valid.valid, true);
});

test('validateActivityInput catches missing required fields', () => {
  const invalid = validateActivityInput({ title: 'Họp', summary: 'Ngắn' });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.length >= 3);
});

test('validateUtilityInput validates categories and URLs', () => {
  const invalid = validateUtilityInput({
    name: 'VNeID',
    category: 'unknown-category',
    websiteUrl: 'htt://invalid',
  });
  assert.equal(invalid.valid, false);

  const valid = validateUtilityInput({
    name: 'Cổng Dịch vụ công Quốc gia',
    category: 'admin',
    websiteUrl: 'https://dichvucong.gov.vn',
  });
  assert.equal(valid.valid, true);
});

test('validateDemographicsInput enforces positive values', () => {
  const invalid = validateDemographicsInput({ totalResidents: -5, totalHouseholds: 100 });
  assert.equal(invalid.valid, false);

  const valid = validateDemographicsInput({
    totalResidents: 3842,
    totalHouseholds: 968,
    vneidLevel2Rate: 96.5,
  });
  assert.equal(valid.valid, true);
});

test('hashAdminPassword produces deterministic hash with salt', () => {
  const salt = 'kp2_salt_test_123';
  const hash1 = hashAdminPassword('Secret123!', salt);
  const hash2 = hashAdminPassword('Secret123!', salt);
  assert.equal(hash1, hash2);
  assert.equal(typeof hash1, 'string');
});

test('checkLoginRateLimit blocks access when locked', () => {
  const now = 1000000;
  const locked = checkLoginRateLimit(5, now + 30000, now);
  assert.equal(locked.isLocked, true);
  assert.equal(locked.remainingSeconds, 30);
});

test('extractPhoneDigits properly cleans numbers for tel: links', () => {
  assert.equal(extractPhoneDigits('028 3775 1234'), '02837751234');
  assert.equal(extractPhoneDigits('028 3771 5678 (Công an Phường Tân Hưng)'), '02837715678');
  assert.equal(extractPhoneDigits('0903.123.456'), '0903123456');
  assert.equal(extractPhoneDigits('+84 903 123 456'), '+84903123456');
  assert.equal(extractPhoneDigits('114'), '114');
  assert.equal(extractPhoneDigits('113'), '113');
  assert.equal(extractPhoneDigits(''), '');
  assert.equal(extractPhoneDigits(null), '');
});

test('isWithinReceivingHours determines open hours and off-hours correctly', () => {
  // Monday 09:00 -> within morning shift (07:30 - 11:30)
  const mondayMorning = new Date('2026-11-09T09:00:00'); // 2026-11-09 is a Monday
  assert.equal(isWithinReceivingHours(undefined, mondayMorning), true);

  // Monday 12:15 -> noon break (outside receiving hours)
  const mondayNoon = new Date('2026-11-09T12:15:00');
  assert.equal(isWithinReceivingHours(undefined, mondayNoon), false);

  // Monday 14:30 -> within afternoon shift (13:30 - 17:00)
  const mondayAfternoon = new Date('2026-11-09T14:30:00');
  assert.equal(isWithinReceivingHours(undefined, mondayAfternoon), true);

  // Monday 19:00 -> evening (outside receiving hours, routes to police)
  const mondayEvening = new Date('2026-11-09T19:00:00');
  assert.equal(isWithinReceivingHours(undefined, mondayEvening), false);

  // Sunday 10:00 -> Sunday is off (routes to police)
  const sunday = new Date('2026-11-08T10:00:00'); // 2026-11-08 is a Sunday
  assert.equal(isWithinReceivingHours(undefined, sunday), false);

  // Custom interval
  const custom = '08:00 - 10:00';
  assert.equal(isWithinReceivingHours(custom, mondayMorning), true);
  assert.equal(isWithinReceivingHours(custom, mondayAfternoon), false);
});

test('aggregateMonthlyStatistics calculates monthly performance and rates accurately', () => {
  const mockData = {
    programRegistrations: [
      { createdAt: '2026-11-01T10:00:00Z', status: 'confirmed', attendeeCount: 2 },
      { createdAt: '2026-11-03T14:00:00Z', status: 'pending', attendeeCount: 3 },
      { createdAt: '2026-10-15T09:00:00Z', status: 'confirmed', attendeeCount: 1 },
    ],
    incidentReports: [
      { createdAt: '2026-11-02T08:00:00Z', status: 'resolved' },
      { createdAt: '2026-11-04T11:00:00Z', status: 'in_progress' },
      { createdAt: '2026-10-20T12:00:00Z', status: 'resolved' },
    ],
    communityQuestions: [
      { createdAt: '2026-11-02T15:00:00Z', status: 'answered' },
      { createdAt: '2026-11-05T09:00:00Z', status: 'pending' },
    ],
    officialDocuments: [
      { issueDate: '2026-11-01', expirationDate: '2026-12-31' },
      { issueDate: '2026-10-01', expirationDate: '2026-10-15' },
    ],
  };

  // Filter for month 2026-11
  const nov = aggregateMonthlyStatistics(mockData, '2026-11');
  assert.equal(nov.activities.totalRegistrations, 2);
  assert.equal(nov.activities.confirmedRegistrations, 1);
  assert.equal(nov.activities.totalAttendees, 5);
  assert.equal(nov.incidents.totalIncidents, 2);
  assert.equal(nov.incidents.resolvedCount, 1);
  assert.equal(nov.incidents.resolutionRate, 50);
  assert.equal(nov.communityQA.totalQuestions, 2);
  assert.equal(nov.communityQA.answeredCount, 1);
  assert.equal(nov.communityQA.responseRate, 50);
  assert.equal(nov.documents.totalDocuments, 1);
  assert.equal(nov.documents.activeCount, 1);

  // All time
  const all = aggregateMonthlyStatistics(mockData, 'all');
  assert.equal(all.activities.totalRegistrations, 3);
  assert.equal(all.activities.totalAttendees, 6);
  assert.equal(all.incidents.totalIncidents, 3);
  assert.equal(all.incidents.resolvedCount, 2);
  assert.equal(all.incidents.resolutionRate, 67);
});

test('diffNewEventsAndIncidents detects new incidents, status changes, and new activities', () => {
  const prevIncidents = [
    { id: 'inc-1', title: 'Đèn đường hẻm 465 hỏng', status: 'received', statusLabel: 'Đã tiếp nhận' },
  ];
  const currIncidents = [
    { id: 'inc-1', title: 'Đèn đường hẻm 465 hỏng', status: 'resolved', statusLabel: 'Đã hoàn thành' },
    { id: 'inc-2', title: 'Cống nghẹt ngập nước', status: 'received', statusLabel: 'Đã tiếp nhận', locationAddress: 'Số 465/5' },
  ];
  const prevActivities = [
    { id: 'act-1', title: 'Họp mặt Chi bộ', timeRange: '08:00 10/11/2026' },
  ];
  const currActivities = [
    { id: 'act-1', title: 'Họp mặt Chi bộ', timeRange: '08:00 10/11/2026' },
    { id: 'act-2', title: 'Hội thi Tiếng hát Dân ca KP2', timeRange: '19:00 18/11/2026' },
  ];

  const notifications = diffNewEventsAndIncidents(prevIncidents, currIncidents, prevActivities, currActivities);
  assert.equal(notifications.length, 3);

  // Status update notification
  const statusUpdate = notifications.find((n) => n.id.startsWith('inc-update-inc-1'));
  assert.ok(statusUpdate);
  assert.equal(statusUpdate.type, 'success');
  assert.match(statusUpdate.message, /Đã hoàn thành/);

  // New incident notification
  const newIncident = notifications.find((n) => n.id.startsWith('inc-new-inc-2'));
  assert.ok(newIncident);
  assert.equal(newIncident.type, 'incident');
  assert.match(newIncident.message, /Cống nghẹt ngập nước/);

  // New activity notification
  const newActivity = notifications.find((n) => n.id.startsWith('act-new-act-2'));
  assert.ok(newActivity);
  assert.equal(newActivity.type, 'event');
  assert.match(newActivity.message, /Hội thi Tiếng hát Dân ca KP2/);
});

test('getApkPackageInfo returns valid Android APK download metadata', () => {
  const apk = getApkPackageInfo();
  assert.equal(apk.versionName, '1.2.0');
  assert.equal(apk.filename, 'KhuPho02_TanHung_v1.2.0.apk');
  assert.equal(apk.downloadUrl, '/api/download/apk');
  assert.equal(apk.packageName, 'vn.gov.tphcm.phuongtanhung.khupho02');
  assert.ok(apk.fileSizeMb > 0);
});
