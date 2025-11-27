# ⚡ Configuração Rápida do .env

## 📝 Passo a passo

1. **Vá para a pasta `server/`**
   ```bash
   cd server
   ```

2. **Crie o arquivo `.env`** (copie o conteúdo abaixo)

3. **Cole este conteúdo no arquivo `.env`:**

```env
DATABASE_URL="postgresql://usuario:senha@host:5432/banco"
PORT=3333
```

**⚠️ IMPORTANTE:** 
- Substitua `DATABASE_URL` pela sua URL real do banco de dados PostgreSQL

4. **Salve o arquivo**

5. **Reinicie o servidor:**
   ```bash
   yarn dev
   # ou
   npm run dev
   ```

## ✅ Teste

1. Crie um novo lead pelo formulário do CRM
2. Verifique se o lead foi criado corretamente no banco de dados

