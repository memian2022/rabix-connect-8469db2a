import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ckbevrmyyfeewigoiwsw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrYmV2cm15eWZlZXdpZ29pd3N3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMDczMDMsImV4cCI6MjA4Nzc4MzMwM30.8E7wy5hcnHU4GdXx1_vS_opPRja6-NBEM7MaFQ5hoJo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
