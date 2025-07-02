import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cgdpxelqonsrpkaxgcpy.supabase.co' // replace this!
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnZHB4ZWxxb25zcnBrYXhnY3B5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0MzgwNDcsImV4cCI6MjA2NzAxNDA0N30.DLcjt0iCpuIm10J5F3bDSbLZBuo9FT-uQDPuWX0rx0g'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
