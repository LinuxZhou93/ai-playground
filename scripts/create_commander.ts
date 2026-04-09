import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'
import readline from 'readline'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

async function main() {
  console.log('🛡️  项目 Chronos: 指挥官账号创建向导')
  console.log('-----------------------------------')

  rl.question('请输入指挥官手机号 (例: +8613800138000): ', (phone) => {
    rl.question('请输入初始访问密令 (密码): ', async (password) => {
      console.log('\n🚀 正在同步至 Supabase 云端...')
      
      const { data, error } = await supabase.auth.signUp({
        phone: phone,
        password: password,
      })

      if (error) {
        console.error('❌ 创建失败:', error.message)
      } else {
        console.log('✅ 创建成功！')
        console.log('指挥官 ID:', data.user?.id)
        console.log('\n现在您可以运行 `pnpm run dev` 并登录控制台了。')
      }
      
      rl.close()
    })
  })
}

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 错误: 未能在 .env.local 中找到 Supabase 配置，请确保在项目根目录运行。')
  process.exit(1)
}

main()
