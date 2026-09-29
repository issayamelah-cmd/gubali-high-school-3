# Gubali High School Website & Admissions Portal

A responsive school website with an online admissions form, a school-authority dashboard, CSV export, student registration, and a lightweight **Gubali AI** website assistant.

## What is included

- Public school website: `Home`, `About`, `School Life`, `Gallery`, `Admissions`, `Requirements`, `Contact`.
- Online application at `/apply.html`, based on the uploaded Gubali joining form.
- Parent/guardian and emergency-contact fields.
- Passport photo upload fields with browser-side image resizing.
- Application submission endpoint with unique application ID.
- Authority login and dashboard at `/admin.html`.
- Review/status workflow: submitted → reviewing → approved → registered (or rejected).
- Student registration number generation, e.g. `GHS-2026-0001`.
- CSV export for the admissions register.
- Lightweight Gubali AI that answers common questions about the website, admissions, requirements, contacts and location without needing a paid AI API.
- Original supplied joining instructions PDF at `/docs/Gubali-Joining-Instructions-2026.pdf`.

## Important content rule

The site deliberately does **not** invent a detailed institutional history, staff names, photographs, or school achievements. Replace the placeholders with material approved by the school authority.

The supplied form identifies the school as **Shule ya Sekondari Gubali**, P.O. Box 507, Kondoa-Dodoma, with email `gubalisecondary@gmail.com` and published contacts including `+255 713 484 974` and `+255 718 840 327`. It also describes the location as about 15 km from Kondoa town toward Babati/Arusha.

A public school directory was used only to add the statement that the school is a government school in Bolisa, Kondoa Town Council and was registered in 2007. Treat the public-directory material as secondary context and keep official school copy authoritative.

## Local setup

1. Install Node.js 18+. No npm packages are required for this version.
2. Copy `.env.example` to `.env` and set a strong administrator password:
   ```text
   ADMIN_USER=authority
   ADMIN_PASSWORD=your-strong-password
   ```
3. Start the server:
   ```bash
   npm start
   ```
4. Open `http://localhost:3000`.
5. Open `http://localhost:3000/admin.html` for the authority dashboard.

### Demo login
If you do not set environment variables, the demo uses:
- Username: `authority`
- Password: `change-this-before-deployment`

**Change this before putting the site online.**

## Data storage

For this portable version, applications are stored in `data/applications.json` and registered students in `data/students.json`. This is intentionally simple for a school prototype and works without a separate database server.

For real deployment, move the records to a proper database, add role-based accounts, backups, audit logs, HTTPS, upload scanning, stricter access controls and a formal privacy/data-retention policy.

## Adding school photos

Place approved photos in:

- `public/assets/images/environment/`
- `public/assets/images/staff/`
- `public/assets/images/students/`

Then replace the placeholder blocks in `public/index.html` with normal `<img>` tags. Do not publish student images without the school’s appropriate consent and safeguarding process.

## Deploying online

This is an Express application, so it can be deployed to a Node-compatible hosting service. Set the environment variables there, use HTTPS, and keep `data/` and any uploaded student photos on protected storage rather than publicly exposed static folders.
