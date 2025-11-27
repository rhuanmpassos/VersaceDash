# 🚀 Guia Completo de Deploy na Vercel

Este documento explica como fazer o deploy do **backend** e **frontend** do projeto Versace Leads OS na Vercel, separados (igual ao seu projeto Next.js).

## 📋 Situação Atual

| Componente | Status | Hospedagem |
|------------|--------|------------|
| **Banco de Dados** | ✅ Já configurado | Render PostgreSQL |
| **Backend API** | ⏳ Pendente | Vercel (Serverless) |
| **Frontend** | ⏳ Pendente | Vercel (Static) |

### Arquitetura Final

```
┌─────────────────────────────────────────────────────────────────┐
│                         VERCEL                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │          Frontend (Vue.js/Vite - Static)                  │  │
│  │              seu-projeto.vercel.app                       │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │          Backend (Node.js/Express - Serverless)          │  │
│  │          seu-backend.vercel.app                          │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ DATABASE_URL
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         RENDER                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              PostgreSQL Database                          │  │
│  │    dpg-d4j80eemcj7s73bc1ri0-a.oregon-postgres.render.com │  │
│  │                   ✅ Já configurado                       │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Banco de Dados

O banco de dados PostgreSQL já está configurado no Render:

```
DATABASE_URL=postgresql://rhuan:aIddTJ0AK7k9fl85WdOPFGaBRaX5USJH@dpg-d4j80eemcj7s73bc1ri0-a.oregon-postgres.render.com/telegram_fvwj
```

✅ **Já está pronto!**

---

## ⚙️ PASSO 1: Deploy do Backend na Vercel

### 1.1 Preparação

O backend já está preparado com:
- ✅ `server/vercel.json` configurado
- ✅ `server/src/index.js` adaptado para Vercel Serverless

### 1.2 Deploy do Backend

1. Acesse [vercel.com](https://vercel.com) e faça login com GitHub

2. Clique em **"Add New..."** → **"Project"**

3. Selecione o repositório `otimizacaoDC`

4. ⚠️ **IMPORTANTE**: Configure o projeto para o **BACKEND**:
   | Configuração | Valor |
   |--------------|-------|
   | **Framework Preset** | Other |
   | **Root Directory** | `server` |
   | **Build Command** | `npm install && npm run prisma:generate` |
   | **Output Directory** | (deixe vazio) |

5. Adicione as **Variáveis de Ambiente**:
   
   | Nome | Valor |
   |------|-------|
   | `DATABASE_URL` | `postgresql://rhuan:aIddTJ0AK7k9fl85WdOPFGaBRaX5USJH@dpg-d4j80eemcj7s73bc1ri0-a.oregon-postgres.render.com/telegram_fvwj` |
   | `PORT` | `3333` |
   | `JWT_SECRET` | `sua-chave-secreta-super-forte-minimo-32-caracteres` |
   | `ADMIN_EMAIL` | `rhuanc01@gmail.com` |
   | `ADMIN_PASSWORD_HASH` | `$2b$10$...` (hash bcrypt da sua senha) |
   | `FRONTEND_URL` | `https://seu-frontend.vercel.app` (adicionar depois) |
   | `NODE_ENV` | `production` |

   **Para gerar o hash da senha**, rode localmente:
   ```bash
   cd server
   node -e "const bcrypt = require('bcrypt'); bcrypt.hash('SuaSenhaAqui', 10).then(h => console.log(h))"
   ```

6. Clique em **"Deploy"**

7. Aguarde o build completar (~2-3 minutos)

8. ⚠️ **Anote a URL gerada** (ex: `https://versace-api.vercel.app`)

9. Teste acessando: `https://seu-backend.vercel.app/health`

---

## 🎨 PASSO 2: Deploy do Frontend na Vercel

### 2.1 Preparação

O frontend já está preparado com:
- ✅ `vercel.json` configurado na raiz
- ✅ Rewrites para Vue Router funcionar

### 2.2 Deploy do Frontend

1. Ainda na Vercel, clique em **"Add New..."** → **"Project"** novamente

2. Selecione o **mesmo repositório** `otimizacaoDC`

3. ⚠️ **IMPORTANTE**: Configure o projeto para o **FRONTEND**:
   | Configuração | Valor |
   |--------------|-------|
   | **Framework Preset** | Vite |
   | **Root Directory** | `.` (deixe vazio ou `.`) |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `dist` |

4. Adicione a **Variável de Ambiente**:
   
   | Nome | Valor |
   |------|-------|
   | `VITE_API_URL` | `https://seu-backend.vercel.app` |

   ⚠️ **Use a URL do backend que você anotou no Passo 1!**

5. Clique em **"Deploy"**

6. Aguarde o build completar (~1-2 minutos)

7. ⚠️ **Anote a URL gerada** (ex: `https://versace-frontend.vercel.app`)

---

## 🔧 PASSO 3: Configurar CORS e Conectar os Serviços

### 3.1 Atualizar FRONTEND_URL no Backend

1. Vá no projeto do **backend** na Vercel
2. Vá em **Settings** → **Environment Variables**
3. Atualize a variável `FRONTEND_URL` com a URL do frontend:
   ```
   FRONTEND_URL=https://seu-frontend.vercel.app
   ```
4. Clique em **"Redeploy"** para aplicar as mudanças

### 3.2 Configurar CORS no Backend (se necessário)

O arquivo `server/src/index.js` já está configurado para aceitar requisições da Vercel. Se precisar ajustar, edite:

```javascript
app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sem origin (mobile apps, Postman, etc)
    if (!origin) return callback(null, true)
    
    // Permitir localhost em desenvolvimento
    if (origin.includes('localhost')) return callback(null, true)
    
    // Permitir domínios da Vercel
    if (origin.endsWith('.vercel.app')) return callback(null, true)
    
    // Permitir FRONTEND_URL configurada
    if (origin === process.env.FRONTEND_URL) return callback(null, true)
    
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true
}))
```

---

## 🔄 PASSO 4: Rodar Migrations do Prisma

Após o deploy, você precisa rodar as migrations do Prisma no banco de dados.

### Opção 1: Via Vercel CLI (Recomendado)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Fazer login
vercel login

# Conectar ao projeto backend
cd server
vercel link

# Rodar migrations
vercel env pull .env.production
npx prisma migrate deploy
```

### Opção 2: Localmente (conectando ao banco remoto)

```bash
# Na pasta server
cd server

# Configurar DATABASE_URL temporariamente
export DATABASE_URL="postgresql://rhuan:aIddTJ0AK7k9fl85WdOPFGaBRaX5USJH@dpg-d4j80eemcj7s73bc1ri0-a.oregon-postgres.render.com/telegram_fvwj"

# Rodar migrations
npm run prisma:deploy
```

### Opção 3: Via Render SQL Editor

Se o Render tiver SQL Editor, você pode executar o SQL das migrations diretamente:
1. Acesse o dashboard do Render
2. Vá no seu banco PostgreSQL
3. Execute o conteúdo de `server/prisma/migrations/*/migration.sql`

---

## 📝 Resumo das Variáveis de Ambiente

### Backend (Vercel)

| Variável | Descrição | Valor |
|----------|-----------|-------|
| `DATABASE_URL` | URL do PostgreSQL no Render | `postgresql://rhuan:...@dpg-d4j80eemcj7s73bc1ri0-a.oregon-postgres.render.com/telegram_fvwj` |
| `PORT` | Porta (não usado na Vercel, mas mantém compatibilidade) | `3333` |
| `JWT_SECRET` | Chave secreta para tokens JWT | `sua-chave-super-secreta` |
| `ADMIN_EMAIL` | Email do administrador | `rhuanc01@gmail.com` |
| `ADMIN_PASSWORD_HASH` | Hash bcrypt da senha | `$2b$10$...` |
| `FRONTEND_URL` | URL do frontend na Vercel | `https://seu-frontend.vercel.app` |
| `NODE_ENV` | Ambiente | `production` |

### Frontend (Vercel)

| Variável | Descrição | Valor |
|----------|-----------|-------|
| `VITE_API_URL` | URL do backend na Vercel | `https://seu-backend.vercel.app` |

---

## 🐛 Troubleshooting

### Erro: "CORS blocked"

- Verifique se `FRONTEND_URL` está configurada no backend
- Confirme que a URL não tem barra no final
- Certifique-se que o código de CORS aceita `.vercel.app`

### Erro: "Cannot connect to database"

- Verifique se `DATABASE_URL` está correta
- Confirme que o banco está ativo no Render
- Teste a conexão localmente primeiro

### Erro: "401 Unauthorized" no login

- Gere um novo hash de senha e atualize `ADMIN_PASSWORD_HASH`
- Verifique se `ADMIN_EMAIL` está correto
- Confirme que `JWT_SECRET` está definido

### Erro: "Module not found" no deploy do backend

- Certifique-se que o Root Directory está como `server`
- Verifique se o `package.json` está na pasta `server`
- Confira os logs de build na Vercel

### Frontend mostra página em branco

- Verifique o console do navegador (F12)
- Confirme que `VITE_API_URL` está configurada corretamente
- A URL deve ser **sem barra** no final: `https://api.vercel.app` ✅

### Backend retorna 404 nas rotas

- Verifique se o `server/vercel.json` está configurado corretamente
- Confirme que as rotas começam com `/api/` (ex: `/api/auth/login`)
- Teste a rota `/health` primeiro

---

## 🎯 URLs Finais

Após o deploy, você terá:

| Serviço | URL |
|---------|-----|
| **Frontend** | `https://seu-frontend.vercel.app` |
| **Backend API** | `https://seu-backend.vercel.app/api` |
| **Health Check** | `https://seu-backend.vercel.app/health` |
| **Login** | `https://seu-backend.vercel.app/api/auth/login` |

---

## ✅ Checklist Final

- [ ] Backend deployado na Vercel
- [ ] Frontend deployado na Vercel
- [ ] Todas as variáveis de ambiente configuradas
- [ ] `FRONTEND_URL` configurada no backend
- [ ] `VITE_API_URL` configurada no frontend
- [ ] Migrations do Prisma rodadas
- [ ] Teste de login funcionando
- [ ] Dashboard carregando dados

---

## 🔒 Segurança

⚠️ **IMPORTANTE**: 

- Nunca commite o arquivo `.env` com credenciais
- Use variáveis de ambiente na Vercel
- `JWT_SECRET` deve ser uma string aleatória forte (mínimo 32 caracteres)
- `ADMIN_PASSWORD_HASH` deve ser um hash bcrypt válido (nunca a senha em texto puro)

---

**Pronto!** Seu projeto está no ar na Vercel! 🎉
