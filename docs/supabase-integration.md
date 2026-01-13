# Kemet Backend - Supabase Integration Guide

## ✅ Migration Completed

Your Kemet backend is now connected to Supabase PostgreSQL!

### Migration Summary
- ✅ 2 users migrated
- ✅ 2 vehicles migrated  
- ✅ 4 features migrated
- ✅ 1 subscription migrated
- ✅ 3 FOTA campaigns migrated

## Database Structure

Your Supabase database now contains:

### Core Tables
- `users` - User accounts
- `vehicles` - Vehicle fleet
- `user_vehicles` - User-vehicle relationships
- `features` - Available features in Kemet Store
- `subscriptions` - Active subscriptions
- `fota_campaigns` - Firmware update campaigns

### Views (for analytics)
- `vehicle_status_view` - Real-time vehicle status
- `revenue_analytics_view` - Revenue metrics
- `active_updates_view` - FOTA deployment status

## Using the API

### 1. Start the Backend Server

```bash
cd /home/mericstudent/softride
npm run backend:dev
```

Server runs on: **http://localhost:5001**

### 2. Test Endpoints

#### Login
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"meric@kemet.com","password":"password"}'
```

#### Get Vehicle Info
```bash
curl http://localhost:5001/api/vehicles/v1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Get Features
```bash
curl http://localhost:5001/api/store/features
```

## Supabase Dashboard

Access your data directly:
**https://zjjkfjxhzqnagasufeok.supabase.co**

### Useful Queries

#### View all users
```sql
SELECT * FROM users;
```

#### View vehicles with their owners
```sql
SELECT v.*, u.email, u.first_name 
FROM vehicles v
JOIN user_vehicles uv ON v.vehicle_id = uv.vehicle_id
JOIN users u ON uv.user_id = u.user_id;
```

#### Revenue analytics
```sql
SELECT * FROM revenue_analytics_view;
```

## Next Steps

### 1. Update Remaining Routes

The following routes still need to be migrated to use Supabase:
- `store.js` - ✅ Partially done
- `updates.js` - ⏳ TODO
- `analytics.js` - ⏳ TODO

### 2. Enable Row Level Security (RLS)

In Supabase Dashboard → Authentication → Policies:

```sql
-- Users can only read their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only control their own vehicles
CREATE POLICY "Users can control own vehicles" ON vehicles
  FOR UPDATE USING (
    vehicle_id IN (
      SELECT vehicle_id FROM user_vehicles 
      WHERE user_id = auth.uid()
    )
  );
```

### 3. Real-time Subscriptions

Enable real-time updates for vehicle status:

```javascript
const supabase = require('./config/supabase');

// Subscribe to vehicle changes
supabase
  .channel('vehicle-changes')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'vehicles'
  }, (payload) => {
    console.log('Vehicle updated:', payload);
  })
  .subscribe();
```

## Troubleshooting

### Migration Failed?
Re-run the migration script:
```bash
node backend/src/scripts/migrate-to-supabase.js
```

### Connection Issues?
Check your `.env` file:
```bash
SUPABASE_URL=https://zjjkfjxhzqnagasufeok.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Query Errors?
Check Supabase logs in Dashboard → Logs → Postgres Logs

## Benefits of Supabase

✅ **Scalability** - PostgreSQL handles millions of records  
✅ **Real-time** - WebSocket subscriptions for live updates  
✅ **Security** - Row Level Security policies  
✅ **Backups** - Automatic daily backups  
✅ **Analytics** - Built-in query performance monitoring  
✅ **Storage** - File storage for firmware packages  

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)
- [PostgreSQL Tutorial](https://www.postgresql.org/docs/current/tutorial.html)
