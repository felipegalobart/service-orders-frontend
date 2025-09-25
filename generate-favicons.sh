#!/bin/bash

# Script para gerar favicons a partir de um ícone da empresa
# Este script converte um ícone PNG/SVG em diferentes tamanhos de favicon

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎨 Gerador de Favicons para Service Orders${NC}"
echo "================================================"

# Verificar se o ImageMagick está instalado
if ! command -v convert &> /dev/null; then
    echo -e "${YELLOW}📦 Instalando ImageMagick...${NC}"
    sudo apt update
    sudo apt install -y imagemagick
    echo -e "${GREEN}✅ ImageMagick instalado${NC}"
else
    echo -e "${GREEN}✅ ImageMagick já está instalado${NC}"
fi

# Verificar se o arquivo de entrada existe
if [ ! -f "company-icon.png" ] && [ ! -f "company-icon.svg" ]; then
    echo -e "${YELLOW}⚠️  Arquivo company-icon.png ou company-icon.svg não encontrado${NC}"
    echo -e "${YELLOW}   Coloque o ícone da sua empresa na pasta atual com o nome 'company-icon.png'${NC}"
    echo -e "${YELLOW}   Ou use 'company-icon.svg' para arquivos SVG${NC}"
    echo ""
    echo -e "${BLUE}📋 Formatos suportados:${NC}"
    echo "  • PNG (recomendado): company-icon.png"
    echo "  • SVG: company-icon.svg"
    echo "  • JPG: company-icon.jpg"
    echo ""
    echo -e "${BLUE}📏 Tamanhos recomendados:${NC}"
    echo "  • Mínimo: 512x512 pixels"
    echo "  • Ideal: 1024x1024 pixels"
    echo "  • Formato: PNG com fundo transparente"
    echo ""
    echo -e "${YELLOW}💡 Dica: Use um ícone quadrado com fundo transparente para melhor resultado${NC}"
    exit 1
fi

# Determinar o arquivo de entrada
if [ -f "company-icon.png" ]; then
    INPUT_FILE="company-icon.png"
elif [ -f "company-icon.svg" ]; then
    INPUT_FILE="company-icon.svg"
elif [ -f "company-icon.jpg" ]; then
    INPUT_FILE="company-icon.jpg"
else
    echo -e "${RED}❌ Nenhum arquivo de ícone encontrado${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Arquivo encontrado: $INPUT_FILE${NC}"

# Criar diretório de saída
mkdir -p favicons

# Gerar favicons em diferentes tamanhos
echo -e "${YELLOW}🔄 Gerando favicons...${NC}"

# Favicon padrão (16x16)
convert "$INPUT_FILE" -resize 16x16 favicons/favicon-16x16.png
echo -e "${GREEN}✅ favicon-16x16.png criado${NC}"

# Favicon médio (32x32)
convert "$INPUT_FILE" -resize 32x32 favicons/favicon-32x32.png
echo -e "${GREEN}✅ favicon-32x32.png criado${NC}"

# Apple Touch Icon (180x180)
convert "$INPUT_FILE" -resize 180x180 favicons/apple-touch-icon.png
echo -e "${GREEN}✅ apple-touch-icon.png criado${NC}"

# Android Chrome (192x192)
convert "$INPUT_FILE" -resize 192x192 favicons/android-chrome-192x192.png
echo -e "${GREEN}✅ android-chrome-192x192.png criado${NC}"

# Android Chrome (512x512)
convert "$INPUT_FILE" -resize 512x512 favicons/android-chrome-512x512.png
echo -e "${GREEN}✅ android-chrome-512x512.png criado${NC}"

# Favicon ICO (16x16)
convert "$INPUT_FILE" -resize 16x16 favicons/favicon.ico
echo -e "${GREEN}✅ favicon.ico criado${NC}"

# Copiar para a pasta public
echo -e "${YELLOW}📁 Copiando favicons para a pasta public...${NC}"
cp favicons/* public/
echo -e "${GREEN}✅ Favicons copiados para public/${NC}"

# Limpar arquivos temporários
rm -rf favicons

echo ""
echo -e "${GREEN}🎉 Favicons gerados com sucesso!${NC}"
echo "================================================"
echo -e "${BLUE}📊 Arquivos criados:${NC}"
echo "  • public/favicon.ico"
echo "  • public/favicon-16x16.png"
echo "  • public/favicon-32x32.png"
echo "  • public/apple-touch-icon.png"
echo "  • public/android-chrome-192x192.png"
echo "  • public/android-chrome-512x512.png"
echo "  • public/site.webmanifest"
echo ""
echo -e "${BLUE}🔧 Próximos passos:${NC}"
echo "  1. Teste localmente: npm run dev"
echo "  2. Faça deploy: ./deploy-frontend.sh"
echo "  3. Verifique no navegador: https://service.mitsuwa.com.br/"
echo ""
echo -e "${YELLOW}💡 Dica: Limpe o cache do navegador (Ctrl+F5) para ver as mudanças${NC}"
