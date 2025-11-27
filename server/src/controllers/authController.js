import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'rhuanc01@gmail.com'
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH

export async function login(req, res, next) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' })
    }

    // Verificar email
    if (email !== ADMIN_EMAIL) {
      return res.status(401).json({ message: 'Credenciais inválidas' })
    }

    // Verificar senha
    if (ADMIN_PASSWORD_HASH) {
      // Em produção, usar hash do env
      const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH)
      if (!isValid) {
        return res.status(401).json({ message: 'Credenciais inválidas' })
      }
    } else {
      // Em desenvolvimento, usar senha direta (não recomendado para produção)
      const devPassword = 'Rhuancar@17'
      if (password !== devPassword) {
        return res.status(401).json({ message: 'Credenciais inválidas' })
      }
    }

    // Gerar token JWT
    const token = jwt.sign(
      { email, id: 'admin' },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.json({
      token,
      user: {
        email,
        id: 'admin',
      },
    })
  } catch (error) {
    next(error)
  }
}

