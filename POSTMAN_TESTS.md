# 🧪 Testes no Postman

## 📋 Configuração Básica

**Base URL:** `http://localhost:3333`

---

## ✅ 1. Testar Health Check

**Método:** `GET`  
**URL:** `http://localhost:3333/health`

**Headers:** (nenhum necessário)

**Resposta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

## 📝 2. Criar um Novo Lead

**Método:** `POST`  
**URL:** `http://localhost:3333/api/leads`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "nome": "João Silva",
  "whatsapp": "11999999999",
  "referralCode": "REF001",
  "stage": "NA_BASE"
}
```

**Exemplo mínimo (apenas campos obrigatórios):**
```json
{
  "nome": "Maria Santos",
  "whatsapp": "11988888888"
}
```

**Resposta esperada (201 Created):**
```json
{
  "lead": {
    "id": "uuid-aqui",
    "nome": "João Silva",
    "whatsapp": "11999999999",
    "referralCode": "REF001",
    "stage": "NA_BASE",
    "stageLabel": "Na Base",
    "createdAt": "2024-01-01T12:00:00.000Z",
    "referrer": {
      "nome": "Nome do Referenciador",
      "referralCode": "REF001"
    }
  }
}
```

**✅ Após criar, o lead será salvo no banco de dados.**

---

## 📋 3. Listar Todos os Leads

**Método:** `GET`  
**URL:** `http://localhost:3333/api/leads`

**Headers:** (nenhum necessário)

**Resposta esperada:**
```json
{
  "leads": [
    {
      "id": "uuid-aqui",
      "nome": "João Silva",
      "whatsapp": "11999999999",
      "stage": "NA_BASE",
      "stageLabel": "Na Base",
      "createdAt": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

---

## 🔄 4. Atualizar Estágio de um Lead

**Método:** `PATCH`  
**URL:** `http://localhost:3333/api/leads/{id}/stage`

**Exemplo:** `http://localhost:3333/api/leads/123e4567-e89b-12d3-a456-426614174000/stage`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "stage": "EM_CONTATO"
}
```

**Estágios válidos:**
- `NA_BASE`
- `EM_CONTATO`
- `COMPRADO`
- `REJEITADO`

**Resposta esperada:**
```json
{
  "lead": {
    "id": "uuid-aqui",
    "nome": "João Silva",
    "whatsapp": "11999999999",
    "stage": "EM_CONTATO",
    "stageLabel": "Em Contato"
  }
}
```

---

## 📊 5. Buscar Estatísticas

**Método:** `GET`  
**URL:** `http://localhost:3333/api/stats`

**Headers:** (nenhum necessário)

**Resposta esperada:**
```json
{
  "summary": {
    "totalLeads": 10,
    "fromReferral": 5,
    "wonLeads": 2,
    "conversionRate": 20,
    "recentLeads": 3
  },
  "stageDistribution": [
    { "label": "Na Base", "total": 4 },
    { "label": "Em Contato", "total": 3 },
    { "label": "Comprado", "total": 2 },
    { "label": "Rejeitado", "total": 1 }
  ],
  "topReferrers": [
    {
      "referralCode": "REF001",
      "name": "João Referenciador",
      "total": 5,
      "whatsapp": "11999999999"
    }
  ],
  "timeline": [
    {
      "date": "2024-01-01",
      "dateLabel": "01/01",
      "total": 3
    }
  ]
}
```

---

## 🎯 Exemplos Prontos para Copiar

### Criar Lead com Referência
```json
POST http://localhost:3333/api/leads
Content-Type: application/json

{
  "nome": "Pedro Oliveira",
  "whatsapp": "11977777777",
  "referralCode": "REF002",
  "stage": "NA_BASE"
}
```

### Criar Lead Sem Referência (Orgânico)
```json
POST http://localhost:3333/api/leads
Content-Type: application/json

{
  "nome": "Ana Costa",
  "whatsapp": "11966666666",
  "stage": "NA_BASE"
}
```

### Criar Lead Mínimo
```json
POST http://localhost:3333/api/leads
Content-Type: application/json

{
  "nome": "Carlos Mendes",
  "whatsapp": "11955555555"
}
```

---

## ⚠️ Validações

### Campos Obrigatórios:
- `nome`: mínimo 2 caracteres
- `whatsapp`: mínimo 8 caracteres

### Campos Opcionais:
- `referralCode`: string de 2 a 50 caracteres
- `stage`: padrão é `NA_BASE` se não informado

### Erros Comuns:

**Nome muito curto:**
```json
{
  "message": "Informe o nome do lead."
}
```

**WhatsApp inválido:**
```json
{
  "message": "Informe um WhatsApp válido."
}
```

**Estágio inválido:**
```json
{
  "message": "Invalid enum value. Expected 'NA_BASE' | 'EM_CONTATO' | 'COMPRADO' | 'REJEITADO'"
}
```

---

## 🚀 Dica Rápida

Para criar um lead rapidamente:

1. Abra o Postman
2. Crie uma nova requisição POST
3. URL: `http://localhost:3333/api/leads`
4. Headers: `Content-Type: application/json`
5. Body (raw JSON):
```json
{
  "nome": "Teste Lead",
  "whatsapp": "11999999999"
}
```
6. Envie e verifique se o lead foi criado! 🎉

