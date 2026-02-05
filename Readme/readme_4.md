1️⃣ Auth Architecture Overview (Before Code)
Authentication Flow
Register → bcrypt hash → store user
Login → bcrypt compare → JWT issued
Protected Route → JWT verify → role check

Security Principles Applied

Passwords never stored in plain text

JWT signed with secret from env

Token expiration enforced

Role-based access enforced via middleware

Centralized error handling