# Backend Features Requirements

This document lists the backend logic simulated in the "My Kemet" and "Kemet Manager" frontend that requires real implementation.

## 1. Authentication & Security
- [ ] **NextAuth.js Integration**: Implement login for Users (`/`) and Admins (`/admin`).
- [ ] **Role-Based Access Control (RBAC)**: secure `/admin` routes.
- [ ] **Vehicle Pairing**: Secure handshake protocol to link a User Account to a Vehicle ID (VIN).

## 2. Kemet Store & Payments
- [ ] **Payment Gateway**: Integration with Stripe/Paystack/Orange Money.
- [ ] **Subscription Management**: Recurring billing logic for "Mode Sentinelle" and "Connectivity".
- [ ] **Feature Entitlement**: API to check if a specific vehicle has access to a feature (e.g., `GET /api/vehicles/:id/features`).

## 3. FOTA (Firmware Over-The-Air)
- [ ] **Update Registry**: Database of software versions (v2.4.1, v2.5.0) and release notes.
- [ ] **Deployment Engine**: Logic to push updates to vehicles (MQTT/WebSocket).
- [ ] **Telemetry Ingestion**: API to receive vehicle status (Battery, Location, Version) for the Admin Dashboard.

## 4. Analytics
- [ ] **Data Aggregation**: Jobs to calculate Daily Active Fleet, MRR, and Total Revenue.
- [ ] **Event Tracking**: Log user interactions (Unlock, Climate Start) for auditing.

## 5. Mobile App API
- [ ] **Rest API / GraphQL**: Expose all Dashboard controls (Lock, Climate) via API for the mobile app counterpart.
