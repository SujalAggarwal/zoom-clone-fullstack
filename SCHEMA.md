# Zoom Clone Database Schema

## `users` Table
Stores user information. For this project, a default user is used.
- `id` (Primary Key, Integer)
- `name` (String)
- `email` (String, Unique)
- `created_at` (DateTime)

## `meetings` Table
Stores details about scheduled and instant meetings.
- `id` (Primary Key, Integer)
- `meeting_code` (String, Unique) - Short alphanumeric invite code.
- `host_id` (Foreign Key -> `users.id`)
- `title` (String)
- `description` (String, Nullable)
- `meeting_type` (Enum: `instant`, `scheduled`)
- `scheduled_at` (DateTime, Nullable)
- `duration_minutes` (Integer)
- `status` (Enum: `scheduled`, `ongoing`, `ended`)
- `created_at` (DateTime)

## `participants` Table
Stores participants who join a meeting.
- `id` (Primary Key, Integer)
- `meeting_id` (Foreign Key -> `meetings.id`)
- `display_name` (String)
- `is_host` (Boolean)
- `is_muted` (Boolean)
- `joined_at` (DateTime)
- `left_at` (DateTime, Nullable)

### Relationships
- A `User` can host many `Meetings` (One-to-Many).
- A `Meeting` belongs to one `User` (Host).
- A `Meeting` has many `Participants` (One-to-Many).
