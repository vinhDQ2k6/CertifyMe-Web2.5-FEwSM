# API Endpoints & User Flows (Aligned With docs/java Backend)

Base URL: http://localhost:8080  
Response wrapper: { success, message, data, error }  
Auth header: Authorization: Bearer <token>

Nguồn đối chiếu: docs/java/main/backend controllers + DTO.

---

# 1) AUTH / OAuth2

## OAuth2 login flow

1. FE redirect: GET /oauth2/authorization/google
2. BE success handler redirect về FE callback với query token, role, redirect
3. FE gọi GET /api/auth/me để lấy user profile

Lưu ý cấu hình BE mặc định:

- app.oauth2.redirect-uri mặc định: http://localhost:3000/oauth2/redirect
- FRONTEND_URL mặc định cho CORS: http://localhost:3000

Nếu FE chạy cổng khác thì phải set lại env BE tương ứng.

## GET /api/auth/me

Auth: required

Response data (UserResponse):

```json
{
	"userId": "550e8400-e29b",
	"userCode": "HS00001",
	"email": "student@gmail.com",
	"fullName": "Nguyen Van A",
	"avatarUrl": "https://...",
	"role": "STUDENT",
	"isActive": true
}
```

## POST /api/auth/logout

Auth: required

Response wrapper mẫu:

```json
{
	"success": true,
	"message": "Logged out successfully",
	"data": null
}
```

## GET /api/auth/check-role

Auth: required

Response thực tế hiện tại:

```json
{
	"success": true,
	"message": "You are logged in as: STUDENT",
	"data": null
}
```

Lưu ý: endpoint này KHONG trả data là role string.

---

# 2) USER QUERY ENDPOINTS

## GET /api/users/{idOrCode}

Auth role: TEACHER hoặc ADMIN

Response data: UserResponse (giống /api/auth/me).

## GET /api/users/search/students?q=keyword

Auth role: TEACHER hoặc ADMIN

Response data: List<UserResponse>

## GET /api/users/search/teachers?q=keyword

Auth role: ADMIN

Response data: List<UserResponse>

---

# 3) STUDENT FLOWS

## GET /api/student/{studentId}/courses

Auth role: STUDENT

Response data: List<CourseResponse>

```json
[
	{
		"courseId": "CRS001",
		"courseCode": "JS101",
		"courseName": "JavaScript Basics",
		"courseIcon": "pi pi-book",
		"teacherName": "Teacher A",
		"progress": 45,
		"totalQuizzes": 10,
		"completedQuizzes": 4,
		"averageScore": 7.5,
		"completed": false
	}
]
```

## GET /api/student/{studentId}/certificates

Auth role: STUDENT

Response data: List<CertificateResponse>

```json
[
	{
		"courseName": "JavaScript Basics",
		"courseCode": "JS101",
		"certificateId": "CERT001",
		"averageScore": 8.5,
		"issuedAt": "2026-03-20",
		"verificationHash": "abc123",
		"status": "issued",
		"blockchainInfo": {
			"hash": "...",
			"block": "...",
			"txHash": "...",
			"contract": "..."
		}
	}
]
```

## GET /api/courses

Auth: authenticated

Response data: List<CourseListItemResponse>

```json
[
	{
		"courseId": "CRS001",
		"courseCode": "JS101",
		"courseName": "JavaScript Basics",
		"description": "..."
	}
]
```

## GET /api/courses/{courseId}

Auth role: STUDENT

Response data: CourseDetailResponse

```json
{
	"courseIcon": "pi pi-book",
	"courseName": "JavaScript Basics",
	"courseCode": "JS101",
	"teacherName": "Teacher A",
	"startDate": "2026-03-01",
	"endDate": "2026-05-01",
	"progress": 45,
	"totalQuizzes": 10,
	"completedQuizzes": 4,
	"completed": false,
	"studentName": "Student A",
	"averageScore": 7.5,
	"quizzes": [
		{
			"id": "QZ001",
			"name": "Variables",
			"score": 8.0,
			"maxScore": 10.0,
			"status": "completed"
		}
	],
	"certificate": {
		"verificationHash": "abc123",
		"blockchainInfo": {
			"txHash": "..."
		}
	}
}
```

## GET /api/classes/{classId}/quizzes

Auth role: STUDENT hoặc TEACHER

Response data: List<QuizResponseDTO>

```json
[
	{
		"quizId": "QZ001",
		"classId": "CLS001",
		"quizName": "Quiz 1",
		"duration": 20,
		"passingScore": 6.0,
		"maxScore": 10,
		"questionCount": 5,
		"status": "published"
	}
]
```

## GET /api/quizzes/{quizId}

Auth role: STUDENT hoặc TEACHER

Response data: QuizResponseDTO, phần questions theo optionA..optionD

```json
{
	"quizId": "QZ001",
	"quizName": "Quiz 1",
	"duration": 20,
	"passingScore": 6.0,
	"questions": [
		{
			"questionId": 1,
			"questionText": "What is a variable?",
			"optionA": "...",
			"optionB": "...",
			"optionC": "...",
			"optionD": "..."
		}
	]
}
```

## POST /api/quizzes/{quizId}/submit

Auth role: STUDENT

Request body: QuizSubmissionRequest

```json
{
	"studentId": "550e8400-e29b",
	"answers": [{ "questionId": "1", "selectedOption": "A" }]
}
```

Response data: QuizResultResponse

```json
{
	"score": 8.0,
	"maxScore": 10.0,
	"status": "passed",
	"submittedAt": "2026-03-31T10:30:00"
}
```

## GET /api/quizzes/{quizId}/result

Auth role: STUDENT

Response data: QuizResultDetailResponse

```json
{
	"quizId": "QZ001",
	"quizTitle": "Quiz 1",
	"score": 8.0,
	"maxScore": 10.0,
	"passingScore": 6.0,
	"status": "passed",
	"attemptCount": 2,
	"submittedAt": "2026-03-31 10:30:00"
}
```

---

# 4) TEACHER FLOWS

## GET /api/teacher/{teacherId}/classes

Auth role: TEACHER

Response data: List<ClassResponseDTO>

```json
[
	{
		"classId": "CLS001",
		"classCode": "SD18303",
		"courseName": "JavaScript Basics",
		"courseId": "CRS001",
		"teacherName": "Teacher A",
		"studentCount": 25,
		"quizCount": 5,
		"status": "ACTIVE",
		"startDate": "2026-03-01",
		"endDate": "2026-05-01",
		"description": "..."
	}
]
```

## GET /api/classes/{classId}

Auth role: TEACHER

Response data: ClassResponseDTO (cùng shape như trên).

## GET /api/classes/{classId}/students

Auth role: TEACHER

Query params: status, sort, order (optional)

Response data: List<StudentResponseDTO>

```json
[
	{
		"studentId": "550e...",
		"fullName": "Student A",
		"email": "a@example.com",
		"avatarUrl": "https://...",
		"completedQuizzes": 2,
		"totalQuizzes": 5,
		"averageScore": 7.8,
		"status": "learning",
		"enrolledAt": "2026-02-01T08:00:00"
	}
]
```

## POST /api/classes

Auth role: TEACHER

Request body: ClassRequestDTO

```json
{
	"classCode": "SD18310",
	"courseName": "JavaScript Basics",
	"courseId": "CRS001",
	"teacherId": "550e8400-teacher-id",
	"startDate": "2026-04-01",
	"endDate": "2026-06-30",
	"description": "..."
}
```

## PUT /api/classes/{id}

Auth role: TEACHER

Request body: ClassRequestDTO (same as create).

## POST /api/quizzes

Auth role: TEACHER

Request body: QuizRequestDTO

```json
{
	"classId": "CLS001",
	"quizName": "Quiz 1",
	"duration": 20,
	"passingScore": 6,
	"maxScore": 10,
	"questions": [
		{
			"questionText": "What is a variable?",
			"questionType": "multiple_choice",
			"options": [
				{ "optionId": "A", "optionText": "...", "isCorrect": true },
				{ "optionId": "B", "optionText": "...", "isCorrect": false }
			]
		}
	]
}
```

## PUT /api/quizzes/{quizId}

Auth role: TEACHER

Request body: QuizRequestDTO (same as create).

## DELETE /api/quizzes/{quizId}

Auth role: TEACHER

Response data: null.

## GET /api/quizzes/{quizId}/submissions

Auth role: TEACHER

Response data: List<QuizSubmissionResponseDTO>

```json
[
	{
		"submissionId": "SUB001",
		"studentId": "550e...",
		"studentName": "Student A",
		"studentEmail": "a@example.com",
		"score": 8.5,
		"maxScore": 10,
		"passed": true,
		"submittedAt": "2026-03-31T10:30:00"
	}
]
```

## POST /api/enrollments

Auth role: TEACHER hoặc ADMIN

Request body: EnrollmentRequestDTO

```json
{
	"studentCode": "HS00001",
	"classId": "CLS001"
}
```

hoặc

```json
{
	"studentId": "550e8400-e29b",
	"classId": "CLS001"
}
```

Response data: EnrollmentResponseDTO

```json
{
	"enrollmentId": 101,
	"studentId": "550e8400-e29b",
	"studentCode": "HS00001",
	"studentName": "Student A",
	"classId": "CLS001",
	"className": "SD18303",
	"status": "LEARNING",
	"enrolledAt": "2026-04-01"
}
```

## DELETE /api/enrollments?studentCode=HS00001&classId=CLS001

Auth role: TEACHER hoặc ADMIN

Response data: null.

---

# 5) ADMIN FLOWS

## GET /api/admin/certificates/stats

Auth role: ADMIN

Response data: CertificateStats

```json
{
	"totalCertificates": 150,
	"issuedCertificates": 145,
	"revokedCertificates": 5,
	"certificatesThisMonth": 20,
	"certificatesThisYear": 80
}
```

## GET /api/certificates/recent?limit=10&page=1

Auth role: ADMIN

Response data: CertificateListResponse

```json
{
	"items": [
		{
			"certificateId": "CERT001",
			"studentName": "Student A",
			"studentEmail": "a@example.com",
			"className": "SD18303",
			"courseCode": "JS101",
			"averageScore": 8.5,
			"issuedAt": "2026-03-20T00:00:00",
			"status": "issued",
			"verificationHash": "abc123"
		}
	],
	"pagination": {
		"page": 1,
		"limit": 10,
		"total": 150,
		"totalPages": 15
	}
}
```

## GET /api/certificates/search?q=keyword&status=issued&limit=20

Auth role: ADMIN

Response data: CertificateListResponse (same shape as recent).

## GET /api/certificates/{certificateId}

Auth role: ADMIN

Response data: CertificateDetail

```json
{
	"certificateId": "CERT001",
	"studentId": "550e...",
	"studentName": "Student A",
	"studentEmail": "a@example.com",
	"classId": "CLS001",
	"className": "SD18303",
	"courseCode": "JS101",
	"courseName": "JavaScript Basics",
	"averageScore": 8.5,
	"issuedAt": "2026-03-20T00:00:00",
	"status": "issued",
	"verificationHash": "abc123",
	"blockchainInfo": {
		"transactionHash": "...",
		"blockNumber": "...",
		"contractAddress": "...",
		"networkName": "...",
		"explorerUrl": "..."
	},
	"quizResults": [
		{
			"quizId": "QZ001",
			"quizName": "Quiz 1",
			"score": 8.0,
			"maxScore": 10,
			"completedAt": "2026-03-15T10:00:00"
		}
	]
}
```

## POST /api/certificates/{certificateId}/verify

Auth role: ADMIN

Response data: CertificateVerificationResult

```json
{
	"certificateId": "CERT001",
	"isValid": true,
	"verificationHash": "abc123",
	"verifiedAt": "2026-03-31T15:00:00",
	"blockchainInfo": {
		"transactionHash": "...",
		"blockNumber": "...",
		"contractAddress": "...",
		"timestamp": "...",
		"status": "CONFIRMED"
	}
}
```

## POST /api/certificates/{certificateId}/revoke

Auth role: ADMIN

Request body: RevokeRequest

```json
{
	"reason": "Manual revoke",
	"revokedBy": "admin@certifyme.dev"
}
```

Response data: RevokeResponse

```json
{
	"certificateId": "CERT001",
	"status": "revoked",
	"revokedAt": "2026-04-01T09:00:00",
	"revokedByUserId": "550e...",
	"reason": "Manual revoke"
}
```

## GET /api/admin/users?role=TEACHER&status=ACTIVE&page=1&limit=20

Auth role: ADMIN

Response data: UserListResponse

```json
{
	"items": [
		{
			"userId": "550e...",
			"fullName": "Teacher A",
			"email": "teacher@example.com",
			"role": "TEACHER",
			"avatarUrl": "https://...",
			"isActive": true,
			"createdAt": "2026-01-01T00:00:00",
			"lastLoginAt": "2026-04-01T08:00:00"
		}
	],
	"pagination": {
		"page": 1,
		"limit": 20,
		"total": 100,
		"totalPages": 5
	}
}
```

## PUT /api/admin/users/{userId}/status

Auth role: ADMIN

Request body: UpdateUserStatusRequest

```json
{
	"isActive": false,
	"reason": "Disabled by admin"
}
```

Response data: UpdateUserStatusResponse

```json
{
	"userId": "550e...",
	"isActive": false,
	"updatedAt": "2026-04-01T09:00:00"
}
```

## PUT /api/admin/users/{userId}/role

Auth role: ADMIN

Request body:

```json
{
	"role": "TEACHER"
}
```

Response data: UpdateUserRoleResponse

```json
{
	"userId": "550e...",
	"previousRole": "STUDENT",
	"newRole": "TEACHER",
	"updatedAt": "2026-04-01T10:00:00"
}
```

---

# 6) HTTP STATUS & RESPONSE WRAPPER

Thông thường:

- 200: success
- 201: created (POST class, POST enrollments, POST quizzes)
- 400: validation/business error
- 401: unauthorized
- 403: forbidden
- 404: not found
- 500: server error

Response wrapper chuẩn:

```json
{
	"success": true,
	"message": "Optional message",
	"data": {},
	"error": null
}
```

Error wrapper:

```json
{
	"success": false,
	"message": "Optional message",
	"data": null,
	"error": "Detailed error"
}
```

---

# 7) FE CHECKLIST (Updated To Current BE)

## Authentication

- [ ] Login redirect tới /oauth2/authorization/google
- [ ] OAuth callback đọc token + role
- [ ] Gọi /api/auth/me lấy user profile
- [ ] Logout qua /api/auth/logout
- [ ] Nếu dùng /api/auth/check-role thì parse message (data hiện đang null)

## Student

- [ ] Dashboard dùng /api/student/{studentId}/courses theo shape CourseResponse
- [ ] Course detail dùng /api/courses/{courseId} theo shape CourseDetailResponse
- [ ] Quiz list/detail dùng field quizName, duration, optionA..optionD
- [ ] Submit quiz theo body studentId + answers
- [ ] Certificates dùng shape CertificateResponse

## Teacher

- [ ] Class create/update gửi classCode, courseId, teacherId, startDate, endDate
- [ ] Class students đọc StudentResponseDTO (không có studentCode trong list)
- [ ] Quiz create/update gửi quizName, duration, questionText, options.isCorrect
- [ ] Enrollment delete dùng query studentCode + classId

## Admin

- [ ] Cert stats dùng totalCertificates/issuedCertificates/revokedCertificates
- [ ] Cert recent/search đọc data.items + data.pagination
- [ ] User list đọc data.items + data.pagination
- [ ] Update user status gửi isActive boolean (không gửi status string)
