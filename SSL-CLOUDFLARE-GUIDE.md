# 🔒 SSL com Let's Encrypt + Cloudflare Tunnel

## 📋 **Pré-requisitos**

- ✅ **Domínio**: service.mitsuwa.com.br configurado no Cloudflare
- ✅ **Cloudflare Tunnel**: Configurado e rodando
- ✅ **Nginx**: Instalado e configurado
- ✅ **Frontend**: Rodando na porta 3001
- ✅ **API**: Rodando na porta 3000

## 🚀 **Implementação SSL**

### **1. Configurar Nginx Básico**

```bash
# Aplicar configuração básica
sudo cp nginx-cloudflare.conf /etc/nginx/sites-available/default
sudo nginx -t
sudo systemctl restart nginx
```

### **2. Implementar SSL**

```bash
# Executar script de SSL
./setup-ssl-cloudflare.sh
```

### **3. Testar Configuração**

```bash
# Testar tudo
./test-ssl-cloudflare.sh
```

## 🌐 **Configuração do Cloudflare**

### **1. DNS Records**

No painel do Cloudflare, configure:

```
Tipo: CNAME
Nome: service
Conteúdo: <tunnel-id>.cfargotunnel.com
Proxy: ✅ (Laranja)
```

### **2. Cloudflare Tunnel**

```bash
# Verificar tunnel
cloudflared tunnel list

# Executar tunnel
cloudflared tunnel run <tunnel-name>

# Ou configurar como serviço
sudo cloudflared service install
```

### **3. Configuração do Tunnel**

```yaml
# ~/.cloudflared/config.yml
tunnel: <tunnel-id>
credentials-file: /home/homelab/.cloudflared/<tunnel-id>.json

ingress:
  - hostname: service.mitsuwa.com.br
    service: http://localhost:80
  - service: http_status:404
```

## 🔧 **Configuração SSL Automática**

### **Let's Encrypt + Certbot**

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d service.mitsuwa.com.br

# Configurar renovação automática
sudo crontab -e
# Adicionar: 0 12 * * * /usr/bin/certbot renew --quiet
```

### **Configuração do Nginx (SSL)**

```nginx
server {
    listen 443 ssl http2;
    server_name service.mitsuwa.com.br;
    
    ssl_certificate /etc/letsencrypt/live/service.mitsuwa.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/service.mitsuwa.com.br/privkey.pem;
    
    # Configurações SSL modernas
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Headers de segurança
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Resto da configuração...
}

# Redirect HTTP para HTTPS
server {
    listen 80;
    server_name service.mitsuwa.com.br;
    return 301 https://$server_name$request_uri;
}
```

## 🧪 **Testes de Funcionamento**

### **Testes Básicos:**

```bash
# Testar HTTP (deve redirecionar)
curl -I http://service.mitsuwa.com.br/

# Testar HTTPS
curl -I https://service.mitsuwa.com.br/

# Testar API
curl https://service.mitsuwa.com.br/api/health

# Testar login
curl -X POST -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}' \
  https://service.mitsuwa.com.br/api/auth/login
```

### **Testes no Navegador:**

1. **Acesse** https://service.mitsuwa.com.br/
2. **Verifique** o cadeado verde na barra de endereço
3. **Teste** o login e funcionalidades
4. **Verifique** se não há avisos de segurança

## 🔍 **Solução de Problemas**

### **Problema: Certificado não é emitido**

```bash
# Verificar se o domínio resolve
nslookup service.mitsuwa.com.br

# Verificar se o Cloudflare Tunnel está rodando
cloudflared tunnel list

# Verificar logs do Certbot
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

### **Problema: HTTPS não funciona**

```bash
# Verificar configuração do Nginx
sudo nginx -t

# Verificar certificado
sudo certbot certificates

# Reiniciar Nginx
sudo systemctl restart nginx
```

### **Problema: Cloudflare Tunnel não conecta**

```bash
# Verificar configuração
cloudflared tunnel list

# Testar conexão
cloudflared tunnel run <tunnel-name> --loglevel debug

# Verificar logs
sudo journalctl -u cloudflared -f
```

## 📊 **Monitoramento**

### **Logs Importantes:**

```bash
# Logs do Nginx
sudo tail -f /var/log/nginx/frontend_error.log

# Logs do Certbot
sudo tail -f /var/log/letsencrypt/letsencrypt.log

# Logs do Cloudflare Tunnel
sudo journalctl -u cloudflared -f
```

### **Comandos de Verificação:**

```bash
# Status dos serviços
sudo systemctl status nginx
sudo systemctl status cloudflared

# Certificados
sudo certbot certificates

# Túneis
cloudflared tunnel list
```

## 🔒 **Segurança Adicional**

### **Headers de Segurança:**

```nginx
# Adicionar ao Nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Frame-Options DENY always;
add_header X-Content-Type-Options nosniff always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

### **Configurações do Cloudflare:**

- ✅ **SSL/TLS**: Full (Strict)
- ✅ **Always Use HTTPS**: Ativado
- ✅ **HTTP Strict Transport Security**: Ativado
- ✅ **Minimum TLS Version**: 1.2

## 🎯 **Resultado Final**

Após a implementação:

- ✅ **Frontend**: https://service.mitsuwa.com.br/
- ✅ **API**: https://service.mitsuwa.com.br/api/
- ✅ **SSL**: Let's Encrypt (renovação automática)
- ✅ **Cloudflare**: Tunnel + CDN + DDoS Protection
- ✅ **Segurança**: Headers + HTTPS obrigatório

## 🚀 **Próximos Passos**

1. **Implementar** SSL com os scripts fornecidos
2. **Configurar** Cloudflare Tunnel
3. **Testar** todas as funcionalidades
4. **Monitorar** logs e performance
5. **Configurar** backup dos certificados
