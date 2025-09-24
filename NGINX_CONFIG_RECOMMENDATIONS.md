# 🚀 Configurações Recomendadas do Nginx para APIs

## 📊 **Problemas Identificados:**

1. **Rate Limiting muito restritivo:** 10 req/min
2. **Limite de paginação baixo:** máximo 100 registros por página
3. **Possíveis timeouts** para operações grandes

## ⚙️ **Configurações Recomendadas:**

### 1. **Rate Limiting (Mais Permissivo)**

```nginx
# Rate Limiting mais flexível
http {
    # Zona para rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=60r/m;
    limit_req_zone $binary_remote_addr zone=api_strict:10m rate=10r/m;
    
    # Zona para burst (permite rajadas)
    limit_req_zone $binary_remote_addr zone=api_burst:10m rate=100r/m;
    
    server {
        location /api/ {
            # Rate limiting mais permissivo para desenvolvimento
            limit_req zone=api burst=20 nodelay;
            
            # Ou para produção, use:
            # limit_req zone=api_strict burst=5 nodelay;
        }
        
        # Endpoints específicos com limites diferentes
        location /api/auth/login {
            limit_req zone=api_strict burst=3 nodelay;
        }
        
        location /api/persons {
            # Mais permissivo para listagens
            limit_req zone=api burst=30 nodelay;
        }
    }
}
```

### 2. **Timeouts e Buffers**

```nginx
http {
    # Timeouts mais generosos
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
    
    # Buffers para requisições grandes
    proxy_buffering on;
    proxy_buffer_size 128k;
    proxy_buffers 4 256k;
    proxy_busy_buffers_size 256k;
    
    # Body size para uploads
    client_max_body_size 10M;
    
    server {
        location /api/ {
            proxy_pass http://backend;
            
            # Headers para CORS
            add_header 'Access-Control-Allow-Origin' '*' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, Accept' always;
            
            # Timeouts específicos
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
        }
    }
}
```

### 3. **Configuração Completa Recomendada**

```nginx
# /etc/nginx/sites-available/your-api
server {
    listen 80;
    server_name your-api-domain.com;
    
    # Rate limiting zones
    limit_req_zone $binary_remote_addr zone=api:10m rate=60r/m;
    limit_req_zone $binary_remote_addr zone=api_strict:10m rate=20r/m;
    
    # Logs
    access_log /var/log/nginx/api_access.log;
    error_log /var/log/nginx/api_error.log;
    
    location / {
        # Rate limiting
        limit_req zone=api burst=20 nodelay;
        
        # Proxy para sua API
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
        
        # Buffers
        proxy_buffering on;
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        
        # CORS
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, Accept' always;
        
        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, Accept';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain charset=UTF-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }
    
    # Endpoints específicos
    location /auth/login {
        limit_req zone=api_strict burst=5 nodelay;
        proxy_pass http://127.0.0.1:3000;
        # ... outros headers
    }
    
    location /persons {
        limit_req zone=api burst=30 nodelay;
        proxy_pass http://127.0.0.1:3000;
        # ... outros headers
    }
}
```

## 🔧 **Variáveis de Ambiente Recomendadas:**

```bash
# Rate Limiting
THROTTLE_TTL=60          # 60 segundos
THROTTLE_LIMIT=60        # 60 requests por minuto (ao invés de 10)

# Ou para desenvolvimento:
THROTTLE_TTL=60
THROTTLE_LIMIT=200       # 200 requests por minuto

# Timeouts
PROXY_TIMEOUT=60         # 60 segundos
PROXY_READ_TIMEOUT=60    # 60 segundos
```

## 📈 **Configurações por Ambiente:**

### **Desenvolvimento:**
```nginx
limit_req zone=api burst=50 nodelay;  # 50 requests burst
rate=200r/m;                         # 200 requests/min
```

### **Produção:**
```nginx
limit_req zone=api burst=20 nodelay;  # 20 requests burst
rate=60r/m;                          # 60 requests/min
```

### **Staging:**
```nginx
limit_req zone=api burst=30 nodelay;  # 30 requests burst
rate=100r/m;                         # 100 requests/min
```

## 🚨 **Monitoramento:**

```nginx
# Logs detalhados
log_format api_log '$remote_addr - $remote_user [$time_local] '
                   '"$request" $status $body_bytes_sent '
                   '"$http_referer" "$http_user_agent" '
                   'rt=$request_time uct="$upstream_connect_time" '
                   'uht="$upstream_header_time" urt="$upstream_response_time"';

access_log /var/log/nginx/api.log api_log;
```

## 🔄 **Como Aplicar:**

1. **Edite o arquivo de configuração:**
   ```bash
   sudo nano /etc/nginx/sites-available/your-api
   ```

2. **Teste a configuração:**
   ```bash
   sudo nginx -t
   ```

3. **Recarregue o Nginx:**
   ```bash
   sudo systemctl reload nginx
   ```

4. **Monitore os logs:**
   ```bash
   sudo tail -f /var/log/nginx/api_error.log
   ```

## 🎯 **Recomendação Imediata:**

Para resolver o problema atual, altere estas variáveis:

```bash
# No seu .env ou docker-compose.yml
THROTTLE_TTL=60
THROTTLE_LIMIT=60    # Aumente de 10 para 60
```

E no Nginx, use:
```nginx
limit_req zone=api burst=20 nodelay;
rate=60r/m;
```

Isso dará **60 requests por minuto** com **burst de 20 requests** simultâneos!

