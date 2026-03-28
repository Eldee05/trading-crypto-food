import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://iowykrzzxuubbvfkctim.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImRjZjFiZjk3LTM4NjItNGYzNC1hYjc2LTlmZWYxNDVjZTI4OSJ9.eyJwcm9qZWN0SWQiOiJpb3d5a3J6enh1dWJidmZrY3RpbSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzcyNDgwNzE1LCJleHAiOjIwODc4NDA3MTUsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.msAO_W_8mBYnCoFHmsExIxUopfrD8zDS7rU5umhip18';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };