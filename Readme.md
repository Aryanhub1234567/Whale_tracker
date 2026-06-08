# 🐋 Primetrade.ai Selection Assignment: Whale Alert & Wallet Tracker

[cite_start]An enterprise-grade, high-performance RESTful API and supportive frontend dashboard built to monitor high-value blockchain wallet addresses ("Whales")[cite: 5, 7]. [cite_start]This system implements strict Model-View-Controller-Service architectural decoupling, robust Token-Based Authentication, and granular Role-Based Access Control (RBAC)[cite: 7, 10, 11].

---

## 🏗️ Architectural Core & Design Patterns
[cite_start]Unlike standard monolithic architectures that bundle database mutations within routing pipelines, this project utilizes a modular **Controller-Service Layer Pattern**[cite: 37]:
* [cite_start]**Routing Layer:** Maps clean, versioned REST endpoints and hooks input schemas[cite: 13, 37].
* [cite_start]**Middleware Guard Checkpoints:** Intercepts runtime requests to enforce data compliance, token validation, and administrative route locks[cite: 10, 11, 23, 25].
* [cite_start]**Controller Layer:** Orchestrates the incoming HTTP request context, isolates payload attributes, and maps standard REST status responses[cite: 37].
* **Service Layer (Business Logic Engine):** Houses core platform transactions, security handshakes, and verification algorithms completely decoupled from the transport mechanisms.
* [cite_start]**Database Schema Management:** Direct abstraction of structured MongoDB collections mapping secure relationships natively[cite: 15, 38].

---

## 🛠️ Tech Stack & Module Architecture
* [cite_start]**Backend Runtime:** Node.js with Express.js Framework[cite: 4, 9].
* [cite_start]**Database Engine:** MongoDB managed via Mongoose Object Modeling Object-Relational Layer[cite: 15, 38].
* [cite_start]**Security Protocol:** JSON Web Tokens (`jsonwebtoken`) and 12-factor adaptive salting (`bcryptjs`)[cite: 10, 24, 40].
* [cite_start]**Frontend UI Module:** Client Dashboard interface utilizing single-stage React.js architecture styled with atomic Tailwind CSS layouts[cite: 5, 17, 18].

---

## 🗄️ Database Schema Design
[cite_start]The data layer is engineered using two highly decoupled collections featuring strict validation criteria and compound database tracking constraints[cite: 15, 25, 38]:

### 1. User Model (`Collection: users`)
* `email` (String): Unique, forced lowercase, fully trimmed, strict regex validation format.
* `password` (String): Securely hashed on creation via pre-save Mongoose hook. [cite_start]Explicitly excluded (`select: false`) from standard lookups to prevent credential leakage[cite: 10, 40].
* [cite_start]`role` (String): System authorization type restricted to Enum constraints: `['user', 'admin']` (Defaults to `user`)[cite: 11].

### 2. Wallet Model (`Collection: wallets`)
* [cite_start]`address` (String): Enforced lowercase alphanumeric string validating strict EVM-compatible 42-character hexadecimal format (`^0x[a-fA-F0-9]{40}$`)[cite: 25].
* `label` (String): User-defined metadata container to identify target wallet owners.
* `userId` (ObjectId): Relational Mongoose index referencing the specific tenant account owning the track profile.
* [cite_start]`isFlaggedByAdmin` (Boolean): System-wide flag toggled exclusively by administrative commands[cite: 11].
* **Compound Index Constraint:** A compound unique index is explicitly set on `{ userId: 1, address: 1 }`. This pushes performance optimization to the database engine layer and prevents a single user account from adding identical duplicate wallet addresses to their tracking system.

---

## 🚦 Complete Versioned API Documentation

[cite_start]All platform actions are grouped under standard semantic API Versioning rules (`/api/v1/`)[cite: 13, 37].

### [cite_start]🔐 Authentication Context (`/api/v1/auth`) [cite: 10]
| Method | Endpoint | Access | Payload Description | Expected REST Response Status |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/register` | Public | `{ email, password, role }` | [cite_start]`201 Created` - Transmits fresh signed JWT token[cite: 10]. |
| `POST` | `/login` | Public | `{ email, password }` | [cite_start]`200 OK` - Validates criteria and yields token session[cite: 10]. |

### [cite_start]🐋 Watchlist CRUD Operations (`/api/v1/wallets`) [cite: 12]
[cite_start]*All endpoints below require a valid authentication token passed inside the headers as an `Authorization: Bearer <JWT>` token[cite: 20].*

| Method | Endpoint | Access | Payload / URL Context | Expected REST Response Status |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | User / Admin | None (Implicitly isolated to current `req.user.id`) | [cite_start]`200 OK` - Returns user tracking list array[cite: 21]. |
| `POST` | `/` | User | `{ address, label }` (Validates EVM constraints) | [cite_start]`201 Created` - Tracks a new address[cite: 21, 25]. |
| `PUT` | `/:id` | User | `{ label }` passed to target wallet parameter | [cite_start]`200 OK` - Modifies localized tracking name[cite: 21]. |
| `DELETE`| `/:id` | User | Target wallet parameter mapped in URL endpoint | [cite_start]`204 No Content` - Permanently deletes tracker[cite: 21]. |

### [cite_start]🛡️ Administrative Command Deck (`/api/v1/admin`) [cite: 11]
[cite_start]*Requires a valid admin-level authentication token[cite: 11].*

| Method | Endpoint | Access | Payload / URL Context | Expected REST Response Status |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/wallets` | Admin Only | None | [cite_start]`200 OK` - Aggregates cross-tenant watchlists alongside populated user records[cite: 11]. |
| `PATCH`| `/wallets/:id/flag` | Admin Only | `{ isFlagged: true/false }` | [cite_start]`200 OK` - Toggles system-wide scam/risk state flags[cite: 11]. |

---

## ⚡ Global Error Interception & Validation Engine
[cite_start]The architecture implements a centralized Express Error Middleware interceptor[cite: 13]. [cite_start]When database exceptions occur, the engine safely parses raw driver errors to shield the client architecture from system stack exposures[cite: 22]:
* **Duplicate Signatures (`Code 11000`):** Intercepted dynamically to issue an operational `400 Bad Request` informing user of schema constraint failures.
* **Parameter Identification Mismatches (`CastError`):** Converts system level casting flags into neat operational tracking alerts.
* [cite_start]**Token Expirations:** Detects standard `TokenExpiredError` and `JsonWebTokenError` states to drop explicit `401 Unauthorized` states, preventing application loops[cite: 24].

---

## 📈 Technical Scalability Note & System Architecture Evolution
[cite_start]To fulfill the enterprise readiness benchmarks required by the **Primetrade.ai Platform Core**, the system is designed to transition from this single-instance setup into a highly distributed real-time processing model[cite: 33, 44]:

### 1. High-Throughput Caching Tier (Redis Layer Implementation)
High-volume blockchain ledger lookups present severe database lock challenges. By deploying an in-memory **Redis Cache-Aside Strategy**, historical transaction records and system-wide admin flags are served with $O(1)$ efficiency. [cite_start]When an administrator flags a high-risk malicious wallet via `PATCH /admin/wallets/:id/flag`, the write event drops a transactional event trigger that instantly invalidates the cache key across distributed nodes, balancing low latency with consistency[cite: 33].

### 2. Distributed Microservices Isolation
[cite_start]As block processing demand spikes, the unified app can scale horizontally by decoupling into distinct runtime modules[cite: 33]:
* **Auth Service:** A lightweight cluster dedicated purely to cryptographic token operations and validation loops.
* **Ingestion Engine Service:** A separate worker cluster that handles web-socket connections to the blockchain nodes, parsing streaming transactions independently from client web requests.

### 3. Load Balancing & Horizon Scaling
[cite_start]Placing an **Nginx** or AWS Application Load Balancer (ALB) at the ingress gate allows horizontal container sets (Dockerized tasks managed under Kubernetes clusters) to distribute incoming traffic via standard round-robin or least-connection models[cite: 33, 44].

### 4. Database Optimization
To keep database reads fast as millions of records are saved, the system uses compound index patterns like `{ userId: 1, address: 1 }`. This allows the index to live entirely inside memory, preventing expensive, slow full-table scans.

---

## 🚀 Local Installation & Execution Checklist

### 1. Clone & Core Dependencies Installation
```bash
git clone <your-repository-url>
cd my-whale-tracker-backend
npm install
