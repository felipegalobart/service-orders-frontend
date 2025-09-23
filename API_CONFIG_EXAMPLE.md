# 🔧 Configuração da API - Service Orders Frontend

## 📍 Como Alterar o Servidor da API

### **Opção 1: Desenvolvimento (Proxy do Vite)**

Edite o arquivo `vite.config.ts`:

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://SEU_NOVO_SERVIDOR:PORTA', // ALTERE AQUI
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
```

### **Opção 2: Produção (URL Direta)**

Edite o arquivo `src/config/api.ts`:

```typescript
// src/config/api.ts
export const API_CONFIG = {
  // Base URL para desenvolvimento (via proxy)
  BASE_URL: '/api',
  
  // Base URL para produção - ALTERE AQUI
  PRODUCTION_URL: 'https://sua-nova-api.com',
  
  // ... resto da configuração
};
```

### **Opção 3: Variáveis de Ambiente (Recomendado)**

1. Crie um arquivo `.env.local` na raiz do projeto:

```bash
# .env.local
VITE_API_URL=https://sua-nova-api.com
VITE_API_PORT=3000
```

2. Atualize o arquivo `src/config/api.ts`:

```typescript
// src/config/api.ts
export const API_CONFIG = {
  BASE_URL: '/api',
  
  // Usar variável de ambiente
  PRODUCTION_URL: import.meta.env.VITE_API_URL || 'https://api-padrao.com',
  
  // ... resto da configuração
};
```

## 🚀 Exemplos de Configuração

### **Servidor Local em Porta Diferente**
```typescript
// vite.config.ts
target: 'http://localhost:8080'
```

### **Servidor Remoto**
```typescript
// vite.config.ts
target: 'http://192.168.1.100:3000'
```

### **API em Produção**
```typescript
// src/config/api.ts
PRODUCTION_URL: 'https://api.serviceorders.com'
```

### **API com Subpath**
```typescript
// src/config/api.ts
PRODUCTION_URL: 'https://meudominio.com/api'
```

## 🔄 Como Aplicar as Mudanças

1. **Desenvolvimento**: Reinicie o servidor de desenvolvimento
   ```bash
   npm run dev
   ```

2. **Produção**: Faça um novo build
   ```bash
   npm run build
   ```

## 🧪 Testando a Conexão

Use o arquivo `test-auth.sh` para testar se a API está funcionando:

```bash
# Edite o arquivo test-auth.sh e altere as URLs de teste
./test-auth.sh
```

## 📝 Notas Importantes

- ✅ O proxy do Vite só funciona em desenvolvimento
- ✅ Em produção, use a configuração `PRODUCTION_URL`
- ✅ Sempre teste a conexão após alterar a configuração
- ✅ Considere usar variáveis de ambiente para diferentes ambientes
