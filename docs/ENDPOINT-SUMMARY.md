# API Endpoints & User Flows

**Base URL:** `http://localhost:8080`  
**Response Format:** `{ success, message, data, error }` → FE phải đọc `response.data.data`  
**Headers:** `Authorization: Bearer <token>`

---

# 🔐 PHẦN 1: ĐĂNG NHẬP & XÁC ĐỊNH ROLE

## OAuth2 Login Flow (FE hiển thị màn hình đăng nhập)

```
[STEP 1] User click "Login Google"
  → FE redirect tới: GET /oauth2/authorization/google
  → Google login popup

[STEP 2] Google callback trả về token + role
  → Lưu token vào localStorage
  → Redirect tới role-specific dashboard

[STEP 3] FE gọi API lấy user info
  → GET /api/auth/me (Header: Bearer token)
  → Dùng response.data.data.role để route đúng dashboard
```

### Endpoint: Get Current User Info

- **Method:** `GET /api/auth/me`
- **Auth:** Required (Bearer token)
- **Response:**

```json
{
	"success": true,
	"data": {
		"userId": "550e8400-e29b",
		"userCode": "HS00001",
		"email": "student@gmail.com",
		"fullName": "Nguyễn Văn A",
		"avatarUrl": "https://...",
		"role": "STUDENT", // STUDENT | TEACHER | ADMIN
		"isActive": true
	}
}
```

### Endpoint: Logout

- **Method:** `POST /api/auth/logout`
- **Auth:** Required
- **Response:** `{ success: true, data: null }`
- **UI:** Clear token, redirect "/" (login page)

---

# 👨‍🎓 PHẦN 2: HỌC VIÊN (STUDENT) FLOWS

## Flow 1: Xem Dashboard & Danh sách Khóa Học

```
[STEP 1] Học viên vào trang Dashboard
  → FE gọi: GET /api/student/{userId}/courses
  → Render: Danh sách cards "Khóa học đang học" + Progress bar

[STEP 2] Học viên click vào 1 khóa
  → FE gọi: GET /api/courses/{courseId}
  → Render: Chi tiết khóa + Danh sách classes

[STEP 3] Học viên chọn 1 class
  → FE gọi: GET /api/classes/{classId}/quizzes
  → Render: Danh sách quiz của class (hình: Bài quiz #1, #2, ...)
```

### Endpoint: Student Dashboard - Get Courses

- **Method:** `GET /api/student/{studentId}/courses`
- **Auth:** Required (STUDENT only)
- **UI Component:** Course cards + enrollment progress
- **Response:**

```json
{
	"success": true,
	"data": [
		{
			"courseId": "CRS001",
			"courseName": "JavaScript Basics",
			"description": "...",
			"classes": [
				{
					"classId": "CLS001",
					"className": "JS - Sáng",
					"status": "LEARNING",
					"enrolled_at": "2026-03-01",
					"progress": 45
				}
			]
		}
	]
}
```

### Endpoint: Get Course Detail

- **Method:** `GET /api/courses/{courseId}`
- **Auth:** Required
- **Response:** Course info + list of classes

### Endpoint: Get Quizzes in Class

- **Method:** `GET /api/classes/{classId}/quizzes`
- **Auth:** Required
- **UI Component:** Quiz list (showing: quiz title, questions count, student's status)
- **Response:**

```json
{
	"success": true,
	"data": [
		{
			"quizId": "QUIZ001",
			"title": "Quiz 1: Variables & Types",
			"description": "...",
			"questionCount": 5,
			"timeLimit": 20,
			"passingScore": 60,
			"studentStatus": "NOT_STARTED" // hoặc ATTEMPTED, PASSED, FAILED
		}
	]
}
```

---

## Flow 2: Làm Quiz (Quizzes)

```
[STEP 1] Học viên click vào 1 quiz
  → FE gọi: GET /api/quizzes/{quizId}
  → Render: Chi tiết quiz + tất cả câu hỏi
  → Hiển thị: Quiz title, description, time limit

[STEP 2] Học viên trả lời câu hỏi
  → FE collect answers
  → Hiển thị: Question #N / Total

[STEP 3] Học viên click "Submit"
  → FE gọi: POST /api/quizzes/{quizId}/submit + answers
  → Render: Kết quả (Score, Status PASSED/FAILED)
  → Show: Retry button nếu failed
```

### Endpoint: Get Quiz Detail + Questions

- **Method:** `GET /api/quizzes/{quizId}`
- **Auth:** Required
- **UI Component:** Quiz header + question list
- **Response:**

```json
{
	"success": true,
	"data": {
		"quizId": "QUIZ001",
		"title": "Quiz 1",
		"description": "...",
		"questionCount": 5,
		"timeLimit": 20,
		"passingScore": 60,
		"questions": [
			{
				"questionId": "Q1",
				"text": "What is a variable?",
				"type": "MULTIPLE_CHOICE",
				"options": [
					{ "id": "A", "text": "Option A" },
					{ "id": "B", "text": "Option B" }
				]
			}
		]
	}
}
```

### Endpoint: Submit Quiz

- **Method:** `POST /api/quizzes/{quizId}/submit`
- **Auth:** Required
- **Request Body:**

```json
{
	"studentId": "550e8400-e29b",
	"answers": [
		{ "questionId": "Q1", "selectedOption": "A" },
		{ "questionId": "Q2", "selectedOption": "C" }
	]
}
```

- **UI Component:** Results page with score + pass/fail badge
- **Response:**

```json
{
	"success": true,
	"data": {
		"quizId": "QUIZ001",
		"score": 80,
		"maxScore": 100,
		"status": "passed", // lowercase
		"submittedAt": "2026-03-31T10:30:00Z"
	}
}
```

### Endpoint: Get Quiz Result (after submit)

- **Method:** `GET /api/quizzes/{quizId}/result`
- **Auth:** Required
- **Response:** Score + detailed answers + correct answers (for review)

---

## Flow 3: Xem Chứng Chỉ

```
[STEP 1] Học viên vào tab "Chứng chỉ"
  → FE gọi: GET /api/student/{studentId}/certificates
  → Render: Danh sách certifications đã nhận

[STEP 2] Học viên click vào 1 cert
  → Hiển thị: Chi tiết cert (date, score, blockchain verify link)
```

### Endpoint: Student Get Certificates

- **Method:** `GET /api/student/{studentId}/certificates`
- **Auth:** Required (STUDENT only)
- **UI Component:** Certificates grid/list (card: course name, date, verify button)
- **Response:**

```json
{
	"success": true,
	"data": [
		{
			"certificateId": "CERT001",
			"courseName": "JavaScript Basics",
			"courseCode": "JS101",
			"studentName": "Nguyễn Văn A",
			"averageScore": 85,
			"issuedAt": "2026-03-20",
			"status": "issued",
			"verificationHash": "abc123...",
			"blockchainInfo": null // optional
		}
	]
}
```

---

# 👨‍🏫 PHẦN 3: GIÁO VIÊN (TEACHER) FLOWS

## Flow 1: Xem Danh sách Lớp (Dashboard)

```
[STEP 1] Giáo viên vào Dashboard
  → FE gọi: GET /api/teacher/{teacherId}/classes
  → Render: Danh sách lớp đang dạy (cards: tên lớp, số học viên)

[STEP 2] GV click vào 1 lớp
  → FE gọi: GET /api/classes/{classId}
  → Render: Chi tiết lớp (tên, môn học, thời gian)
  → Show tabs: "Học viên", "Quiz", "Cài đặt"
```

### Endpoint: Teacher Get Classes

- **Method:** `GET /api/teacher/{teacherId}/classes`
- **Auth:** Required (TEACHER only)
- **UI Component:** Class cards (showing: class name, student count, status)
- **Response:**

```json
{
	"success": true,
	"data": [
		{
			"classId": "CLS001",
			"className": "JavaScript - Lớp Sáng",
			"courseId": "CRS001",
			"description": "Khóa học lập trình JavaScript",
			"studentCount": 25,
			"status": "ACTIVE"
		}
	]
}
```

### Endpoint: Get Class Detail

- **Method:** `GET /api/classes/{classId}`
- **Auth:** Required
- **Response:** Class info + course details + student list

---

## Flow 2: Quản Lý Học Viên trong Lớp

```
[STEP 1] GV click tab "Học viên"
  → FE gọi: GET /api/classes/{classId}/students?status=LEARNING
  → Render: Table danh sách học viên (columns: Mã HS, Tên, Trạng thái, Điểm)
  → Show filter buttons: "Đang học", "Đã hoàn thành"

[STEP 2] GV click "Thêm học viên"
  → Mở modal search
  → FE gọi: GET /api/users/search/students?q=
  → Show search results

[STEP 3] GV click "Thêm" (sau khi chọn HS)
  → FE gọi: POST /api/enrollments
  → Success → reload danh sách

[STEP 4] GV click "Xóa" (trên hàng học viên)
  → FE gọi: DELETE /api/enrollments/{enrollmentId}
  → Success → reload danh sách
```

### Endpoint: Get Students in Class

- **Method:** `GET /api/classes/{classId}/students`
- **Query Params:** `status=LEARNING|PASSED` + `sort=name|score|date` + `order=asc|desc`
- **Auth:** Required (TEACHER/ADMIN only)
- **UI Component:** Students table (sortable, filterable, with action buttons)
- **Response:**

```json
{
	"success": true,
	"data": [
		{
			"enrollmentId": 101,
			"studentId": "550e8400-e29b",
			"fullName": "Nguyễn Văn A",
			"email": "student@gmail.com",
			"avatarUrl": "https://...",
			"completedQuizzes": 2,
			"totalQuizzes": 5,
			"status": "learning", // lowercase
			"enrolledAt": "2026-02-01T08:00:00",
			"averageScore": 78.5
		}
	]
}
```

### Endpoint: Search Students

- **Method:** `GET /api/users/search/students?q=keyword`
- **Auth:** Required (TEACHER/ADMIN)
- **Query Param:** searches in `userCode`, `email`, `fullName`
- **Response:**

```json
{
	"success": true,
	"data": [
		{
			"userId": "...",
			"userCode": "HS00001",
			"fullName": "Nguyễn Văn A",
			"email": "a@gmail.com"
		}
	]
}
```

### Endpoint: Add Student to Class (Enroll)

- **Method:** `POST /api/enrollments`
- **Auth:** Required (TEACHER/ADMIN)
- **Request Body:** (use studentCode OR studentId)

```json
{
	"studentCode": "HS00001",
	"classId": "CLS001"
}
```

or

```json
{
	"studentId": "550e8400-e29b",
	"classId": "CLS001"
}
```

- **Response:** `{ success: true, data: { enrollmentId, status } }`

### Endpoint: Remove Student from Class

- **Method:** `DELETE /api/enrollments/{enrollmentId}`
- **Auth:** Required (TEACHER/ADMIN)
- **Response:** `{ success: true, data: null }`

---

## Flow 3: Quản Lý Quiz trong Lớp

```
[STEP 1] GV click tab "Quiz"
  → FE gọi: GET /api/classes/{classId}/quizzes
  → Render: Danh sách quiz (columns: Tiêu đề, Câu hỏi, Hạn cuối, Hành động)

[STEP 2] GV click "Tạo Quiz mới"
  → Mở form: Quiz title, description, time limit, passing score
  → FE gọi: POST /api/quizzes + quiz data + questions
  → Success → reload danh sách

[STEP 3] GV click "Sửa"
  → Mở form pre-filled
  → FE gọi: PUT /api/quizzes/{quizId}
  → Success → reload

[STEP 4] GV click "Xóa"
  → Confirm dialog
  → FE gọi: DELETE /api/quizzes/{quizId}
  → Success → reload

[STEP 5] GV click "Xem bài nộp"
  → FE gọi: GET /api/quizzes/{quizId}/submissions
  → Render: Table kết quả (columns: Tên HS, Score, Status, Thời gian nộp)
```

### Endpoint: Get Quizzes in Class

- **Method:** `GET /api/classes/{classId}/quizzes`
- **Auth:** Required
- **Response:** List of quizzes

### Endpoint: Create Quiz (Teacher only)

- **Method:** `POST /api/quizzes`
- **Auth:** Required (TEACHER only)
- **Request Body:**

```json
{
	"classId": "CLS001",
	"quizName": "Quiz 1: Variables",
	"duration": 20,
	"passingScore": 6,
	"questions": [
		{
			"questionText": "What is a variable?",
			"questionType": "multiple_choice",
			"options": [
				{ "optionId": "A", "optionText": "Option A", "isCorrect": true },
				{ "optionId": "B", "optionText": "Option B", "isCorrect": false },
				{ "optionId": "C", "optionText": "Option C", "isCorrect": false },
				{ "optionId": "D", "optionText": "Option D", "isCorrect": false }
			]
		}
	]
}
```

### Endpoint: Update Quiz

- **Method:** `PUT /api/quizzes/{quizId}`
- **Auth:** Required (TEACHER only)
- **Request Body:** Same as POST

### Endpoint: Delete Quiz

- **Method:** `DELETE /api/quizzes/{quizId}`
- **Auth:** Required (TEACHER only)

### Endpoint: Get Quiz Submissions

- **Method:** `GET /api/quizzes/{quizId}/submissions`
- **Auth:** Required (TEACHER only)
- **UI Component:** Submissions table (sortable: student name, score, status)
- **Response:**

```json
{
	"success": true,
	"data": [
		{
			"submissionId": "SUB001",
			"studentId": "...",
			"studentName": "Nguyễn Văn A",
			"studentEmail": "a@gmail.com",
			"score": 85,
			"maxScore": 100,
			"passed": true,
			"submittedAt": "2026-03-31T10:30:00Z"
		}
	]
}
```

---

# 🛡️ PHẦN 4: QUẢN TRỊ VIÊN (ADMIN) FLOWS

## Flow 1: Quản Lý Chứng Chỉ

```
[STEP 1] Admin vào tab "Chứng chỉ"
  → FE gọi: GET /api/admin/certificates/stats
  → Render: Stats dashboard (Tổng cấp, Tổng thu hồi, etc.)

[STEP 2] Admin click "Danh sách mới nhất"
  → FE gọi: GET /api/certificates/recent?limit=20&page=1
  → Render: Table chứng chỉ

[STEP 3] Admin tìm kiếm
  → FE gọi: GET /api/certificates/search?q=keyword&status=issued
  → Render: Search results

[STEP 4] Admin click vào 1 cert
  → FE gọi: GET /api/certificates/{certificateId}
  → Render: Chi tiết cert + verify button + revoke button

[STEP 5] Admin click "Xác minh" (Blockchain)
  → FE gọi: POST /api/certificates/{certificateId}/verify
  → Show: Verification result

[STEP 6] Admin click "Thu hồi"
  → Mở dialog confirm + reason
  → FE gọi: POST /api/certificates/{certificateId}/revoke + reason
  → Success → reload danh sách
```

### Endpoint: Get Certificate Stats

- **Method:** `GET /api/admin/certificates/stats`
- **Auth:** Required (ADMIN only)
- **UI Component:** Stats dashboard (cards: issued, revoked, pending)
- **Response:**

```json
{
	"success": true,
	"data": {
		"totalCertificates": 150,
		"issuedCertificates": 145,
		"revokedCertificates": 5,
		"certificatesThisMonth": 15,
		"certificatesThisYear": 90
	}
}
```

### Endpoint: Get Recent Certificates

- **Method:** `GET /api/certificates/recent?limit=20&page=1`
- **Auth:** Required (ADMIN only)
- **Query Params:** `limit` (default 10), `page` (default 1)
- **UI Component:** Certificates table (sortable, filterable)
- **Response:**

```json
{
	"success": true,
	"data": {
		"items": [
			{
				"certificateId": "CERT001",
				"studentEmail": "a@gmail.com",
				"className": "CLS001",
				"courseCode": "JS101",
				"studentName": "Nguyễn Văn A",
				"averageScore": 85,
				"issuedAt": "2026-03-20T00:00:00Z",
				"status": "issued",
				"verificationHash": "abc123..."
			}
		],
		"pagination": {
			"page": 1,
			"limit": 20,
			"total": 150,
			"totalPages": 8
		}
	}
}
```

### Endpoint: Search Certificates

- **Method:** `GET /api/certificates/search?q=keyword&status=issued`
- **Auth:** Required (ADMIN only)
- **Query Params:** `q` (search in course name, student name), `status` (issued/revoked/pending), `limit`
- **Response:** Same as recent certificates

### Endpoint: Get Certificate Detail

- **Method:** `GET /api/certificates/{certificateId}`
- **Auth:** Required (ADMIN only)
- **UI Component:** Cert detail page (with verify + revoke buttons)
- **Response:**

```json
{
	"success": true,
	"data": {
		"certificateId": "CERT001",
		"courseName": "JavaScript Basics",
		"courseCode": "JS101",
		"studentName": "Nguyễn Văn A",
		"studentCode": "HS00001",
		"averageScore": 85,
		"issuedAt": "2026-03-20T00:00:00Z",
		"status": "issued",
		"verificationHash": "abc123def456",
		"blockchainInfo": null // optional blockchain data
	}
}
```

### Endpoint: Verify Certificate (Blockchain)

- **Method:** `POST /api/certificates/{certificateId}/verify`
- **Auth:** Required (ADMIN only)
- **UI Component:** Modal/page showing verification result
- **Response:**

```json
{
	"success": true,
	"data": {
		"certificateId": "CERT001",
		"isValid": true,
		"blockchainVerificationDate": "2026-03-31T15:00:00Z",
		"verificationHash": "abc123..."
	}
}
```

### Endpoint: Revoke Certificate

- **Method:** `POST /api/certificates/{certificateId}/revoke`
- **Auth:** Required (ADMIN only)
- **Request Body:**

```json
{
	"reason": "Mục đích kiểm tra" // optional
}
```

- **Response:** `{ success: true, data: { certificateId, status: "revoked" } }`

---

## Flow 2: Quản Lý Users

```
[STEP 1] Admin vào tab "Người dùng"
  → FE gọi: GET /api/admin/users?role=STUDENT&status=ACTIVE&page=1&limit=20
  → Render: Danh sách users (columns: Mã code, Tên, Role, Trạng thái)

[STEP 2] Admin filter role hoặc status
  → FE gọi: GET /api/admin/users?role=TEACHER&status=ACTIVE
  → Render: Filtered list

[STEP 3] Admin click "Vô hiệu hóa" user
  → Confirm dialog
  → FE gọi: PUT /api/admin/users/{userId}/status + { status: "INACTIVE" }
  → Success → reload

[STEP 4] Admin click "Đổi role"
  → Mở dropdown (STUDENT/TEACHER)
  → FE gọi: PUT /api/admin/users/{userId}/role + { role: "TEACHER" }
  → Success → reload
```

### Endpoint: Get Users List

- **Method:** `GET /api/admin/users?role=STUDENT&status=ACTIVE&page=1&limit=20`
- **Auth:** Required (ADMIN only)
- **Query Params:** `role` (STUDENT/TEACHER/ADMIN), `status` (ACTIVE/INACTIVE), `page`, `limit`
- **UI Component:** Users table (with filter dropdowns, action buttons)
- **Response:**

```json
{
	"success": true,
	"data": {
		"users": [
			{
				"userId": "...",
				"userCode": "HS00001",
				"fullName": "Nguyễn Văn A",
				"email": "a@gmail.com",
				"role": "STUDENT",
				"status": "ACTIVE",
				"createdAt": "2026-01-01T00:00:00Z"
			}
		],
		"totalCount": 100,
		"page": 1,
		"pageSize": 20
	}
}
```

### Endpoint: Update User Status

- **Method:** `PUT /api/admin/users/{userId}/status`
- **Auth:** Required (ADMIN only)
- **Request Body:**

```json
{
	"isActive": false,
	"reason": "Disabled by admin" // optional
}
```

- **Response:** `{ success: true, data: { userId, status } }`

### Endpoint: Update User Role

- **Method:** `PUT /api/admin/users/{userId}/role`
- **Auth:** Required (ADMIN only)
- **Request Body:**

```json
{
	"role": "TEACHER" // hoặc STUDENT, ADMIN
}
```

- **Response:** `{ success: true, data: { userId, role } }`

---

# 📋 PHẦN 5: QUY ƯỚC & STATUS CODES

## User Code Format (Auto-generated)

| Prefix | Role                | Ví dụ   |
| ------ | ------------------- | ------- |
| HS     | Học Sinh (Student)  | HS00001 |
| GV     | Giáo Viên (Teacher) | GV00001 |
| AD     | Quản Trị (Admin)    | AD00001 |

Auto-generated khi user đăng nhập Google lần đầu.

---

## HTTP Status Codes

| Code | Ý nghĩa      | Hành động FE                                |
| ---- | ------------ | ------------------------------------------- |
| 200  | SUCCESS      | Render response.data.data                   |
| 201  | CREATED      | Notify success + reload data                |
| 400  | BAD REQUEST  | Show error message (validation errors)      |
| 401  | UNAUTHORIZED | Clear token + redirect to login             |
| 403  | FORBIDDEN    | Show "Không có quyền" + stay on page        |
| 404  | NOT FOUND    | Show "Không tìm thấy" + redirect or go back |
| 500  | SERVER ERROR | Show "Lỗi hệ thống, vui lòng thử lại"       |

---

## Response Wrapper Pattern

**Tất cả endpoints** trả về format này:

```json
{
	"success": true,
	"message": "Optional message",
	"data": {
		/* actual data */
	},
	"error": null
}
```

**FE phải đọc từ:** `response.data.data` (sau khi axios trả về)

**Error response:**

```json
{
	"success": false,
	"message": "Lỗi xảy ra",
	"data": null,
	"error": "Detailed error message"
}
```

---

# 🎯 FRONTEND IMPLEMENTATION CHECKLIST

## Authentication

- [ ] Login button → redirect `/oauth2/authorization/google`
- [ ] After redirect, read `token` from URL query
- [ ] Store token in `localStorage`
- [ ] Call `GET /api/auth/me` with token
- [ ] Read `role` from response → determine dashboard
- [ ] Setup axios interceptor to add `Authorization: Bearer` header
- [ ] Logout: clear token + redirect to login

## Student

- [ ] Dashboard: `GET /api/student/{userId}/courses` → show course cards
- [ ] Quiz list: `GET /api/classes/{classId}/quizzes` → show quiz titles
- [ ] Quiz detail: `GET /api/quizzes/{quizId}` → show questions
- [ ] Submit: `POST /api/quizzes/{quizId}/submit` + answers → show score
- [ ] Certificates: `GET /api/student/{userId}/certificates` → show cert list

## Teacher

- [ ] Dashboard: `GET /api/teacher/{userId}/classes` → show class cards
- [ ] Students: `GET /api/classes/{classId}/students` → show student table
- [ ] Add student: `GET /api/users/search/students?q=` → search + `POST /api/enrollments` → add
- [ ] Remove student: `DELETE /api/enrollments/{enrollmentId}`
- [ ] Create quiz: `POST /api/quizzes` + questions
- [ ] Edit quiz: `PUT /api/quizzes/{quizId}`
- [ ] Delete quiz: `DELETE /api/quizzes/{quizId}`
- [ ] Submissions: `GET /api/quizzes/{quizId}/submissions` → show table

## Admin

- [ ] Dashboard: `GET /api/admin/certificates/stats` → show stats cards
- [ ] Certs list: `GET /api/certificates/recent?limit=20&page=1` → paginated table
- [ ] Search certs: `GET /api/certificates/search?q=...&status=...`
- [ ] Cert detail: `GET /api/certificates/{certificateId}`
- [ ] Verify cert: `POST /api/certificates/{certificateId}/verify`
- [ ] Revoke cert: `POST /api/certificates/{certificateId}/revoke`
- [ ] Users list: `GET /api/admin/users?role=STUDENT&status=ACTIVE`
- [ ] Update user status: `PUT /api/admin/users/{userId}/status`
- [ ] Update user role: `PUT /api/admin/users/{userId}/role`
