-- Tambahkan kolom gender dan position ke tabel players
-- Jalankan SQL ini di Supabase SQL Editor

-- Tambah kolom gender (opsional, default null)
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', '') OR gender IS NULL);

-- Tambah kolom position (opsional, default null)
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS position TEXT CHECK (position IN ('right', 'left', '') OR position IS NULL);

-- SELESAI! Kolom baru telah ditambahkan.
