# Softride FOTA & Features-On-Demand POC

Simple proof-of-concept web app to publish updates (FOTA) and let customers download updates or feature bundles on demand.

Quick start

1. Install dependencies

```bash
npm install
```

2. Run the server

```bash
npm start
```

3. Open UIs

- Admin: http://localhost:3000/admin.html
- Customer: http://localhost:3000/customer.html

Notes

- Default admin token: `secret-token`. Override with `ADMIN_TOKEN` env var.
- Published files are stored in `data/updates` and metadata in `data/db.json`.
# softride