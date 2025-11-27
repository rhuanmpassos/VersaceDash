# 🚀 Guia Completo de Deploy na Vercel

Este documento explica passo a passo como fazer o deploy do **backend** e **frontend** do projeto Versace Leads OS na Vercel, separados.

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
│  │              seu-frontend.vercel.app                      │  │
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

## ⚙️ PASSO 1: Preparar o Backend

### 1.1 Verificar Arquivos

O backend já está preparado com:
- ✅ `server/vercel.json` configurado para Vercel Serverless Functions
- ✅ `server/api/index.js` criado como entry point para a Vercel
- ✅ `server/src/index.js` adaptado para exportar o app Express
- ✅ `server/src/index.js` com CORS configurado para aceitar requisições da Vercel
- ✅ `server/package.json` com script `postinstall` que gera o Prisma Client automaticamente

### 1.2 Gerar Hash da Senha

Antes do deploy, você precisa gerar o hash bcrypt da sua senha:

```bash
cd server
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('SuaSenhaAqui', 10).then(h => console.log(h))"
```

⚠️ **Anote o hash gerado!** Você vai precisar dele nas variáveis de ambiente.

---

## 🚀 PASSO 2: Deploy do Backend na Vercel

### 2.1 Criar Projeto do Backend

1. Acesse [vercel.com](https://vercel.com) e faça login com GitHub

2. Clique em **"Add New..."** → **"Project"**

3. Selecione o repositório `otimizacaoDC`

4. ⚠️ **IMPORTANTE**: Configure o projeto para o **BACKEND**:
   
   | Configuração | Valor |
   |--------------|-------|
   | **Framework Preset** | `Other` |
   | **Root Directory** | `server` |
   | **Build Command** | (deixe vazio - será ignorado por causa do vercel.json) |
   | **Output Directory** | (deixe vazio) |
   | **Install Command** | `npm install` |

   > **Nota**: O script `postinstall` no `package.json` roda automaticamente `prisma generate` após `npm install`, gerando o Prisma Client necessário.

### 2.2 Configurar Variáveis de Ambiente

Na seção **"Environment Variables"**, adicione:

| Nome | Valor | Obrigatório |
|------|-------|-------------|
| `DATABASE_URL` | `postgresql://rhuan:aIddTJ0AK7k9fl85WdOPFGaBRaX5USJH@dpg-d4j80eemcj7s73bc1ri0-a.oregon-postgres.render.com/telegram_fvwj` | ✅ Sim |
| `PORT` | `3333` | ⚠️ Opcional (não usado na Vercel) |
| `JWT_SECRET` | `sua-chave-secreta-super-forte-minimo-32-caracteres` | ✅ Sim |
| `ADMIN_EMAIL` | `rhuanc01@gmail.com` | ✅ Sim |
| `ADMIN_PASSWORD_HASH` | `$2b$10$...` (hash gerado no passo 1.2) | ✅ Sim |
| `FRONTEND_URL` | `https://seu-frontend.vercel.app` | ⏳ Adicionar depois |
| `NODE_ENV` | `production` | ⚠️ Opcional |

⚠️ **IMPORTANTE**: 
- `JWT_SECRET` deve ser uma string aleatória forte (mínimo 32 caracteres)
- `ADMIN_PASSWORD_HASH` deve ser o hash bcrypt gerado (nunca a senha em texto puro)
- `FRONTEND_URL` você vai adicionar depois que fizer o deploy do frontend

### 2.3 Fazer Deploy

1. Clique em **"Deploy"**

2. Aguarde o build completar (~2-3 minutos)

3. ⚠️ **Anote a URL gerada** (ex: `https://versace-api.vercel.app`)

4. Teste acessando: `https://seu-backend.vercel.app/health`
   
   Deve retornar:
   ```json
   {
     "status": "ok",
     "timestamp": "2024-..."
   }
   ```

---

## 🎨 PASSO 3: Deploy do Frontend na Vercel

### 3.1 Verificar Arquivos

O frontend já está preparado com:
- ✅ `vercel.json` na raiz configurado para Vite
- ✅ Rewrites para Vue Router funcionar com history mode
- ✅ `package.json` com script `build` que roda `vite build`

### 3.2 Criar Projeto do Frontend

1. Ainda na Vercel, clique em **"Add New..."** → **"Project"** novamente

2. Selecione o **mesmo repositório** `otimizacaoDC`

3. ⚠️ **IMPORTANTE**: Configure o projeto para o **FRONTEND**:
   
   | Configuração | Valor |
   |--------------|-------|
   | **Framework Preset** | `Vite` |
   | **Root Directory** | `.` (deixe vazio ou `.`) |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `dist` |
   | **Install Command** | `npm install` |

   > **Nota**: A Vercel detecta automaticamente Vite, mas confirme essas configurações.

### 3.3 Configurar Variável de Ambiente

Na seção **"Environment Variables"**, adicione:

| Nome | Valor |
|------|-------|
| `VITE_API_URL` | `https://seu-backend.vercel.app` |

⚠️ **IMPORTANTE**: 
- Use a URL do backend que você anotou no Passo 2.3
- **NÃO** coloque barra no final: `https://api.vercel.app` ✅ (correto)
- **NÃO** coloque `/api` no final: o frontend já adiciona isso automaticamente

### 3.4 Fazer Deploy

1. Clique em **"Deploy"**

2. Aguarde o build completar (~1-2 minutos)

3. ⚠️ **Anote a URL gerada** (ex: `https://versace-frontend.vercel.app`)

---

## 🔧 PASSO 4: Conectar Backend e Frontend

### 4.1 Atualizar FRONTEND_URL no Backend

1. Vá no projeto do **backend** na Vercel

2. Vá em **Settings** → **Environment Variables**

3. Encontre a variável `FRONTEND_URL` (ou adicione se não tiver)

4. Atualize com a URL do frontend:
   ```
   FRONTEND_URL=https://seu-frontend.vercel.app
   ```

5. ⚠️ **IMPORTANTE**: Clique em **"Redeploy"** para aplicar as mudanças
   
   - Vá em **Deployments**
   - Clique nos três pontos (⋯) do último deployment
   - Selecione **"Redeploy"**

### 4.2 Verificar CORS

O arquivo `server/src/index.js` já está configurado para aceitar requisições:
- ✅ De `localhost` (desenvolvimento)
- ✅ De domínios `.vercel.app` (produção)
- ✅ Da `FRONTEND_URL` configurada

Se precisar ajustar, edite `server/src/index.js`:

```javascript
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (origin.includes('localhost')) return callback(null, true)
    if (origin.endsWith('.vercel.app')) return callback(null, true)
    if (origin === process.env.FRONTEND_URL) return callback(null, true)
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true
}))
```

---

## 🔄 PASSO 5: Rodar Migrations do Prisma

Após o deploy, você precisa rodar as migrations do Prisma no banco de dados.

### Opção 1: Localmente (Recomendado - Mais Simples)

```bash
# Na pasta server
cd server

# Configurar DATABASE_URL temporariamente
# Windows PowerShell:
$env:DATABASE_URL="postgresql://rhuan:aIddTJ0AK7k9fl85WdOPFGaBRaX5USJH@dpg-d4j80eemcj7s73bc1ri0-a.oregon-postgres.render.com/telegram_fvwj"

# Windows CMD:
set DATABASE_URL=postgresql://rhuan:aIddTJ0AK7k9fl85WdOPFGaBRaX5USJH@dpg-d4j80eemcj7s73bc1ri0-a.oregon-postgres.render.com/telegram_fvwj

# Linux/Mac:
export DATABASE_URL="postgresql://rhuan:aIddTJ0AK7k9fl85WdOPFGaBRaX5USJH@dpg-d4j80eemcj7s73bc1ri0-a.oregon-postgres.render.com/telegram_fvwj"

# Rodar migrations
npm run prisma:deploy
```

### Opção 2: Via Vercel CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Fazer login
vercel login

# Conectar ao projeto backend
cd server
vercel link

# Baixar variáveis de ambiente
vercel env pull .env.production

# Rodar migrations
npx prisma migrate deploy
```

### Opção 3: Via Render SQL Editor (se disponível)

1. Acesse o dashboard do Render
2. Vá no seu banco PostgreSQL
3. Abra o SQL Editor
4. Execute o conteúdo de `server/prisma/migrations/20251126230000_add_stage/migration.sql`

---

## 📝 Resumo das Variáveis de Ambiente

### Backend (Vercel) - Projeto: `server`

| Variável | Descrição | Exemplo | Obrigatório |
|----------|-----------|---------|-------------|
| `DATABASE_URL` | URL do PostgreSQL no Render | `postgresql://rhuan:...@dpg-d4j80eemcj7s73bc1ri0-a.oregon-postgres.render.com/telegram_fvwj` | ✅ Sim |
| `PORT` | Porta (não usado na Vercel) | `3333` | ⚠️ Opcional |
| `JWT_SECRET` | Chave secreta para tokens JWT | `minha-chave-super-secreta-32-chars` | ✅ Sim |
| `ADMIN_EMAIL` | Email do administrador | `rhuanc01@gmail.com` | ✅ Sim |
| `ADMIN_PASSWORD_HASH` | Hash bcrypt da senha | `$2b$10$...` | ✅ Sim |
| `FRONTEND_URL` | URL do frontend na Vercel | `https://seu-frontend.vercel.app` | ✅ Sim (após deploy frontend) |
| `NODE_ENV` | Ambiente | `production` | ⚠️ Opcional |

### Frontend (Vercel) - Projeto: Raiz

| Variável | Descrição | Exemplo | Obrigatório |
|----------|-----------|---------|-------------|
| `VITE_API_URL` | URL do backend na Vercel | `https://seu-backend.vercel.app` | ✅ Sim |

---

## 🎯 URLs Finais

Após o deploy, você terá:

| Serviço | URL | Descrição |
|---------|-----|-----------|
| **Frontend** | `https://seu-frontend.vercel.app` | Interface do usuário |
| **Backend API** | `https://seu-backend.vercel.app/api` | Endpoints da API |
| **Health Check** | `https://seu-backend.vercel.app/health` | Verificar se API está online |
| **Login** | `https://seu-backend.vercel.app/api/auth/login` | Endpoint de autenticação |

---

## 🐛 Troubleshooting

### Erro: "CORS blocked" ou "CORS policy"

**Sintomas**: Requisições do frontend são bloqueadas pelo navegador

**Soluções**:
1. Verifique se `FRONTEND_URL` está configurada no backend
2. Confirme que a URL não tem barra no final
3. Certifique-se que fez o redeploy do backend após adicionar `FRONTEND_URL`
4. Verifique o console do navegador (F12) para ver a origem bloqueada

### Erro: "Cannot connect to database"

**Sintomas**: API retorna erro 500 ou não consegue conectar ao banco

**Soluções**:
1. Verifique se `DATABASE_URL` está correta (sem espaços extras)
2. Confirme que o banco está ativo no Render
3. Teste a conexão localmente primeiro
4. Verifique os logs do backend na Vercel (Deployments → View Function Logs)

### Erro: "401 Unauthorized" no login

**Sintomas**: Login não funciona mesmo com credenciais corretas

**Soluções**:
1. Gere um novo hash de senha e atualize `ADMIN_PASSWORD_HASH`
2. Verifique se `ADMIN_EMAIL` está correto (case-sensitive)
3. Confirme que `JWT_SECRET` está definido
4. Verifique os logs do backend para ver o erro específico

### Erro: "Module not found" no deploy do backend

**Sintomas**: Build falha com erro de módulo não encontrado

**Soluções**:
1. Certifique-se que o Root Directory está como `server`
2. Verifique se o `package.json` está na pasta `server`
3. Confira se todas as dependências estão no `package.json`
4. Veja os logs de build na Vercel para identificar o módulo faltante

### Frontend mostra página em branco

**Sintomas**: Página carrega mas não mostra conteúdo

**Soluções**:
1. Verifique o console do navegador (F12) para erros JavaScript
2. Confirme que `VITE_API_URL` está configurada corretamente
3. A URL deve ser **sem barra** no final: `https://api.vercel.app` ✅
4. Verifique se as rotas do Vue Router estão funcionando (teste acessar `/dashboard` diretamente)
5. Veja os logs de build do frontend na Vercel

### Backend retorna 404 nas rotas

**Sintomas**: Rotas da API retornam 404 Not Found

**Soluções**:
1. Verifique se o `server/vercel.json` está configurado corretamente
2. Confirme que as rotas começam com `/api/` (ex: `/api/auth/login`)
3. Teste a rota `/health` primeiro (deve funcionar sem `/api`)
4. Verifique os logs do backend na Vercel

### Erro: "Prisma Client not generated" ou "FUNCTION_INVOCATION_FAILED"

**Sintomas**: Erro 500 com código `FUNCTION_INVOCATION_FAILED` ou erro relacionado ao Prisma Client

**Soluções**:
1. ✅ **Verifique se o script `postinstall` está no `server/package.json`**:
   ```json
   "scripts": {
     "postinstall": "prisma generate"
   }
   ```
   Este script roda automaticamente após `npm install` e gera o Prisma Client.

2. ✅ **Confirme que o `server/vercel.json` está correto**:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "api/index.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "api/index.js"
       }
     ]
   }
   ```

3. ✅ **Verifique se todas as variáveis de ambiente estão configuradas**, especialmente `DATABASE_URL`

4. ✅ **Veja os logs completos do build na Vercel**:
   - Vá em Deployments → Clique no deployment que falhou
   - Veja os logs de build e runtime
   - Procure por erros relacionados ao Prisma

5. ✅ **Se o erro persistir, tente fazer um redeploy**:
   - Vá em Deployments
   - Clique nos três pontos (⋯) do último deployment
   - Selecione "Redeploy"

---

## ✅ Checklist Final

- [ ] Backend deployado na Vercel
- [ ] Frontend deployado na Vercel
- [ ] Todas as variáveis de ambiente configuradas no backend
- [ ] `VITE_API_URL` configurada no frontend
- [ ] `FRONTEND_URL` configurada no backend (e redeploy feito)
- [ ] Migrations do Prisma rodadas
- [ ] Teste de `/health` funcionando
- [ ] Teste de login funcionando
- [ ] Dashboard carregando dados
- [ ] CORS funcionando (sem erros no console)

---

## 🔒 Segurança

⚠️ **IMPORTANTE**: 

- ✅ Nunca commite o arquivo `.env` com credenciais
- ✅ Use variáveis de ambiente na Vercel (não hardcode no código)
- ✅ `JWT_SECRET` deve ser uma string aleatória forte (mínimo 32 caracteres)
- ✅ `ADMIN_PASSWORD_HASH` deve ser um hash bcrypt válido (nunca a senha em texto puro)
- ✅ Mantenha o `DATABASE_URL` seguro (não compartilhe publicamente)
- ✅ Use HTTPS sempre (a Vercel já fornece isso automaticamente)

---

## 📚 Arquivos de Configuração

### `server/vercel.json`
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/index.js"
    }
  ]
}
```

### `vercel.json` (raiz - frontend)
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

---

## 🎉 Pronto!

Seu projeto está no ar na Vercel! 

**Próximos passos**:
1. Teste todas as funcionalidades
2. Configure um domínio customizado (opcional)
3. Configure monitoramento e alertas (opcional)

**Dúvidas?** Consulte a [documentação da Vercel](https://vercel.com/docs) ou os logs de deploy.
