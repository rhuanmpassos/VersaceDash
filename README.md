# Versace Leads OS

Dois produtos em um:

- **Dashboard analítico** em tema dark com tons roxos para acompanhar volume de leads, funil e ranking de indicações.
- **CRM estilo PipeDrive** com colunas (Na Base → Em Contato → Comprado → Rejeitado) e movimentação drag & drop. Toda atualização já grava direto no banco.

## 🚀 Stack

| Camada      | Tecnologia                                                                 |
| ----------- | --------------------------------------------------------------------------- |
| Frontend    | Vue 3 + Vite + Vue Router + Pinia + TailwindCSS + DaisyUI + Chart.js        |
| Kanban      | `vue-draggable-next` + `sortablejs`                                         |
| Backend API | Node.js + Express + Prisma (PostgreSQL)                                     |

## 📁 Estrutura de pastas

```
.
├── src/                   # Frontend Vue
│   ├── pages/             # Dashboard e CRM
│   ├── components/        # Cards, charts, lead card etc.
│   ├── store/             # Pinia (leads + stats)
│   └── services/          # Axios com baseURL dinâmica
└── server/                # Backend Express + Prisma
    ├── prisma/            # Schema + migração para estágio
    ├── src/controllers    # Leads + métricas
    ├── src/routes         # /api/leads e /api/stats
    └── src/services       # Prisma
```

## ⚙️ Variáveis de ambiente

Crie dois arquivos:

1. `./.env` → URL da API para o frontend (ex.: `VITE_API_URL=http://localhost:3333`)
2. `./server/.env` → copie de `server/env.example` e informe:

```
DATABASE_URL="postgresql://usuario:senha@host:5432/banco"
PORT=3333

# Autenticação
JWT_SECRET="your-secret-key-change-in-production-use-strong-random-string"
ADMIN_EMAIL="rhuanc01@gmail.com"
ADMIN_PASSWORD_HASH=""  # Veja abaixo como gerar
```

### 🔐 Gerando hash da senha para produção

Para gerar o hash da senha (obrigatório em produção na Vercel):

```bash
yarn --cwd server generate-password-hash
```

Ou manualmente:

```bash
cd server
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('Rhuancar@17', 10).then(h => console.log(h))"
```

Copie o hash gerado e adicione ao `ADMIN_PASSWORD_HASH` no arquivo `.env`.

> **Importante:** 
> - A migração em `server/prisma/migrations/20251126230000_add_stage` adiciona a coluna `stage` ao modelo `Lead`. Rode `yarn --cwd server prisma:deploy` (ou `prisma db push`) após configurar o banco.
> - Em desenvolvimento, se `ADMIN_PASSWORD_HASH` não estiver definido, a senha será verificada diretamente (não recomendado para produção).

## 🧑‍💻 Como rodar

```bash
# 1. Instalar dependências do frontend
yarn install

# 2. Instalar dependências do backend
yarn --cwd server install

# 3. Gerar Prisma Client sempre que o schema mudar
yarn --cwd server prisma:generate

# 4. Subir backend (porta 3333)
yarn --cwd server dev

# 5. Em outro terminal, subir o frontend (porta 5173)
yarn dev
```

O Vite está configurado com proxy para `/api`, então basta deixar o backend em `http://localhost:3333`.

## 🌐 Endpoints principais

### Autenticação (público)
| Método | Rota              | Descrição                                           |
| ------ | ----------------- | --------------------------------------------------- |
| POST   | `/api/auth/login` | Login com email e senha, retorna JWT token         |

### Rotas protegidas (requerem token JWT)
| Método | Rota              | Descrição                                           |
| ------ | ----------------- | --------------------------------------------------- |
| GET    | `/api/leads`      | Lista completa de leads + dados do referenciador   |
| POST   | `/api/leads`      | Cria lead manualmente                               |
| PATCH  | `/api/leads/:id`  | Atualiza estágio (usado pelo drag & drop do Kanban) |
| GET    | `/api/stats`      | KPIs, distribuição por estágio, ranking e timeline |

> **Segurança:** Todas as rotas (exceto `/api/auth/login`) requerem autenticação via token JWT no header `Authorization: Bearer <token>`.

## 🧱 UI/UX

- Tema dark #0e0b14 + painéis em #151020 com bordas neon roxas.
- Dashboard e CRM em rotas distintas (`/dashboard` e `/crm`).
- Cards métricos + charts (`StagePieChart`, `LeadTimelineChart`, `ReferrerBarChart`).
- CRM com formulário lateral, detalhes do lead e arraste entre estágios.

## 🔒 Autenticação

O sistema possui autenticação JWT extremamente restrita:

- **Página de login:** Acesse `/login` para fazer login
- **Credenciais padrão:**
  - Email: `rhuanc01@gmail.com`
  - Senha: `Rhuancar@17`
- **Proteção:** 
  - Todas as rotas do frontend (exceto `/login`) requerem autenticação
  - Todas as APIs (exceto `/api/auth/login`) requerem token JWT
  - Requisições não autenticadas são bloqueadas automaticamente
  - Token expira em 24 horas

## ✅ Próximos passos sugeridos

- Histórico de movimentações (auditoria do funil).
- Tarefas/follow-ups atrelados a cada lead.
- Testes automatizados para os controllers (Vitest / Supertest).
