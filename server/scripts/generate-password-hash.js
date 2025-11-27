import bcrypt from 'bcrypt'

const password = process.argv[2] || 'Rhuancar@17'

bcrypt.hash(password, 10).then((hash) => {
  console.log('\n✅ Hash gerado com sucesso!\n')
  console.log('Adicione esta linha ao seu arquivo .env:')
  console.log(`ADMIN_PASSWORD_HASH="${hash}"\n`)
})

