# FE Gap Follow-up (Chi Con Noi Dung Moi)

## 1. Trang thai cap nhat

Da hoan thanh trong FE (da bo khoi danh sach ton dong):

- Search certificate giu `q` bat buoc theo BE.
- Verify certificate action trong Admin detail.
- Remove enrollment flow da co tren FE.
- Timer quiz thuc (countdown), bo mock timer.
- Chuan hoa API error object co `status/message/payload` va helper message.
- Update Class UI (PUT `/api/classes/{id}`) da co.

Tai lieu nay chi giu cac diem moi/con phu thuoc BE sau dot cap nhat.

## 2. Noi dung moi can BE phoi hop

### NEW-01 (High): Bo sung `enrollmentId` trong API class students

Trang thai hien tai:

- FE da co thao tac delete enrollment theo endpoint `DELETE /api/enrollments/{enrollmentId}`.
- Tuy nhien response `GET /api/classes/{classId}/students` (DTO `StudentResponseDTO`) chua co `enrollmentId`.

Tac dong:

- FE khong the remove truc tiep tren tung dong student mot cach day du neu khong co ID enrollment trong row data.
- Hien tai FE phai dung fallback nhap tay enrollmentId.

De xuat BE:

1. Bo sung truong `enrollmentId` vao `StudentResponseDTO`.
2. Map `enrollmentId` trong `ClassService#mapStudentDTO`.

Tieu chi done:

- Man Class Students co nut Remove tren tung dong va goi delete truc tiep khong can nhap tay ID.

### NEW-02 (Medium): Neu muon CRUD Class day du 4 thao tac, BE can them delete endpoint

Trang thai hien tai:

- BE dang ho tro Class: create/read/update.
- Chua co endpoint delete class trong `TeacherClassController`.

Tac dong:

- FE khong the cung cap delete class dung nghia CRUD 4 thao tac cho thuc the Class.

De xuat BE:

1. Them `DELETE /api/classes/{id}` (co business rule ro rang: class co enrollment/quiz thi xu ly the nao).

Tieu chi done:

- FE bo sung nut Delete Class va hoat dong theo rule BE.

## 3. Checklist kiem thu lai sau khi BE cap nhat

1. `GET /api/classes/{classId}/students` tra ve `enrollmentId` moi dong.
2. Remove enrollment truc tiep tren row hoat dong (khong can manual ID).
3. Neu co them delete class endpoint: FE delete class thanh cong, refresh danh sach class dung.
