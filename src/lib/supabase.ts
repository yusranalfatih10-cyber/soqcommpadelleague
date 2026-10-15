import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jttsyvioiqztfcurwvww.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0dHN5dmlvaXF6dGZjdXJ3dnd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE3MDgzMzcsImV4cCI6MjEwNzI4NDMzN30.81E1BZ2RapXxTcNkowN7Bvzw2EiFN692ape_bDr4E44';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
