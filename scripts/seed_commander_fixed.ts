import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  const phone = process.argv[2]
  const password = process.argv[3]

  if (!phone || !password) {
    console.error('Usage: npx tsx scripts/seed_commander_fixed.ts <phone> <password>')
    process.exit(1)
  }

  console.log(`🚀 Seeding commander: ${phone}...`)
  
  const { data, error } = await supabase.auth.signUp({
    phone: phone,
    password: password,
  })

  if (error) {
    console.error('❌ Failed:', error.message)
    process.exit(1)
  } else {
    console.log('✅ Success! Commander ID:', data.user?.id)
  }
}

main()
