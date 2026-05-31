# How to Run NUverse Laguna

## Before the Presentation — Do This First

### 1. Start PostgreSQL
Make sure your PostgreSQL database is running. If using Codespace, it starts automatically.

Check it's running:
```bash
pg_isready
```

### 2. Start the Backend
```bash
cd /workspaces/NUverse-Laguna/backend/demo
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

Wait until you see:
```
Started NUverseLagunaApplication in X.XXX seconds
```

The `dev` profile seeds all demo data automatically on first run.

Backend runs on: **http://localhost:8080**

### 3. Start the Frontend
Open a second terminal:
```bash
cd /workspaces/NUverse-Laguna/frontend
npm run dev
```

Wait until you see:
```
VITE ready in Xms ➜ Local: http://localhost:5173/
```

Frontend runs on: **http://localhost:5173**

---

## Demo Accounts (All Pre-Seeded)

| Role | Email | Password | Use For |
|---|---|---|---|
| **Admin** | admin@nu-laguna.edu.ph | Admin@12345 | Show admin panel, suspend users, manage announcements |
| **Faculty** | faculty@nu-laguna.edu.ph | Faculty@12345 | Show event creation, announcement publishing |
| **Student 1** | student1@students.nu-laguna.edu.ph | Student@12345 | Main demo account (Alex Dela Cruz) |
| **Student 2** | student2@students.nu-laguna.edu.ph | Student@12345 | Secondary account for messaging/follow demo |
| **Student 3** | student3@students.nu-laguna.edu.ph | Student@12345 | Extra account |

---

## If Something Goes Wrong

**Backend won't start:**
```bash
# Kill whatever is on port 8080
lsof -ti:8080 | xargs kill -9
# Try again
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

**Frontend won't start:**
```bash
# Kill whatever is on port 5173
lsof -ti:5173 | xargs kill -9
# Try again
npm run dev
```

**Database issues / data looks wrong:**
```bash
# Connect to PostgreSQL and reset
psql -U postgres -d nuverse_laguna -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
# Then restart backend — it will re-migrate and re-seed automatically
```

**Port forwarding in Codespace:**
- Make sure port 5173 is forwarded and set to **Public** visibility
- In VS Code: Ports tab → right-click 5173 → Port Visibility → Public

---

## Quick Test Before Going Live

Login with student1, check:
- [ ] Dashboard loads with events and listings
- [ ] Bulldog Exchange shows products with individual sizes
- [ ] Marketplace shows listings
- [ ] Chibi companion appears bottom-right
- [ ] Login loading screen showed (chibi appears after login)
- [ ] Dark mode toggle works
- [ ] Admin panel accessible when logged in as admin

If all pass — you're ready. 🐾
