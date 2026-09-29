GUBALI HIGH SCHOOL - FULL VERSION

1. INSTALL NODE.JS LTS kwenye Windows.
2. Fungua folder hili.
3. Bonyeza mara mbili: start-windows.bat
4. Acha black window likiwa wazi.
5. Fungua Chrome:
   http://localhost:3000
6. Authority dashboard:
   http://localhost:3000/admin.html

DEFAULT DEMO LOGIN
Username: authority
Password: change-this-before-deployment

MUHIMU:
- Badilisha ADMIN_PASSWORD kwenye .env kabla ya kutumia online.
- Maombi huhifadhiwa kwenye data/applications.json.
- Registered students huhifadhiwa kwenye data/students.json.
- Hakuna npm install inayohitajika kwa project hii; server.js hutumia Node.js built-ins.

KAMA .BAT INAKATAA
Fungua CMD ndani ya folder hili na uandike:
node -v
node server.js

Kama node -v haionyeshi version, install Node.js LTS kwanza.
