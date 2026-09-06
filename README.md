# ACK Okoyo Church Website

A responsive, animated church website starter with a public site and a protected administration dashboard.

## Included
- Responsive home/about/history/ministries/gallery/contact sections
- Motion effects, responsive navigation, cards, timelines and modern church branding
- Live order-of-service data from SQLite; administrators can publish/delete services
- Church pictorial gallery with image uploads
- Tithes/offerings giving record form with M-Pesa PayBill 247247 and account 291900 prominently displayed
- Contact/prayer-request form stored in SQLite
- Admin dashboard for site text, service programme and gallery
- Uploaded user images stored in `/uploads`

## Run locally
1. Install Node.js 18+.
2. Copy `.env.example` to `.env` and set a strong `ADMIN_PASSWORD`.
3. Run `npm install`.
4. Run `npm start`.
5. Open `http://localhost:3000`.
6. Admin: `http://localhost:3000/admin.html`.

## Important payment note
The website provides the church's PayBill/account instructions and records a giving reference. It does **not** directly move money through M-Pesa. A true automated payment flow requires the church's Safaricom Daraja credentials, callback URL and a properly configured PayBill/Till integration. Do not put Daraja secrets in frontend JavaScript.

## Deployment
Deploy the Node app to a service that supports Node.js and persistent storage (or move SQLite to a managed database). Set environment variables on the host. Use HTTPS. Change the default admin password. For production, add proper authentication/session storage, rate limiting, backups, CSRF protection and email/SMS notifications.

## Content verification
The website uses the information visible in the supplied church materials. Historical dates, clergy names, service times, phone numbers, email addresses and social links should be confirmed by church leadership and updated in the admin panel before public launch.
