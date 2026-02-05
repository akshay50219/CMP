 3️⃣ Backend Folder Structure (Modular MVC)

```
backend/
│
├── src/
│   │
│   ├── config/
│   ├── models/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   ├── uploads/
│   │   └── .gitkeep
│   │
│   ├── app.js
│   └── server.js
│
├── .env.example
├── package.json
└── package-lock.json
```

### 🔍 Backend Folder Responsibilities

#### 📁 `config/`

**Centralized configuration**

* Database connection (MongoDB / Mongoose)
* JWT secrets
* Environment-based configs
* Third-party service setup (email, cloud storage, etc.)

> Keeps configuration out of business logic.

---

#### 📁 `models/`

**Mongoose schemas only**

* User
* Conference
* Paper
* Review
* Submission
* Role / Permissions

Rules:

* No business logic
* No request/response handling

---

#### 📁 `controllers/`

**Business logic layer**

* Handles requests
* Calls services/models
* Returns responses

Examples:

* Auth logic
* Paper submission workflow
* Reviewer assignment
* Decision making (accept/reject)

> Controllers are *thin but smart*.

---

#### 📁 `routes/`

**API contract**

* Maps HTTP routes → controllers
* Versioned APIs (future-proofing)

Examples:

* `/auth`
* `/users`
* `/conferences`
* `/papers`
* `/reviews`

> Zero logic. Routing only.

---

#### 📁 `middleware/`

**Request pipeline**

* JWT authentication
* Role-based access control
* Request validation
* Error handling
* File upload filters

> Middleware = security + consistency.

---

#### 📁 `utils/`

**Reusable helpers**

* Token generators
* Password helpers
* Email utilities
* File naming helpers
* Constants

> Keeps controllers clean.

---

#### 📁 `uploads/`

**User-generated content**

* Research papers (PDFs)
* Conference banners
* Profile images

📌 `.gitkeep` is required because:

* Folder must exist in production
* Git ignores empty directories

---

#### 📄 `app.js`

* Express app initialization
* Middleware registration
* Route mounting

#### 📄 `server.js`

* Server startup
* Database connection
* Environment bootstrap