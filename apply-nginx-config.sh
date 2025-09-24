#!/bin/bash

# Script para aplicar configurações do Nginx
# Uso: sudo ./apply-nginx-config.sh

echo "🔧 Aplicando Configurações do Nginx"
echo "===================================="

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Este script deve ser executado como root (sudo)"
    exit 1
fi

# Backup da configuração atual
echo "📋 Fazendo backup da configuração atual..."
if [ -f /etc/nginx/sites-available/default ]; then
    cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ Backup criado"
else
    echo "⚠️  Arquivo default não encontrado"
fi

# Aplicar nova configuração
echo "📝 Aplicando nova configuração..."
if [ -f "nginx-api-config.conf" ]; then
    cp nginx-api-config.conf /etc/nginx/sites-available/api-config
    echo "✅ Configuração copiada"
else
    echo "❌ Arquivo nginx-api-config.conf não encontrado"
    exit 1
fi

# Testar configuração
echo "🧪 Testando configuração do Nginx..."
if nginx -t; then
    echo "✅ Configuração válida"
else
    echo "❌ Configuração inválida"
    exit 1
fi

# Recarregar Nginx
echo "🔄 Recarregando Nginx..."
if systemctl reload nginx; then
    echo "✅ Nginx recarregado com sucesso"
else
    echo "❌ Erro ao recarregar Nginx"
    exit 1
fi

echo ""
echo "🎉 Configuração aplicada com sucesso!"
echo ""
echo "📊 Novos Limites:"
echo "- Rate Limit: 100 req/min (desenvolvimento)"
echo "- Burst: 30-50 requests simultâneos"
echo "- Timeout: 60 segundos"
echo "- CORS: Habilitado"
echo ""
echo "🔍 Para monitorar:"
echo "sudo tail -f /var/log/nginx/api_access.log"
echo "sudo tail -f /var/log/nginx/api_error.log"
echo ""
echo "🧪 Para testar:"
echo "./test-api-limits.sh"

