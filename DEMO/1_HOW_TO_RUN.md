# How to Run — NUverse Laguna

## Start Everything (Do This 30 Min Before)

### Step 1 — Start the Backend
Open a terminal and run:
```bash
cd /workspaces/NUverse-Laguna/backend/demo
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

Wait until you see this line in the terminal:
```
Started NUverseLagunaApplication in X.XX seconds
```
Backend is running on **http://localhost:8080**

---

### Step 2 — Start the Frontend
Open a second terminal and run:
```bash
cd /workspaces/NUverse-Laguna/frontend
npm run dev
```

Wait until you see:
```
VITE ready — Local: http://localhost:5173/
```
Frontend is running on **http://localhost:5173**

---

### Step 3 — Open the Browser
Go to: **http://localhost:5173**

If you're on GitHub Codespace — use the forwarded URL shown in the Ports tab.
Make sure port **5173** is set to **Public** visibility.

---

## Demo Accounts

| What | Email | Password |
|---|---|---|
| Admin | admin@nu-laguna.edu.ph | Admin@12345 |
| Faculty | faculty@nu-laguna.edu.ph | Faculty@12345 |
| Student (main) | student1@students.nu-laguna.edu.ph | Student@12345 |
| Student 2 | student2@students.nu-laguna.edu.ph | Student@12345 |

---

## Pre-Demo Checklist (Run Through This Before Presenting)

- [ ] Backend started and shows "Started NUverseLagunaApplication"
- [ ] Frontend started and shows "VITE ready"
- [ ] Logged in as student1 — dashboard loads with events and listings
- [ ] Bulldog Exchange — products show with individual sizes (XS, S, M, L, etc.)
- [ ] Marketplace — listings are visible
- [ ] Chibi companion visible in bottom-right corner
- [ ] Dark/light mode toggle works
- [ ] Admin panel accessible when logged in as admin
- [ ] Browser zoom set to 90% so more fits on screen
- [ ] Already logged OUT before presentation starts

---

## If Something Breaks During Demo

**Backend won't start:**
```bash
# Kill port 8080 and try again
fuser -k 8080/tcp
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

**Frontend won't start:**
```bash
fuser -k 5173/tcp
npm run dev
```

**Data looks wrong / products missing:**
```bash
# Reset the whole database (backend will re-seed on next start)
PGPASSWORD=postgres psql -h localhost -U postgres -d nuverse_laguna \
  -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
# Then restart the backend
```

**Something crashes during the demo:**
Just say: *"Let me show this from the code side"* and walk them through the architecture diagram on your slide instead. Stay calm.
