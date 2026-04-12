# FE Patch Anchor - API Contract Alignment (2026-04-02)

## 1) Muc tieu

Tai lieu nay la neo trien khai cho dot chinh sua FE de khop API contract hien hanh.

Pham vi:

- Frontend Vue trong `frontend/src`
- Service layer trong `frontend/src/service`
- API contract trong `docs/ENDPOINT-SUMMARY.md`

## 2) Source of truth (ap dung tu hien tai)

Thu tu uu tien khi co xung dot:

1. `docs/ENDPOINT-SUMMARY.md`
2. FE implementation hien tai

Luu y quan trong:

- `docs/java/main/backend` la tai lieu cu, KHONG dung lam co so quyet dinh cho dot patch nay.
- Moi thay doi trong tai lieu neo nay phai bam sat ENDPOINT-SUMMARY.

## 3) Snapshot mismatch cap nhat sau lan ra soat gan nhat

Trang thai tong quan:

- Nhom PATCH-R1 -> PATCH-R6 da duoc dua vao code va coi la baseline.
- Dot nay tap trung cac diem lech contract con lai de lam neo va tiep tuc va.

### 3.1 High - Student flow chua dung endpoint quiz theo class

Doc yeu cau student vao course -> chon class -> goi `GET /api/classes/{classId}/quizzes`.

Hien trang FE:

- Service student chua co ham goi endpoint `/api/classes/{classId}/quizzes`.
- Man `CourseDetail` dang lay quiz truc tiep tu payload `GET /api/courses/{courseId}`.

Rui ro:

- Sai luong nghiep vu theo contract, de vo khi BE tach du lieu quiz khoi course detail.

### 3.2 Medium - Student CourseDetail map status quiz chua bam enum doc

Doc mo ta status hoc vien tren quiz: `NOT_STARTED | ATTEMPTED | PASSED | FAILED`.

Hien trang FE:

- UI dang xu ly bo status `pending/completed/locked`.

Rui ro:

- Sai mau trang thai, sai nut action (Do Quiz / View Result) khi BE tra enum theo doc.

### 3.3 Medium - Student Dashboard ky vong shape du lieu khac sample doc

Doc sample dashboard student tra course gom `classes[]`, trong do co `progress` theo class.

Hien trang FE:

- Dashboard doc `progress/totalQuizzes/completedQuizzes` truc tiep o cap course.

Rui ro:

- Co the hien 0 hoac sai thong ke neu response theo dung sample hien hanh.

### 3.4 Low - Admin Certificate revoke message phu thuoc field co the khong ton tai

Doc response revoke mo ta `data` tra ve toi thieu `certificateId`, `status`.

Hien trang FE:

- Message sau revoke dang noi suy tu `result.reason`.

Rui ro:

- Hien thi thong bao `undefined` du giao dich revoke thanh cong.

### 3.5 Low - Teacher class status severity nhay sai khi BE tra uppercase

Doc sample class status su dung `ACTIVE`.

Hien trang FE:

- Ham map severity dang so sanh chu thuong `active/completed/canceled`.

Rui ro:

- Badge trang thai roi vao mau mac dinh, giam do ro UI.

## 4) Patch package can lam tiep theo (theo uu tien)

## PATCH-R7 (High) - Student: bo sung endpoint quiz theo class

Target:

1. `frontend/src/service/studentApi.js`

- Them ham `getClassQuizzes(classId)` goi `GET /api/classes/{classId}/quizzes`.

2. `frontend/src/views/student/CourseDetail.vue`

- Tach logic hien thi quiz theo class, khong phu thuoc duy nhat vao `course.quizzes`.
- Co fallback an toan neu tam thoi chua co class duoc chon.

Acceptance criteria:

- Co request den endpoint `/api/classes/{classId}/quizzes` khi student chon class.
- Quiz list render dung theo response endpoint class quizzes.

## PATCH-R8 (Medium) - Student: dong bo enum status quiz theo doc

Target:

1. `frontend/src/views/student/CourseDetail.vue`

- Map status `NOT_STARTED|ATTEMPTED|PASSED|FAILED` vao badge severity va nut action.
- Giu fallback cho payload cu (`pending/completed/locked`) de tranh regression.

Acceptance criteria:

- Trang thai va action button dung voi enum doc.
- Van an toan voi du lieu cu trong giai doan transition.

## PATCH-R9 (Medium) - Student Dashboard: chuan hoa doc du lieu classes

Target:

1. `frontend/src/views/student/StudentDashboard.vue`

- Neu response co `classes[]`, map thong ke tu class-level theo doc.
- Neu response da co field tong hop o course-level, tiep tuc fallback de khong vo UI.

Acceptance criteria:

- Progress/quiz count hien dung voi payload sample trong ENDPOINT-SUMMARY.
- Khong gay loi hien thi voi payload cu.

## PATCH-R10 (Low) - Admin Certificate: thong bao revoke an toan

Target:

1. `frontend/src/views/admin/CertificateDetail.vue`

- Khong phu thuoc `result.reason` de hien thi thong bao thanh cong.
- Uu tien message co nghia dua tren `status` hoac mac dinh on dinh.

Acceptance criteria:

- Khong con message `undefined` sau revoke thanh cong.

## PATCH-R11 (Low) - Teacher class status: normalize casing truoc khi map mau

Target:

1. `frontend/src/views/teacher/TeacherClasses.vue`
2. `frontend/src/views/teacher/ClassDetail.vue`

- Chuan hoa status ve lowercase (hoac uppercase) truoc khi map severity.

Acceptance criteria:

- `ACTIVE` va `active` cho cung ket qua severity.

## 5) Ke hoach thuc thi de xuat

1. Dot 1 (High): PATCH-R7
2. Dot 2 (Medium): PATCH-R8, PATCH-R9
3. Dot 3 (Low/Hardening): PATCH-R10, PATCH-R11

Nguyen tac:

- Moi patch xong phai test ngay tren man lien quan.
- Update lai tai lieu nay sau moi dot (checklist + risk + ket qua test).

## 6) Checklist implement

Baseline da hoan tat truoc do:

1. [x] PATCH-R1 - Teacher search student truoc enroll
2. [x] PATCH-R2 - Users list response shape theo doc
3. [x] PATCH-R3 - Users status enum theo doc
4. [x] PATCH-R4 - Quiz detail field mapping theo doc
5. [x] PATCH-R5 - Class students filter/sort theo doc
6. [x] PATCH-R6 - Certificate verify/revoke field mapping

Dot patch hien tai:

7. [x] PATCH-R7 - Student endpoint quiz theo class
8. [x] PATCH-R8 - Student status quiz enum theo doc
9. [x] PATCH-R9 - Student Dashboard map classes-level data
10. [x] PATCH-R10 - Admin revoke message an toan
11. [x] PATCH-R11 - Teacher class status normalize casing

## 7) Checklist test nghiem thu

A. Teacher - Class Students

- Search hoc vien theo tu khoa tra ve ket qua dung.
- Enroll hoc vien tu ket qua search thanh cong.
- Filter/sort theo status va sort key moi hoat dong dung.

B. Admin - User Management

- Load users list dung shape response doc.
- Paging dung tong ban ghi.
- Filter status ACTIVE/INACTIVE dung ket qua.

C. Student - Course/Quiz Flow

- Chon class trong course va tai quiz list qua `/api/classes/{classId}/quizzes`.
- Trang thai quiz map dung enum doc (`NOT_STARTED|ATTEMPTED|PASSED|FAILED`).
- Quiz detail van hien dung voi payload fallback cu.

D. Student - Dashboard

- Neu response co `classes[]`, progress va thong ke hien dung.
- Neu response tong hop course-level, UI khong vo.

E. Admin - Certificate Detail

- Verify date render dung uu tien field doc.
- Revoke request body hop le theo doc.
- Message sau revoke khong co `undefined`.

F. Teacher - Class Status UI

- Badge status hien dung mau voi ca `ACTIVE` va `active`.

## 8) Ghi chu quan tri thay doi

- Tai lieu nay la neo de va FE, khong la noi tranh luan source contract.
- Neu ENDPOINT-SUMMARY thay doi, cap nhat ngay cac muc PATCH-R\* bi anh huong.
- Khong merge patch FE neu checklist test o muc 7 chua dat.
