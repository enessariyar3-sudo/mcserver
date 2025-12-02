# Database Setup Guide

This folder contains all SQL files needed to set up the database from scratch.

## Setup Order

Run the SQL files in this order:

1. `01-enums.sql` - Create custom types/enums
2. `02-tables.sql` - Create all tables
3. `03-functions.sql` - Create database functions
4. `04-triggers.sql` - Create triggers
5. `05-rls-policies.sql` - Set up Row Level Security policies
6. `06-initial-data.sql` - Insert default/seed data

## How to Run

### Option 1: Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste each file's content
4. Run them in order

### Option 2: Supabase CLI
```bash
supabase db reset
# Or run each file individually
psql -h your-db-host -U postgres -d postgres -f 01-enums.sql
psql -h your-db-host -U postgres -d postgres -f 02-tables.sql
# ... continue for all files
```

## Environment Variables Needed

After database setup, configure these secrets in Supabase:
- `RCON_HOST` - Your Minecraft server RCON host
- `RCON_PORT` - Your Minecraft server RCON port
- `RCON_PASSWORD` - Your Minecraft server RCON password
- `RCON_ENCRYPTION_KEY` - Encryption key for storing RCON passwords
- `MINECRAFT_SERVER_HOST` - Your Minecraft server host
- `MINECRAFT_SERVER_PORT` - Your Minecraft server port
