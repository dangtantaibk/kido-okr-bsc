# User Stories - KIDO OKR-BSC

Tài liệu này tổng hợp user story theo chuẩn PO để đội dev bắt đầu triển khai, bám sát các specs trong `docs/specs`.

---

## Epic 1: Nền tảng dữ liệu

### US-01: Thiết lập schema và migration Supabase
**User story:** Là Admin hệ thống, tôi muốn có schema DB đầy đủ để dữ liệu chiến lược được lưu trữ nhất quán.

**Tiêu chí chấp nhận:**
- [ ] Given môi trường Supabase mới, When chạy toàn bộ migrations, Then tất cả bảng/enums/indexes được tạo đúng theo schema.
- [ ] Given các bảng có quan hệ FK, When chạy migrations theo thứ tự, Then không có lỗi phụ thuộc.
- [ ] Given migration hoàn tất, When chạy seed, Then dữ liệu mẫu được insert không lỗi.

**Ưu tiên:** Cao  
**Phụ thuộc:** Không

### US-02: Chuẩn hóa mock data liên kết đầy đủ
**User story:** Là Developer, tôi muốn mock data có liên kết chuẩn để UI có thể hiển thị luồng dữ liệu end-to-end.

**Tiêu chí chấp nhận:**
- [ ] Given các entity OGSM/OKR/KPI/Action/Fishbone, When kiểm tra ID tham chiếu, Then không có dữ liệu mồ côi.
- [ ] Given mock data, When render UI theo từng trang, Then các liên kết (Goal ↔ KPI ↔ OKR ↔ Action) hiển thị đúng.
- [ ] Given mock data, When cập nhật một phần tử liên kết, Then các màn liên quan vẫn tra cứu được ID hợp lệ.

**Ưu tiên:** Cao  
**Phụ thuộc:** US-01

### US-03: Định nghĩa TypeScript types thống nhất
**User story:** Là Developer, tôi muốn có TypeScript types chuẩn để tránh lệch schema và tăng tốc phát triển UI.

**Tiêu chí chấp nhận:**
- [ ] Given toàn bộ interfaces, When build TypeScript, Then không có lỗi type.
- [ ] Given type exports, When import từ `@/types`, Then IDE có đầy đủ IntelliSense.
- [ ] Given schema cập nhật, When đối chiếu types, Then tên field và optionality nhất quán.

**Ưu tiên:** Cao  
**Phụ thuộc:** US-01

### US-04: Cấu hình Supabase client và query helpers
**User story:** Là Developer, tôi muốn có client và query helpers để truy vấn dữ liệu một cách type-safe.

**Tiêu chí chấp nhận:**
- [ ] Given Supabase client, When truy vấn danh sách Objective/Goal, Then dữ liệu trả về đúng kiểu.
- [ ] Given query helpers, When gọi các query chính (OGSM/OKR/KPI/CSF/Actions/Reviews), Then có xử lý lỗi rõ ràng.
- [ ] Given môi trường server/client, When chạy SSR/CSR, Then không lỗi kết nối.

**Ưu tiên:** Cao  
**Phụ thuộc:** US-03

### US-05: Áp dụng RLS theo tổ chức
**User story:** Là Admin hệ thống, tôi muốn người dùng chỉ truy cập dữ liệu của tổ chức mình để đảm bảo bảo mật.

**Tiêu chí chấp nhận:**
- [ ] Given RLS bật cho tất cả bảng, When user A truy vấn dữ liệu org B, Then bị từ chối.
- [ ] Given RLS policy, When user truy vấn dữ liệu org của mình, Then truy cập bình thường.
- [ ] Given các bảng liên quan, When join dữ liệu đa bảng, Then không lộ dữ liệu chéo org.

**Ưu tiên:** Cao  
**Phụ thuộc:** US-01

---

## Epic 2: UI Foundation

### US-06: Xây dựng design tokens và theme
**User story:** Là Product Designer, tôi muốn hệ thống màu sắc nhất quán để các trang BSC đồng bộ.

**Tiêu chí chấp nhận:**
- [ ] Given theme tokens, When render UI, Then màu theo perspective hiển thị đúng.
- [ ] Given status/priority, When hiển thị badge, Then dùng đúng màu và label.
- [ ] Given responsive layouts, When xem trên mobile/desktop, Then spacing và typography nhất quán.

**Ưu tiên:** Trung bình  
**Phụ thuộc:** Không

### US-07: Shared UI components chuẩn hóa
**User story:** Là Developer, tôi muốn có bộ component dùng chung để build nhanh các màn hình.

**Tiêu chí chấp nhận:**
- [ ] Given shared components, When dùng trong trang OGSM/OKR/KPI, Then render đúng props.
- [ ] Given accessibility, When kiểm tra ARIA/keyboard, Then component hoạt động đúng.
- [ ] Given theme tokens, When đổi perspective/status, Then style tự cập nhật.

**Ưu tiên:** Trung bình  
**Phụ thuộc:** US-06

### US-08: Layout và navigation
**User story:** Là User, tôi muốn điều hướng nhanh giữa các module để theo dõi chiến lược hiệu quả.

**Tiêu chí chấp nhận:**
- [ ] Given sidebar, When xem trên desktop, Then hiển thị đầy đủ menu và badge counts.
- [ ] Given mobile, When mở sidebar, Then sidebar responsive và đóng/mở được.
- [ ] Given header, When vào trang con, Then breadcrumb hiển thị đúng đường dẫn.

**Ưu tiên:** Trung bình  
**Phụ thuộc:** US-07

---

## Epic 3: OGSM Company & Department

### US-09: OGSM Company - List view
**User story:** Là CEO/Director, tôi muốn xem OGSM cấp công ty theo 4 perspective để nắm tổng thể chiến lược.

**Tiêu chí chấp nhận:**
- [ ] Given dữ liệu objectives/goals/strategies/measures, When mở trang OGSM, Then hiển thị đầy đủ theo O → G → S → M.
- [ ] Given goal có tiến độ, When xem chi tiết, Then progress bar và status hiển thị đúng.
- [ ] Given measure badge, When click, Then điều hướng đến KPI liên quan.

**Ưu tiên:** Cao  
**Phụ thuộc:** US-04, US-07

### US-10: OGSM Company - Graph view
**User story:** Là CEO/Director, tôi muốn xem OGSM dưới dạng sơ đồ để hiểu quan hệ nhân quả.

**Tiêu chí chấp nhận:**
- [ ] Given graph view, When pan/zoom, Then thao tác mượt.
- [ ] Given nodes O/G/S/M, When click, Then hiển thị thông tin chi tiết.
- [ ] Given dữ liệu lớn, When render graph, Then không bị treo UI.

**Ưu tiên:** Trung bình  
**Phụ thuộc:** US-09

### US-11: OGSM Department
**User story:** Là Head of Department, tôi muốn xem OGSM phòng ban và liên kết goal công ty để đảm bảo alignment.

**Tiêu chí chấp nhận:**
- [ ] Given bảng OGSM phòng ban, When filter theo department/purpose, Then danh sách cập nhật đúng.
- [ ] Given linked goal, When hiển thị, Then có chỉ báo liên kết rõ ràng.
- [ ] Given progress, When xem bảng, Then tiến độ từng phòng ban hiển thị đúng.

**Ưu tiên:** Cao  
**Phụ thuộc:** US-04, US-07

---

## Epic 4: Strategy Map

### US-12: Strategy Map theo BSC
**User story:** Là Strategy Lead, tôi muốn xem bản đồ chiến lược 4 lớp để đánh giá quan hệ cause-effect.

**Tiêu chí chấp nhận:**
- [ ] Given data nodes/edges, When mở Strategy Map, Then 4 layers BSC hiển thị rõ.
- [ ] Given node status, When render node, Then màu sắc phản ánh trạng thái.
- [ ] Given click node, When mở detail panel, Then hiển thị goal liên quan và progress.

**Ưu tiên:** Trung bình  
**Phụ thuộc:** US-04, US-07

---

## Epic 5: OKRs

### US-13: OKR Board theo perspective
**User story:** Là OKR Owner, tôi muốn xem OKRs theo perspective và quarter để theo dõi thực thi.

**Tiêu chí chấp nhận:**
- [ ] Given OKR data, When mở trang OKRs, Then hiển thị theo 4 cột perspective.
- [ ] Given drag-drop, When kéo OKR sang cột khác, Then trạng thái/perspective được cập nhật.
- [ ] Given OKR card, When click, Then mở detail sheet với KRs và tiến độ.

**Ưu tiên:** Cao  
**Phụ thuộc:** US-04, US-07

### US-14: Tạo và chỉnh sửa OKR
**User story:** Là OKR Owner, tôi muốn tạo/sửa OKR và KRs để cập nhật mục tiêu theo quý.

**Tiêu chí chấp nhận:**
- [ ] Given create dialog, When nhập objective và KRs, Then OKR mới được lưu thành công.
- [ ] Given KR có trọng số, When cập nhật current value, Then progress OKR được tính lại.
- [ ] Given linked goal, When chọn goal, Then OKR hiển thị badge alignment.

**Ưu tiên:** Cao  
**Phụ thuộc:** US-13

---

## Epic 6: KPIs

### US-15: KPI Dashboard
**User story:** Là Performance Manager, tôi muốn dashboard KPI để theo dõi tiến độ theo perspective.

**Tiêu chí chấp nhận:**
- [ ] Given KPI status, When mở KPI dashboard, Then hiển thị thống kê đúng số lượng on-track/at-risk/off-track.
- [ ] Given filter, When chọn perspective/status, Then danh sách KPI lọc đúng.
- [ ] Given KPI card, When xem, Then hiển thị progress, trend và unit chính xác.

**Ưu tiên:** Cao  
**Phụ thuộc:** US-04, US-07

### US-16: KPI Detail & History
**User story:** Là Performance Manager, tôi muốn xem chi tiết KPI và lịch sử để phân tích xu hướng.

**Tiêu chí chấp nhận:**
- [ ] Given KPI history, When mở KPI detail, Then chart hiển thị đầy đủ dữ liệu theo thời gian.
- [ ] Given linked entities, When xem detail, Then hiển thị Goal/OKR/Dept liên quan.
- [ ] Given update KPI, When nhập giá trị mới, Then thêm record vào KPI history.

**Ưu tiên:** Cao  
**Phụ thuộc:** US-15

---

## Epic 7: CSFs

### US-17: CSF Board theo trạng thái
**User story:** Là Program Manager, tôi muốn theo dõi CSFs theo trạng thái để kiểm soát rủi ro.

**Tiêu chí chấp nhận:**
- [ ] Given CSF data, When mở CSF board, Then phân cột theo status.
- [ ] Given priority, When hiển thị card, Then badge ưu tiên hiển thị đúng.
- [ ] Given liên kết OKR, When mở detail, Then hiển thị danh sách OKR liên quan.

**Ưu tiên:** Trung bình  
**Phụ thuộc:** US-04, US-07

---

## Epic 8: Fishbone Analysis

### US-18: Fishbone cho KPI off-track
**User story:** Là Team Lead, tôi muốn tạo phân tích Fishbone khi KPI off-track để tìm nguyên nhân gốc rễ.

**Tiêu chí chấp nhận:**
- [ ] Given KPI off-track, When chọn KPI, Then tạo Fishbone mới gắn đúng KPI.
- [ ] Given fishbone items, When cập nhật status, Then trạng thái và deadline hiển thị đúng.
- [ ] Given filter factor, When chọn factor, Then chỉ hiển thị item liên quan.

**Ưu tiên:** Cao  
**Phụ thuộc:** US-16

---

## Epic 9: Weekly Actions

### US-19: Weekly Actions Log
**User story:** Là Manager, tôi muốn log hành động hàng tuần với solution thinking để bám sát mục tiêu.

**Tiêu chí chấp nhận:**
- [ ] Given action log, When tạo action mới, Then bắt buộc có solution và activity.
- [ ] Given group by week, When lọc tuần, Then danh sách hiển thị đúng tuần.
- [ ] Given linked goal/KPI, When hiển thị action, Then badge liên kết hiển thị đúng.

**Ưu tiên:** Trung bình  
**Phụ thuộc:** US-04, US-07

---

## Epic 10: Reviews

### US-20: Lịch Review và Checklist
**User story:** Là Leader, tôi muốn quản lý lịch review tuần/tháng để đảm bảo tiến độ và xử lý vấn đề.

**Tiêu chí chấp nhận:**
- [ ] Given review schedule, When mở trang Reviews, Then hiển thị tab Weekly/Monthly rõ ràng.
- [ ] Given checklist, When tick hoàn thành, Then trạng thái lưu lại.
- [ ] Given start review, When bắt đầu session, Then có thể lưu notes và action items.

**Ưu tiên:** Thấp  
**Phụ thuộc:** US-04, US-07

---

## Epic 11: Dashboard tổng quan

### US-21: Dashboard Overview
**User story:** Là Executive, tôi muốn dashboard tổng quan để nắm nhanh tình trạng chiến lược.

**Tiêu chí chấp nhận:**
- [ ] Given dashboard stats, When mở trang Dashboard, Then số liệu OKR/KPI/CSF/Actions hiển thị đúng.
- [ ] Given perspective chart, When render, Then hiển thị tiến độ theo 4 góc nhìn.
- [ ] Given quick actions, When có item off-track hoặc review sắp tới, Then hiển thị cảnh báo.

**Ưu tiên:** Cao  
**Phụ thuộc:** US-13, US-15, US-17, US-19, US-20

---

## Epic 12: Realtime & QA

### US-22: Realtime updates với Supabase
**User story:** Là User, tôi muốn dữ liệu cập nhật realtime để tránh xem số liệu cũ.

**Tiêu chí chấp nhận:**
- [ ] Given subscription, When KPI/OKR/Action thay đổi, Then UI cập nhật ngay không cần refresh.
- [ ] Given mất kết nối, When realtime fail, Then hiển thị thông báo và tự reconnect.
- [ ] Given update local, When nhận event, Then không bị duplicate hoặc flicker.

**Ưu tiên:** Trung bình  
**Phụ thuộc:** US-04, US-13, US-15

### US-23: Testing & QA
**User story:** Là QA/Developer, tôi muốn có test tự động để đảm bảo chất lượng trước khi release.

**Tiêu chí chấp nhận:**
- [ ] Given unit/integration tests, When chạy test suite, Then pass không lỗi.
- [ ] Given E2E critical flows, When chạy Playwright, Then các luồng chính hoạt động.
- [ ] Given coverage report, When đo coverage, Then đạt tối thiểu 80%.

**Ưu tiên:** Cao  
**Phụ thuộc:** US-09 đến US-21
