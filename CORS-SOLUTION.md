# 🔧 Solução para Problema de CORS em Produção

## 🚨 **Problema Identificado**

O frontend está tentando fazer requisições diretas para a API (`http://192.168.31.75:3000`), mas está recebendo HTML em vez de JSON. Isso acontece porque:

1. **Proxy do Vite não funciona em produção** - só funciona durante desenvolvimento
2. **CORS não está configurado** na API para aceitar requisições do frontend
3. **Nginx não está configurado** como proxy reverso

## ✅ **Soluções Disponíveis**

### **Opção 1: Configurar Nginx como Proxy Reverso (Recomendado)**

```bash
# No servidor, execute:
./setup-nginx-proxy.sh
```

**Como funciona:**
- Frontend: `http://192.168.31.75/` (porta 80)
- API: `http://192.168.31.75/api/` (proxy para porta 3000)
- CORS: Resolvido pelo Nginx

### **Opção 2: Configurar CORS na API**

Se você tem acesso ao código da API, adicione CORS:

```javascript
// No arquivo da API (NestJS)
app.enableCors({
  origin: ['http://192.168.31.75:3001', 'http://192.168.31.75'],
  credentials: true
});
```

### **Opção 3: Usar URL direta da API**

Alterar o `src/config/api.ts` para usar a URL direta:

```typescript
export const getBaseURL = (): string => {
  if (import.meta.env.PROD) {
    return 'http://192.168.31.75:3000';
  }
  return API_CONFIG.BASE_URL;
};
```

## 🎯 **Recomendação**

**Use a Opção 1** (Nginx como proxy reverso) porque:

- ✅ Resolve CORS automaticamente
- ✅ Melhora performance (cache, compressão)
- ✅ Facilita SSL/HTTPS no futuro
- ✅ Padrão da indústria
- ✅ Não requer mudanças na API

## 📋 **Passos para Implementar**

1. **No servidor:**
   ```bash
   # Puxar as últimas mudanças
   git pull origin main
   
   # Configurar Nginx
   ./setup-nginx-proxy.sh
   ```

2. **Acessar a aplicação:**
   - Frontend: `http://192.168.31.75/`
   - API: `http://192.168.31.75/api/`

3. **Testar login:**
   - Deve funcionar sem erros de CORS
   - Deve retornar JSON válido

## 🔍 **Verificação**

```bash
# Testar se a API está funcionando
curl http://192.168.31.75/api/health

# Testar se o frontend está funcionando
curl http://192.168.31.75/

# Testar login
curl -X POST -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}' \
  http://192.168.31.75/api/auth/login
```

## 🚀 **Próximos Passos**

1. **Implementar a solução** escolhida
2. **Testar o login** no frontend
3. **Verificar todas as funcionalidades**
4. **Configurar SSL/HTTPS** (opcional)
5. **Configurar domínio personalizado** (opcional)
