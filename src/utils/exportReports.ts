/**
 * Bộ công cụ xuất báo cáo dữ liệu định dạng Word (.doc) và Excel (.csv / .xls)
 * Chuẩn hành chính nhà nước áp dụng mặc định theo quy chuẩn:
 * - Khổ giấy: A4, dọc (210mm x 297mm)
 * - Lề trên: 2 cm, Lề dưới: 2 cm, Lề trái: 3 cm, Lề phải: 2 cm
 * - Phông chữ: Times New Roman, Màu chữ: Đen
 * - Cỡ chữ nội dung: 14pt, Giãn dòng: Single, Khoảng cách đoạn: Trước 6pt, sau 6pt
 * - Tiêu ngữ: UBND PHƯỜNG TÂN HƯNG / KHU PHỐ 2 (Bỏ BAN ĐIỀU HÀNH)
 * - Nơi nhận: 12pt, đậm, nghiêng:
 *     - UBND Phường Tân Hưng;
 *     - Cấp ủy, Chi bộ Khu phố 2;
 *     - Ban Điều hành Khu phố 2;
 *     - Lưu: VPKP2.
 * - Chức danh ký: 14pt, in hoa, đậm | Họ tên: 14pt, đậm
 */

import {
  ProgramRegistration,
  OfficialDocument,
  IncidentReport,
  CommunityQuestion,
  Activity,
} from '../types';
import { formatVietnameseDate, MonthlyStatistics } from './rules';

/**
 * Xuất dữ liệu sang định dạng CSV có UTF-8 BOM để Excel hiển thị tiếng Việt chuẩn 100%
 */
export function generateCsvContent(headers: string[], rows: (string | number | undefined | null)[][]): string {
  const escapeCell = (val: string | number | undefined | null): string => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerRow = headers.map(escapeCell).join(',');
  const dataRows = rows.map((row) => row.map(escapeCell).join(',')).join('\r\n');

  // \uFEFF là UTF-8 Byte Order Mark để Microsoft Excel nhận diện UTF-8 tiếng Việt
  return `\uFEFF${headerRow}\r\n${dataRows}`;
}

/**
 * Tải tệp tải về máy người dùng
 */
export function downloadFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadCsvFile(filename: string, csvContent: string): void {
  downloadFile(filename, csvContent, 'text/csv;charset=utf-8;');
}

/**
 * Bộ CSS mẫu quy chuẩn văn bản hành chính theo đúng yêu cầu:
 * - Khổ giấy A4, dọc
 * - Lề trên 2 cm, dưới 2 cm, trái 3 cm, phải 2 cm
 * - Phông Times New Roman, màu Đen
 * - Cỡ chữ nội dung 14pt, giãn dòng Single, khoảng cách đoạn trước 6pt sau 6pt
 * - Tiêu đề chính: 14, in hoa, đậm
 * - Tiêu đề điều, mục: 14, đậm
 * - Nội dung căn cứ: 14, nghiêng
 * - Nơi nhận: 12, đậm, nghiêng
 * - Chức danh ký: 14, in hoa, đậm
 * - Họ tên: 14, đậm
 */
export const WORD_STANDARD_STYLES = `
  @page {
    size: 210mm 297mm;
    margin-top: 20mm;
    margin-bottom: 20mm;
    margin-left: 30mm;
    margin-right: 20mm;
    mso-page-orientation: portrait;
  }
  body {
    font-family: 'Times New Roman', Times, serif;
    font-size: 14pt;
    line-height: 1.15;
    color: #000000;
    margin: 0;
    padding: 0;
  }
  p, div.p {
    font-family: 'Times New Roman', Times, serif;
    font-size: 14pt;
    line-height: 1.15;
    color: #000000;
    margin-top: 6pt;
    margin-bottom: 6pt;
    text-align: justify;
    text-indent: 1.25cm;
  }
  .header-table {
    width: 100%;
    margin-top: 0;
    margin-bottom: 12pt;
    border-collapse: collapse;
  }
  .header-table td {
    vertical-align: top;
    text-align: center;
    padding: 0;
    color: #000000;
  }
  .org-parent {
    font-size: 13pt;
    font-weight: normal;
    text-transform: uppercase;
    color: #000000;
  }
  .org-title {
    font-size: 13pt;
    font-weight: bold;
    text-transform: uppercase;
    color: #000000;
  }
  .motto-title {
    font-size: 13pt;
    font-weight: bold;
    text-transform: uppercase;
    color: #000000;
  }
  .motto-sub {
    font-size: 14pt;
    font-weight: bold;
    color: #000000;
  }
  .date-line {
    font-size: 14pt;
    font-style: italic;
    margin-top: 6pt;
    margin-bottom: 6pt;
    color: #000000;
  }
  .doc-title {
    font-size: 14pt;
    font-weight: bold;
    text-align: center;
    text-transform: uppercase;
    margin-top: 12pt;
    margin-bottom: 6pt;
    color: #000000;
  }
  .doc-subtitle {
    font-size: 14pt;
    font-style: italic;
    text-align: center;
    margin-top: 0;
    margin-bottom: 12pt;
    color: #000000;
  }
  .section-heading {
    font-size: 14pt;
    font-weight: bold;
    margin-top: 12pt;
    margin-bottom: 6pt;
    color: #000000;
  }
  .legal-basis {
    font-size: 14pt;
    font-style: italic;
    margin-top: 6pt;
    margin-bottom: 6pt;
    text-indent: 1.25cm;
    color: #000000;
  }
  .signature-table {
    width: 100%;
    margin-top: 18pt;
    border-collapse: collapse;
  }
  .signature-table td {
    vertical-align: top;
    color: #000000;
  }
  .recipients-title {
    font-size: 12pt;
    font-weight: bold;
    font-style: italic;
    margin-top: 6pt;
    margin-bottom: 4pt;
    color: #000000;
  }
  .recipients-list {
    font-size: 11pt;
    font-style: normal;
    line-height: 1.25;
    color: #000000;
  }
  .sign-role {
    font-size: 14pt;
    font-weight: bold;
    text-transform: uppercase;
    text-align: center;
    color: #000000;
    margin-bottom: 4pt;
  }
  .sign-name {
    font-size: 14pt;
    font-weight: bold;
    text-align: center;
    color: #000000;
    margin-top: 50pt;
  }
  table.data-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 8pt;
    margin-bottom: 8pt;
    font-size: 12pt;
  }
  table.data-table th, table.data-table td {
    border: 1px solid #000000;
    padding: 6pt 6pt;
    color: #000000;
    vertical-align: middle;
  }
  table.data-table th {
    background-color: #f2f2f2;
    font-weight: bold;
    text-align: center;
  }
`;

export function downloadWordDoc(filename: string, htmlBody: string): void {
  const docContent = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>${filename}</title>
<style>
${WORD_STANDARD_STYLES}
</style>
</head>
<body>
  ${htmlBody}
</body>
</html>`;

  downloadFile(filename, docContent, 'application/msword;charset=utf-8;');
}

export function downloadExcelHtml(filename: string, htmlContent: string): void {
  const excelContent = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<style>
  table { border-collapse: collapse; font-family: 'Times New Roman', Times, serif; font-size: 11pt; }
  th { background-color: #1e3a8a; color: #ffffff; font-weight: bold; text-align: center; border: 1px solid #cbd5e1; padding: 8px; }
  td { border: 1px solid #cbd5e1; padding: 6px 8px; }
  .title-cell { font-size: 14pt; font-weight: bold; text-align: center; color: #1e3a8a; }
  .subtitle-cell { font-size: 10pt; font-style: italic; text-align: center; color: #64748b; }
  .header-left { text-align: center; font-weight: bold; font-size: 11pt; }
  .header-right { text-align: center; font-weight: bold; font-size: 11pt; }
  .number { text-align: right; }
  .center { text-align: center; }
  .badge-success { background-color: #dcfce7; color: #166534; font-weight: bold; }
  .badge-pending { background-color: #fef3c7; color: #92400e; font-weight: bold; }
</style>
</head>
<body>
${htmlContent}
</body>
</html>`;

  downloadFile(filename, excelContent, 'application/vnd.ms-excel;charset=utf-8;');
}

/**
 * Mẫu Tiêu ngữ chuẩn: Bỏ BAN ĐIỀU HÀNH, chỉ giữ lại KHU PHỐ 2
 */
function renderStandardHeader(docCode: string, currentDateStr: string) {
  const [day, month, year] = currentDateStr.split('/');
  return `
  <table class="header-table">
    <tr>
      <td style="width: 45%;">
        <div class="org-parent">UBND PHƯỜNG TÂN HƯNG</div>
        <div class="org-title">KHU PHỐ 2</div>
        <div style="font-size: 13pt; margin-top: 4pt; color: #000000;">${docCode}</div>
      </td>
      <td style="width: 55%;">
        <div class="motto-title">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
        <div class="motto-sub">Độc lập – Tự do – Hạnh phúc</div>
        <div class="date-line">
          Tân Hưng, ngày ${day} tháng ${month} năm ${year}
        </div>
      </td>
    </tr>
  </table>
  `;
}

/**
 * Mẫu Nơi nhận & Ký tên chuẩn:
 * Nơi nhận:
 * - UBND Phường Tân Hưng;
 * - Cấp ủy, Chi bộ Khu phố 2;
 * - Ban Điều hành Khu phố 2;
 * - Lưu: VPKP2.
 * Nơi nhận cỡ 12pt, đậm, nghiêng
 * Chức danh ký: 14pt, in hoa, đậm
 * Họ tên người ký: 14pt, đậm
 */
function renderStandardFooter(signerRole = 'TRƯỞNG KHU PHỐ', signerName = 'NGUYỄN VĂN THÀNH') {
  return `
  <table class="signature-table">
    <tr>
      <td style="width: 55%;">
        <div class="recipients-title">Nơi nhận:</div>
        <div class="recipients-list">
          - UBND Phường Tân Hưng;<br>
          - Cấp ủy, Chi bộ Khu phố 2;<br>
          - Ban Điều hành Khu phố 2;<br>
          - Lưu: VPKP2.
        </div>
      </td>
      <td style="width: 45%; text-align: center;">
        <div class="sign-role">TM. KHU PHỐ 2</div>
        <div class="sign-role">${signerRole}</div>
        <div class="sign-name">${signerName}</div>
      </td>
    </tr>
  </table>
  `;
}

/**
 * 1. BÁO CÁO TỔNG HỢP HIỆU QUẢ HOẠT ĐỘNG THEO THÁNG (WORD & EXCEL)
 */
export function exportMonthlySummaryReportWord(
  stats: MonthlyStatistics,
  monthYearLabel: string,
  extraDetails?: {
    activities?: Activity[];
    recentRegistrations?: ProgramRegistration[];
    incidents?: IncidentReport[];
    questions?: CommunityQuestion[];
  }
): void {
  const currentDateStr = formatVietnameseDate(new Date());

  const htmlBody = `
  ${renderStandardHeader('Số: .... /BC-KP2', currentDateStr)}

  <div class="doc-title">BÁO CÁO TỔNG HỢP KẾT QUẢ ĐIỀU HÀNH DÂN CƯ</div>
  <div class="doc-subtitle">Kỳ đánh giá: ${monthYearLabel} – Khu phố 2, Phường Tân Hưng</div>

  <div class="section-heading">I. TỔNG HỢP CHỈ SỐ HIỆU QUẢ HOẠT ĐỘNG TRỌNG TÂM</div>
  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 8%;">STT</th>
        <th style="width: 42%;">Chỉ tiêu nhiệm vụ dân cư</th>
        <th style="width: 25%;">Số liệu ghi nhận</th>
        <th style="width: 25%;">Đánh giá &amp; Tỷ lệ</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="text-align: center;">1</td>
        <td><strong>Lượt đăng ký tham gia hoạt động khu dân cư</strong></td>
        <td style="text-align: center;">${stats.activities.totalRegistrations} lượt (${stats.activities.totalAttendees} người tham dự)</td>
        <td style="text-align: center;">Đã xác nhận: <strong>${stats.activities.confirmedRegistrations}</strong> | Chờ duyệt: <strong>${stats.activities.pendingRegistrations}</strong></td>
      </tr>
      <tr>
        <td style="text-align: center;">2</td>
        <td><strong>Phản ánh sự cố &amp; Kiến nghị của nhân dân</strong></td>
        <td style="text-align: center;">${stats.incidents.totalIncidents} vụ việc tiếp nhận</td>
        <td style="text-align: center;">Đã xử lý xong: <strong>${stats.incidents.resolvedCount}</strong> (Tỷ lệ: <strong>${stats.incidents.resolutionRate}%</strong>)</td>
      </tr>
      <tr>
        <td style="text-align: center;">3</td>
        <td><strong>Hỏi đáp &amp; Tương tác giải quyết TTHC dân cư</strong></td>
        <td style="text-align: center;">${stats.communityQA.totalQuestions} câu hỏi tiếp nhận</td>
        <td style="text-align: center;">Đã trả lời: <strong>${stats.communityQA.answeredCount}</strong> (Tỷ lệ: <strong>${stats.communityQA.responseRate}%</strong>)</td>
      </tr>
      <tr>
        <td style="text-align: center;">4</td>
        <td><strong>Văn bản chỉ đạo khu phố đã ban hành</strong></td>
        <td style="text-align: center;">${stats.documents.totalDocuments} văn bản</td>
        <td style="text-align: center;">Còn hiệu lực: <strong>${stats.documents.activeCount}</strong> | Hết hạn: <strong>${stats.documents.expiredCount}</strong></td>
      </tr>
    </tbody>
  </table>

  <div class="section-heading">II. CHI TIẾT TÌNH HÌNH GIẢI QUYẾT PHẢN ÁNH SỰ CỐ &amp; KIẾN NGHỊ</div>
  <p>Trong kỳ báo cáo, Khu phố 2 đã tiếp nhận <strong>${stats.incidents.totalIncidents}</strong> phản ánh kiến nghị từ người dân về môi trường, trật tự đô thị, hạ tầng giao thông và an ninh trật tự. Đã chủ động phối hợp với Tổ tự quản và UBND Phường Tân Hưng giải quyết dứt điểm <strong>${stats.incidents.resolvedCount}</strong> vụ việc, đạt tỷ lệ <strong>${stats.incidents.resolutionRate}%</strong>.</p>

  <div class="section-heading">III. CÔNG TÁC PHONG TRÀO &amp; SỰ KIỆN CỘNG ĐỒNG</div>
  <p>Các phong trào thi đua và chương trình sinh hoạt cộng đồng được triển khai sâu rộng, ứng dụng công nghệ số ghi nhận <strong>${stats.activities.totalRegistrations}</strong> lượt đăng ký với <strong>${stats.activities.totalAttendees}</strong> lượt bà con nhân dân tham dự. Ban điều hành tiếp tục kiểm tra, phê duyệt xác nhận tham gia kịp thời, đảm bảo an toàn và đúng quy chế khu phố.</p>

  <div class="section-heading">IV. PHƯƠNG HƯỚNG NHIỆM VỤ THỜI GIAN TỚI</div>
  <p>1. Tăng cường tuyên truyền người dân sử dụng Cổng thông tin tiện ích số Khu phố 2 và định danh VNeID Mức 2.</p>
  <p>2. Duy trì trực ban tiếp nhận phản ánh hiện trường, giải quyết kịp thời 100% thắc mắc và kiến nghị chính đáng của nhân dân.</p>
  <p>3. Tổ chức các hoạt động văn hóa, văn nghệ, thể dục thể thao tạo sự gắn kết trong toàn thể bà con khu dân cư.</p>

  ${renderStandardFooter('TRƯỞNG KHU PHỐ', 'NGUYỄN VĂN THÀNH')}
  `;

  const cleanLabel = monthYearLabel.replace(/[^a-zA-Z0-9]/g, '_');
  downloadWordDoc(`Bao_cao_tong_hop_KP2_${cleanLabel}.doc`, htmlBody);
}

export function exportMonthlySummaryReportExcel(
  stats: MonthlyStatistics,
  monthYearLabel: string
): void {
  const currentDateStr = formatVietnameseDate(new Date());

  const htmlContent = `
  <table>
    <tr>
      <td colspan="4" class="header-left">UBND PHƯỜNG TÂN HƯNG - KHU PHỐ 2</td>
    </tr>
    <tr>
      <td colspan="4" class="title-cell">BÁO CÁO TỔNG HỢP HIỆU QUẢ HOẠT ĐỘNG DÂN CƯ</td>
    </tr>
    <tr>
      <td colspan="4" class="subtitle-cell">Kỳ báo cáo: ${monthYearLabel} - Ngày xuất dữ liệu: ${currentDateStr}</td>
    </tr>
    <tr><td></td></tr>
    <thead>
      <tr>
        <th>STT</th>
        <th>Hạng mục nhiệm vụ</th>
        <th>Số lượng ghi nhận</th>
        <th>Chỉ số chi tiết &amp; Tỷ lệ hoàn thành</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="center">1</td>
        <td><b>Lượt đăng ký tham gia hoạt động cộng đồng</b></td>
        <td class="center">${stats.activities.totalRegistrations} lượt (${stats.activities.totalAttendees} người)</td>
        <td>Đã xác nhận: ${stats.activities.confirmedRegistrations} | Chờ duyệt: ${stats.activities.pendingRegistrations} | Từ chối: ${stats.activities.rejectedRegistrations}</td>
      </tr>
      <tr>
        <td class="center">2</td>
        <td><b>Phản ánh sự cố &amp; Kiến nghị của nhân dân</b></td>
        <td class="center">${stats.incidents.totalIncidents} phản ánh</td>
        <td>Đã giải quyết: <b>${stats.incidents.resolvedCount}</b> (${stats.incidents.resolutionRate}%) | Đang giải quyết: ${stats.incidents.inProgressCount} | Mới tiếp nhận: ${stats.incidents.receivedCount}</td>
      </tr>
      <tr>
        <td class="center">3</td>
        <td><b>Hỏi đáp &amp; Tương tác giải quyết TTHC</b></td>
        <td class="center">${stats.communityQA.totalQuestions} câu hỏi</td>
        <td>Đã giải đáp chính thức: <b>${stats.communityQA.answeredCount}</b> (${stats.communityQA.responseRate}%) | Chờ trả lời: ${stats.communityQA.pendingCount}</td>
      </tr>
      <tr>
        <td class="center">4</td>
        <td><b>Văn bản chỉ đạo khu phố ban hành</b></td>
        <td class="center">${stats.documents.totalDocuments} văn bản</td>
        <td>Đang hiệu lực: <b>${stats.documents.activeCount}</b> | Đã hết hiệu lực: ${stats.documents.expiredCount}</td>
      </tr>
    </tbody>
  </table>
  `;

  const cleanLabel = monthYearLabel.replace(/[^a-zA-Z0-9]/g, '_');
  downloadExcelHtml(`Bao_cao_tong_hop_KP2_${cleanLabel}.xls`, htmlContent);
}

/**
 * 2. XUẤT DANH SÁCH ĐĂNG KÝ THAM GIA HOẠT ĐỘNG (WORD & EXCEL/CSV)
 */
export function exportProgramRegistrationsCsv(
  registrations: ProgramRegistration[],
  filterActivityTitle?: string
): void {
  const headers = [
    'STT',
    'Chương trình hoạt động',
    'Họ và tên người đăng ký',
    'Số điện thoại',
    'Địa chỉ / Nơi cư trú tại KP2',
    'Số người cùng tham gia',
    'Ghi chú / Đề xuất',
    'Trạng thái phê duyệt',
    'Thời gian đăng ký',
    'Thời gian phê duyệt',
  ];

  const rows = registrations.map((r, idx) => {
    let statusText = 'Chưa xác nhận (Không thể tham gia)';
    if (r.status === 'confirmed') statusText = 'ĐÃ XÁC NHẬN THAM GIA';
    else if (r.status === 'rejected') statusText = 'Từ chối';

    return [
      idx + 1,
      r.activityTitle || filterActivityTitle || 'Hoạt động khu phố',
      r.fullName,
      r.phoneNumber,
      r.neighborhoodGroup || 'Khu phố 2',
      r.attendeeCount || 1,
      r.notes || '',
      statusText,
      r.createdAt ? formatVietnameseDate(r.createdAt) : '',
      r.confirmedAt ? formatVietnameseDate(r.confirmedAt) : '',
    ];
  });

  const nowStr = new Date().toISOString().split('T')[0];
  const filename = `Danh_sach_dang_ky_tham_gia_hoat_dong_KP2_${nowStr}.csv`;
  const content = generateCsvContent(headers, rows);
  downloadCsvFile(filename, content);
}

export function exportProgramRegistrationsWord(
  registrations: ProgramRegistration[],
  filterActivityTitle?: string
): void {
  const currentDateStr = formatVietnameseDate(new Date());

  const rowsHtml = registrations.map((r, idx) => {
    const isConfirmed = r.status === 'confirmed';
    const statusText = isConfirmed ? 'ĐÃ XÁC NHẬN' : r.status === 'rejected' ? 'Từ chối' : 'Chưa xác nhận';
    const statusBg = isConfirmed ? '#dcfce7' : r.status === 'rejected' ? '#fee2e2' : '#fef3c7';
    return `<tr>
      <td style="text-align: center;">${idx + 1}</td>
      <td><strong>${r.fullName}</strong></td>
      <td style="text-align: center;">${r.phoneNumber}</td>
      <td>${r.neighborhoodGroup || 'Khu phố 2'}</td>
      <td style="text-align: center;"><strong>${r.attendeeCount || 1}</strong></td>
      <td>${r.activityTitle || filterActivityTitle || 'Hoạt động'}</td>
      <td style="text-align: center; background-color: ${statusBg}; font-weight: bold;">${statusText}</td>
      <td style="font-size: 11pt;">${r.notes || ''}</td>
    </tr>`;
  }).join('');

  const htmlBody = `
  ${renderStandardHeader('Số: .... /DS-KP2', currentDateStr)}

  <div class="doc-title">DANH SÁCH NGƯỜI DÂN ĐĂNG KÝ THAM GIA HOẠT ĐỘNG</div>
  <div class="doc-subtitle">${filterActivityTitle ? `Chương trình: ${filterActivityTitle} | ` : ''}Khu phố 2 – Ngày lập: ${currentDateStr} (Tổng số: ${registrations.length} lượt)</div>

  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 5%;">STT</th>
        <th style="width: 18%;">Họ và tên</th>
        <th style="width: 13%;">Số điện thoại</th>
        <th style="width: 20%;">Địa chỉ cư trú tại KP2</th>
        <th style="width: 8%;">Số người</th>
        <th style="width: 18%;">Chương trình</th>
        <th style="width: 12%;">Trạng thái</th>
        <th style="width: 16%;">Ghi chú</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml || '<tr><td colspan="8" style="text-align:center;">Chưa có lượt đăng ký nào.</td></tr>'}
    </tbody>
  </table>

  ${renderStandardFooter('TRƯỞNG KHU PHỐ', 'NGUYỄN VĂN THÀNH')}
  `;

  const nowStr = new Date().toISOString().split('T')[0];
  downloadWordDoc(`Danh_sach_dang_ky_tham_gia_KP2_${nowStr}.doc`, htmlBody);
}

/**
 * 3. XUẤT BÁO CÁO VĂN BẢN ĐÃ BAN HÀNH (WORD & EXCEL/CSV)
 */
export function exportOfficialDocumentsCsv(documents: OfficialDocument[]): void {
  const headers = [
    'STT',
    'Số ký hiệu văn bản',
    'Trích yếu / Tên văn bản',
    'Cơ quan ban hành',
    'Ngày ban hành',
    'Ngày hết hiệu lực',
    'Tình trạng hiệu lực',
    'Tóm tắt nội dung',
  ];

  const now = new Date();
  const rows = documents.map((doc, idx) => {
    const isExpired = doc.expirationDate && new Date(doc.expirationDate) < now;
    return [
      idx + 1,
      doc.documentNumber,
      doc.title,
      doc.issuingAuthority || 'Khu phố 2 – Phường Tân Hưng',
      doc.issueDate ? formatVietnameseDate(doc.issueDate) : '',
      doc.expirationDate ? formatVietnameseDate(doc.expirationDate) : 'Thường trực',
      isExpired ? 'Hết hiệu lực' : 'Đang hiệu lực',
      doc.summary || '',
    ];
  });

  const nowStr = new Date().toISOString().split('T')[0];
  const filename = `Bao_cao_van_ban_da_ban_hanh_KP2_${nowStr}.csv`;
  const content = generateCsvContent(headers, rows);
  downloadCsvFile(filename, content);
}

export function exportOfficialDocumentsWord(documents: OfficialDocument[]): void {
  const currentDateStr = formatVietnameseDate(new Date());
  const now = new Date();

  const rowsHtml = documents.map((doc, idx) => {
    const isExpired = doc.expirationDate && new Date(doc.expirationDate) < now;
    return `<tr>
      <td style="text-align: center;">${idx + 1}</td>
      <td style="text-align: center;"><strong>${doc.documentNumber}</strong></td>
      <td><strong>${doc.title}</strong></td>
      <td style="text-align: center;">${doc.issuingAuthority || 'UBND Phường Tân Hưng'}</td>
      <td style="text-align: center;">${doc.issueDate ? formatVietnameseDate(doc.issueDate) : ''}</td>
      <td style="text-align: center;">${doc.expirationDate ? formatVietnameseDate(doc.expirationDate) : 'Thường trực'}</td>
      <td style="text-align: center; font-weight: bold; color: ${isExpired ? '#b91c1c' : '#15803d'};">
        ${isExpired ? 'Hết hiệu lực' : 'Đang hiệu lực'}
      </td>
    </tr>`;
  }).join('');

  const htmlBody = `
  ${renderStandardHeader('Số: .... /BC-VB-KP2', currentDateStr)}

  <div class="doc-title">BÁO CÁO DANH MỤC VĂN BẢN ĐÃ BAN HÀNH</div>
  <div class="doc-subtitle">Hệ thống văn bản chỉ đạo điều hành Khu phố 2 – Ngày xuất: ${currentDateStr} (Tổng số: ${documents.length} văn bản)</div>

  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 5%;">STT</th>
        <th style="width: 14%;">Số ký hiệu</th>
        <th style="width: 32%;">Trích yếu văn bản</th>
        <th style="width: 18%;">Cơ quan ban hành</th>
        <th style="width: 11%;">Ngày ban hành</th>
        <th style="width: 11%;">Ngày hết hạn</th>
        <th style="width: 11%;">Tình trạng</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml || '<tr><td colspan="7" style="text-align:center;">Chưa có văn bản nào.</td></tr>'}
    </tbody>
  </table>

  ${renderStandardFooter('TRƯỞNG KHU PHỐ', 'NGUYỄN VĂN THÀNH')}
  `;

  const nowStr = new Date().toISOString().split('T')[0];
  downloadWordDoc(`Bao_cao_van_ban_da_ban_hanh_KP2_${nowStr}.doc`, htmlBody);
}

/**
 * 4. XUẤT BÁO CÁO PHẢN ÁNH SỰ CỐ & KIẾN NGHỊ (WORD & EXCEL/CSV)
 */
export function exportIncidentReportsCsv(incidents: IncidentReport[]): void {
  const headers = [
    'STT',
    'Mã phản ánh',
    'Tiêu đề phản ánh',
    'Lĩnh vực',
    'Địa điểm xảy ra',
    'Người gửi phản ánh',
    'Số điện thoại',
    'Thời gian gửi',
    'Trạng thái giải quyết',
    'Nội dung phản ánh',
    'Kết quả / Ý kiến xử lý của Ban Điều hành',
  ];

  const rows = incidents.map((inc, idx) => {
    let statusText = 'Tiếp nhận mới';
    if (inc.status === 'in_progress') statusText = 'Đang giải quyết';
    else if (inc.status === 'resolved') statusText = 'Đã xử lý xong';
    else if (inc.status === 'rejected') statusText = 'Không thuộc thẩm quyền';

    return [
      idx + 1,
      inc.reportCode || `PA-${idx + 1}`,
      inc.title,
      inc.categoryLabel || inc.category,
      inc.locationAddress || 'Khu phố 2',
      inc.reporterName,
      inc.reporterPhone,
      inc.createdAt ? formatVietnameseDate(inc.createdAt) : '',
      statusText,
      inc.description,
      inc.adminResponse || 'Chưa có phản hồi',
    ];
  });

  const nowStr = new Date().toISOString().split('T')[0];
  const filename = `Bao_cao_phan_anh_su_co_kien_nghi_KP2_${nowStr}.csv`;
  const content = generateCsvContent(headers, rows);
  downloadCsvFile(filename, content);
}

export function exportIncidentReportsWord(incidents: IncidentReport[]): void {
  const currentDateStr = formatVietnameseDate(new Date());

  const rowsHtml = incidents.map((inc, idx) => {
    const isResolved = inc.status === 'resolved';
    const statusText = isResolved ? 'ĐÃ XỬ LÝ XONG' : inc.status === 'in_progress' ? 'Đang giải quyết' : 'Tiếp nhận mới';
    const statusBg = isResolved ? '#dcfce7' : inc.status === 'in_progress' ? '#e0f2fe' : '#fef3c7';

    return `<tr>
      <td style="text-align: center;">${idx + 1}</td>
      <td style="text-align: center;"><strong>${inc.reportCode || `PA-${idx + 1}`}</strong></td>
      <td><strong>${inc.title}</strong><br><span style="font-size: 11pt; color: #334155;">${inc.description}</span></td>
      <td>${inc.locationAddress}</td>
      <td style="text-align: center;">${inc.reporterName}<br><span style="font-size: 11pt;">${inc.reporterPhone}</span></td>
      <td style="text-align: center;">${inc.createdAt ? formatVietnameseDate(inc.createdAt) : ''}</td>
      <td style="text-align: center; background-color: ${statusBg}; font-weight: bold;">${statusText}</td>
      <td style="font-size: 11pt;">${inc.adminResponse || 'Đang phối hợp giải quyết'}</td>
    </tr>`;
  }).join('');

  const htmlBody = `
  ${renderStandardHeader('Số: .... /BC-PA-KP2', currentDateStr)}

  <div class="doc-title">BÁO CÁO TÌNH HÌNH PHẢN ÁNH SỰ CỐ &amp; KIẾN NGHỊ CỦA DÂN CƯ</div>
  <div class="doc-subtitle">Khu phố 2, Phường Tân Hưng – Ngày báo cáo: ${currentDateStr} (Tổng số: ${incidents.length} phản ánh)</div>

  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 5%;">STT</th>
        <th style="width: 10%;">Mã phản ánh</th>
        <th style="width: 25%;">Nội dung sự việc kiến nghị</th>
        <th style="width: 15%;">Vị trí xảy ra</th>
        <th style="width: 12%;">Người báo</th>
        <th style="width: 10%;">Thời gian</th>
        <th style="width: 12%;">Trạng thái</th>
        <th style="width: 15%;">Kết quả xử lý</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml || '<tr><td colspan="8" style="text-align:center;">Chưa có phản ánh sự cố nào.</td></tr>'}
    </tbody>
  </table>

  ${renderStandardFooter('TRƯỞNG KHU PHỐ', 'NGUYỄN VĂN THÀNH')}
  `;

  const nowStr = new Date().toISOString().split('T')[0];
  downloadWordDoc(`Bao_cao_phan_anh_su_co_KP2_${nowStr}.doc`, htmlBody);
}

/**
 * 5. XUẤT BÁO CÁO HỎI ĐÁP DÂN CƯ (WORD & EXCEL/CSV)
 */
export function exportCommunityQACsv(questions: CommunityQuestion[]): void {
  const headers = [
    'STT',
    'Tiêu đề câu hỏi',
    'Người gửi câu hỏi',
    'Lĩnh vực',
    'Ngày gửi',
    'Trạng thái',
    'Số câu trả lời',
    'Nội dung câu hỏi',
    'Câu trả lời chính thức của Ban Điều hành',
  ];

  const rows = questions.map((q, idx) => {
    const officialAnswer = (q.answers || []).find((a) => a.isOfficial)?.content || '';
    let statusText = 'Chờ giải đáp';
    if (q.status === 'answered') statusText = 'Đã giải đáp';
    else if (q.status === 'closed') statusText = 'Đã đóng';

    return [
      idx + 1,
      q.title,
      q.authorName,
      q.categoryLabel || q.category,
      q.createdAt ? formatVietnameseDate(q.createdAt) : '',
      statusText,
      q.answers ? q.answers.length : 0,
      q.content,
      officialAnswer || 'Đang xác minh trả lời',
    ];
  });

  const nowStr = new Date().toISOString().split('T')[0];
  const filename = `Bao_cao_tinh_hinh_hoi_dap_dan_cu_KP2_${nowStr}.csv`;
  const content = generateCsvContent(headers, rows);
  downloadCsvFile(filename, content);
}

export function exportCommunityQAWord(questions: CommunityQuestion[]): void {
  const currentDateStr = formatVietnameseDate(new Date());

  const rowsHtml = questions.map((q, idx) => {
    const officialAnswer = (q.answers || []).find((a) => a.isOfficial)?.content || '';
    const isAnswered = q.status === 'answered' || Boolean(officialAnswer);

    return `<tr>
      <td style="text-align: center;">${idx + 1}</td>
      <td><strong>${q.title}</strong><br><span style="font-size: 11pt; color: #334155;">${q.content}</span></td>
      <td style="text-align: center;">${q.authorName}</td>
      <td style="text-align: center;">${q.categoryLabel || q.category}</td>
      <td style="text-align: center;">${q.createdAt ? formatVietnameseDate(q.createdAt) : ''}</td>
      <td style="text-align: center; font-weight: bold; background-color: ${isAnswered ? '#dcfce7' : '#fef3c7'};">
        ${isAnswered ? 'ĐÃ GIẢI ĐÁP' : 'Chờ giải đáp'}
      </td>
      <td style="font-size: 11pt;">${officialAnswer || 'Đang xác minh và trả lời'}</td>
    </tr>`;
  }).join('');

  const htmlBody = `
  ${renderStandardHeader('Số: .... /BC-HD-KP2', currentDateStr)}

  <div class="doc-title">BÁO CÁO TÌNH HÌNH HỎI ĐÁP &amp; ĐỐI THOẠI VỚI DÂN CƯ</div>
  <div class="doc-subtitle">Khu phố 2, Phường Tân Hưng – Ngày xuất: ${currentDateStr} (Tổng số: ${questions.length} câu hỏi)</div>

  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 5%;">STT</th>
        <th style="width: 25%;">Câu hỏi của người dân</th>
        <th style="width: 12%;">Người hỏi</th>
        <th style="width: 12%;">Lĩnh vực</th>
        <th style="width: 10%;">Ngày gửi</th>
        <th style="width: 12%;">Trạng thái</th>
        <th style="width: 24%;">Giải đáp chính thức</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml || '<tr><td colspan="7" style="text-align:center;">Chưa có câu hỏi nào.</td></tr>'}
    </tbody>
  </table>

  ${renderStandardFooter('TRƯỞNG KHU PHỐ', 'NGUYỄN VĂN THÀNH')}
  `;

  const nowStr = new Date().toISOString().split('T')[0];
  downloadWordDoc(`Bao_cao_hoi_dap_dan_cu_KP2_${nowStr}.doc`, htmlBody);
}

/**
 * 6. XUẤT BÁO CÁO HOẠT ĐỘNG & SỰ KIỆN (WORD & EXCEL/CSV)
 */
export function exportActivitiesCsv(activities: Activity[]): void {
  const headers = [
    'STT',
    'Tên hoạt động / Sự kiện',
    'Lĩnh vực',
    'Thời gian tổ chức',
    'Địa điểm tổ chức',
    'Đơn vị chủ trì / Tổ chức',
    'Tình trạng tổ chức',
    'Ghim trên trang chủ',
    'Nội dung tóm tắt',
  ];

  const rows = activities.map((act, idx) => {
    let statusText = 'Sắp diễn ra';
    if (act.status === 'ongoing') statusText = 'Đang triển khai';
    else if (act.status === 'completed') statusText = 'Đã hoàn thành';

    return [
      idx + 1,
      act.title,
      act.categoryLabel || act.category,
      act.time,
      act.location,
      act.organizer || 'Khu phố 2',
      statusText,
      'Thường trực (Ghim liên tục)',
      act.summary || '',
    ];
  });

  const nowStr = new Date().toISOString().split('T')[0];
  const filename = `Bao_cao_danh_sach_hoat_dong_su_kien_KP2_${nowStr}.csv`;
  const content = generateCsvContent(headers, rows);
  downloadCsvFile(filename, content);
}

export function exportActivitiesWord(activities: Activity[]): void {
  const currentDateStr = formatVietnameseDate(new Date());

  const rowsHtml = activities.map((act, idx) => {
    const statusText = act.status === 'ongoing' ? 'Đang triển khai' : act.status === 'completed' ? 'Đã hoàn thành' : 'Sắp diễn ra';
    const statusBg = act.status === 'ongoing' ? '#dcfce7' : act.status === 'completed' ? '#f1f5f9' : '#e0f2fe';

    return `<tr>
      <td style="text-align: center;">${idx + 1}</td>
      <td><strong>${act.title}</strong><br><span style="font-size: 11pt; color: #334155;">${act.summary}</span></td>
      <td style="text-align: center;">${act.categoryLabel || act.category}</td>
      <td style="text-align: center;">${act.time}</td>
      <td>${act.location}</td>
      <td style="text-align: center;">${act.organizer}</td>
      <td style="text-align: center; background-color: ${statusBg}; font-weight: bold;">${statusText}</td>
    </tr>`;
  }).join('');

  const htmlBody = `
  ${renderStandardHeader('Số: .... /BC-HĐ-KP2', currentDateStr)}

  <div class="doc-title">BÁO CÁO DANH MỤC HOẠT ĐỘNG &amp; SỰ KIỆN KHU DÂN CƯ</div>
  <div class="doc-subtitle">Khu phố 2, Phường Tân Hưng – Ngày xuất: ${currentDateStr} (Tổng số: ${activities.length} hoạt động)</div>

  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 5%;">STT</th>
        <th style="width: 25%;">Tên hoạt động / Phong trào</th>
        <th style="width: 12%;">Lĩnh vực</th>
        <th style="width: 15%;">Thời gian</th>
        <th style="width: 18%;">Địa điểm</th>
        <th style="width: 13%;">Đơn vị chủ trì</th>
        <th style="width: 12%;">Trạng thái</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml || '<tr><td colspan="7" style="text-align:center;">Chưa có hoạt động nào.</td></tr>'}
    </tbody>
  </table>

  ${renderStandardFooter('TRƯỞNG KHU PHỐ', 'NGUYỄN VĂN THÀNH')}
  `;

  const nowStr = new Date().toISOString().split('T')[0];
  downloadWordDoc(`Bao_cao_danh_sach_hoat_dong_KP2_${nowStr}.doc`, htmlBody);
}
