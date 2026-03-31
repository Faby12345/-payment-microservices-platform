
#  Fintech-Grade Auth Service & React Gateway

A high-security, stateless Identity Provider (IdP) built with **Spring Boot 3** and **React**. This project implements an industry-standard **Hybrid Token Architecture** to neutralize XSS and session hijacking, moving away from insecure "JWT in LocalStorage" patterns.

---

##  The Architecture
This project uses a split-token strategy to balance security with a seamless user experience. 



### 1. The "Hybrid" Security Strategy
* **Access Tokens (Short-lived: 15m):** Stored strictly in **React Memory** (JavaScript state). By avoiding `localStorage`, we make it impossible for XSS (Cross-Site Scripting) attacks to steal the active session key.
* **Refresh Tokens (Long-lived: 7d):** Stored in a **Secure, HttpOnly Cookie**.
    * **HttpOnly:** JavaScript cannot access this cookie, preventing theft via malicious scripts.
    * **Path-Restricted:** The browser only sends this cookie to `/api/v1/auth`, minimizing the attack surface.
* **Stateless Persistence:** Because the Refresh Token is in a cookie, the user stays logged in even after a page refresh. React simply calls the refresh endpoint on mount to get a new memory-based Access Token.

### 2. Why this is better than "Standard" JWTs
| Feature | Standard JWT (Local Storage) | This Implementation |
| :--- | :--- | :--- |
| **XSS Protection** |  Vulnerable (Token can be stolen) |  Protected (Stored in memory/HttpOnly) |
| **Revocation** |  Impossible until expiry |  Possible (Database check on refresh) |
| **Attack Window** |  Length of the token (e.g. 7 days) |  15 minutes max (if Access Token is leaked) |
| **CSRF Protection** | Naturally protected |  Protected via SameSite + Bearer Header |

---

## 🛠️ Tech Stack
* **Backend:** Java 17, Spring Boot 3, Spring Security, JPA/Hibernate.
* **Database:** PostgreSQL (with Flyway for migrations).
* **Security:** JJWT (Json Web Token), BCrypt Password Hashing.
* **Frontend:** React, Axios (with Interceptors for silent refreshing).
* **DevOps:** Docker, Docker Compose.

---

## ⚙️ How It Works (The "Silent Refresh" Flow)
1.  **Login:** User submits credentials. Backend returns an `accessToken` in the JSON body and sets a `refresh_token` cookie.
2.  **Authenticated Requests:** React attaches the Access Token to the `Authorization: Bearer` header for all business API calls.
3.  **Token Expiry:** When the 15m Access Token expires, the backend returns a `401 Unauthorized`.
4.  **Automatic Recovery:** An **Axios Interceptor** catches the 401, calls `/api/v1/auth/refresh` (sending the cookie), receives a new Access Token, and retries the original failed request. **The user never sees a login screen.**

---

## 🛠️ Local Setup

### Prerequisites
* Docker & Docker Compose
* JDK 17+
* Node.js & npm

### 1. Environment Configuration
Create a `.env` file in the root directory:
```env
POSTGRES_DB=auth_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_PORT=5432
JWT_SECRET_KEY=your_64_character_hex_string
```
### 2 Run with Docker
Spin up the PostgreSQL database:
docker-compose up -d

### 3. Start the Backend
./mvnw spring-boot:run

### 4. Start the Frontend
npm install
npm start

### Key Security Features
Password Hashing: Passwords are never stored in plain text (BCrypt).

Token Revocation: Logout deletes the Refresh Token from the DB, instantly invalidating the session.

Stateless Auth: No HttpSession is used, making the service ready for horizontal scaling.

Strict Cookie Policy: Cookies are configured with SameSite=Strict and HttpOnly flags.


