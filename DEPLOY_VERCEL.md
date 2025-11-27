# 🚀 Guia de Deploy do Frontend na Vercel

Este documento explica como fazer o deploy do **frontend** do projeto Versace Leads OS na Vercel.

## 📋 Situação Atual

| Componente | Status | Hospedagem |
|------------|--------|------------|
| **Backend API** | ✅ Já configurado | Render |
| **Banco de Dados** | ✅ Já configurado | Render PostgreSQL |
| **Frontend** | ⏳ Pendente | Vercel |

### Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                         VERCEL                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │          Frontend (Vue.js/Vite - Static)                  │  │
│  │              seu-projeto.vercel.app                       │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ VITE_API_URL
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         RENDER                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │            Backend (Node.js + Express + Prisma)           │  │
│  │                   ✅ Já rodando                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              ▼                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              PostgreSQL Database                          │  │
│  │    dpg-d4j80eemcj7s73bc1ri0-a.oregon-postgres.render.com │  │
│  │                   ✅ Já configurado                       │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Deploy do Frontend na Vercel

### Pré-requisitos

- [x] Backend rodando no Render
- [x] Banco de dados PostgreSQL configurado
- [ ] Conta no GitHub com o repositório do projeto
- [ ] Conta na Vercel (gratuito)

---

### Passo 1: Verificar arquivo `vercel.json`

O arquivo `vercel.json` já está configurado na raiz do projeto:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/((?!api).*)",
      "destination": "/index.html"
    }
  ]
}
```

✅ **Já está pronto!**

---

### Passo 2: Fazer Deploy na Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login com GitHub

2. Clique em **"Add New..."** → **"Project"**

3. Selecione o repositório `otimizacaoDC`

4. Configure o projeto:
   | Configuração | Valor |
   |--------------|-------|
   | **Framework Preset** | Vite |
   | **Root Directory** | `.` (deixe vazio) |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `dist` |

5. **⚠️ IMPORTANTE** - Adicione a Variável de Ambiente:
   
   Clique em **"Environment Variables"** e adicione:
   
   | Nome | Valor |
   |------|-------|
   | `VITE_API_URL` | `https://SEU-BACKEND.onrender.com` |

   > **Substitua** `SEU-BACKEND` pela URL real do seu backend no Render!

6. Clique em **"Deploy"**

7. Aguarde o build completar (~1-2 minutos)

8. Acesse a URL gerada (ex: `https://seu-projeto.vercel.app`)

---

### Passo 3: Configurar CORS no Backend (se necessário)

Se você receber erros de CORS, adicione a URL do frontend nas variáveis do backend no Render:

1. Acesse o dashboard do Render
2. Vá no seu serviço de backend
3. Em **Environment**, adicione:
   ```
   FRONTEND_URL=https://seu-projeto.vercel.app
   ```

4. E atualize o arquivo `server/src/index.js` para aceitar a origem da Vercel:

```javascript
// Configurar CORS para produção
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sem origin (mobile apps, Postman, etc)
    if (!origin) return callback(null, true)
    
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true)
    }
    
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true
}))
```

---

## 📝 Resumo das Variáveis de Ambiente

### Frontend (Vercel)

| Variável | Descrição | Valor |
|----------|-----------|-------|
| `VITE_API_URL` | URL da API no Render | `https://SEU-BACKEND.onrender.com` |

### Backend (Render) - Já configurado

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | ✅ Já configurado |
| `PORT` | ✅ Já configurado |
| `JWT_SECRET` | ✅ Já configurado |
| `ADMIN_EMAIL` | ✅ Já configurado |
| `ADMIN_PASSWORD_HASH` | ✅ Já configurado |
| `FRONTEND_URL` | Adicionar após deploy (URL da Vercel) |

---

## 🐛 Troubleshooting

### Erro: "CORS blocked"

- Adicione `FRONTEND_URL` nas variáveis do backend no Render
- Certifique-se que a URL não tem barra no final
- Verifique se o código de CORS aceita `.vercel.app`

### Frontend mostra página em branco

- Verifique o console do navegador (F12)
- Confirme que `VITE_API_URL` está configurada corretamente na Vercel
- A URL deve ser **sem barra** no final: `https://api.onrender.com` ✅

### Erro: "Failed to fetch" ou "Network Error"

- Verifique se o backend está rodando no Render
- Teste acessando `https://SEU-BACKEND.onrender.com/health` no navegador
- Confira se a variável `VITE_API_URL` está correta

### Build falha na Vercel

- Verifique se o `package.json` está na raiz do projeto
- Confira os logs de build na Vercel para ver o erro específico

---

## 🎯 URLs Finais

Após o deploy, você terá:

| Serviço | URL |
|---------|-----|
| **Frontend** | `https://seu-projeto.vercel.app` |
| **Backend API** | `https://SEU-BACKEND.onrender.com/api` |
| **Health Check** | `https://SEU-BACKEND.onrender.com/health` |

---

## ✅ Checklist Final

- [ ] Frontend deployado na Vercel
- [ ] Variável `VITE_API_URL` configurada na Vercel
- [ ] Variável `FRONTEND_URL` configurada no Render (para CORS)
- [ ] Teste de login funcionando
- [ ] Dashboard carregando dados

---

**Pronto!** Seu projeto está no ar! 🎉
