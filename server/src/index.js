import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import leadsRouter from './routes/leads.js'
import statsRouter from './routes/stats.js'
import authRouter from './routes/auth.js'
import { authenticateToken } from './middleware/auth.js'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Rota de autenticação (pública)
app.use('/api/auth', authRouter)

// Rotas protegidas
app.use('/api/leads', authenticateToken, leadsRouter)
app.use('/api/stats', authenticateToken, statsRouter)

app.use((err, req, res, next) => {
  console.error(err)
  res
    .status(err.status ?? 500)
    .json({ message: err.message ?? 'Erro interno. Verifique os logs.' })
})

const port = process.env.PORT || 3333

app.listen(port, () => {
  console.log(`🚀 API pronta em http://localhost:${port}`)
})

