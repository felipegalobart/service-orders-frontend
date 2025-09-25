# 🎨 Mitsuwa Design System

## 📋 **Visão Geral**

Este documento define o sistema de design da Mitsuwa, incluindo paletas de cores, componentes e diretrizes de uso para manter consistência visual em todo o projeto.

## 🎨 **Paleta de Cores Principal**

### **Cores Corporativas**
- **Vermelho**: Cor principal da marca Mitsuwa
- **Cinza Escuro**: Elementos secundários e fundos
- **Preto**: Elegância e sofisticação
- **Branco**: Texto e contraste

### **Especificações Técnicas**

#### **🎯 Cores Primárias**

| Cor | Nome | Hex | RGB | Uso |
|-----|------|-----|-----|-----|
| **Vermelho** | `red-600` | `#DC2626` | `rgb(220, 38, 38)` | Logo, links, destaques |
| **Vermelho Hover** | `red-700` | `#B91C1C` | `rgb(185, 28, 28)` | Estados hover |
| **Vermelho Claro** | `red-400` | `#F87171` | `rgb(248, 113, 113)` | Links secundários |
| **Vermelho Hover Claro** | `red-300` | `#FCA5A5` | `rgb(252, 165, 165)` | Links hover |

#### **🎯 Cores Neutras**

| Cor | Nome | Hex | RGB | Uso |
|-----|------|-----|-----|-----|
| **Preto** | `black` | `#000000` | `rgb(0, 0, 0)` | Background principal |
| **Cinza Escuro** | `gray-900` | `#111827` | `rgb(17, 24, 39)` | Background secundário |
| **Cinza Médio** | `gray-800` | `#1F2937` | `rgb(31, 41, 55)` | Cards e containers |
| **Cinza Botão** | `gray-700` | `#374151` | `rgb(55, 65, 81)` | Botões principais |
| **Cinza Hover** | `gray-600` | `#4B5563` | `rgb(75, 85, 99)` | Estados hover |
| **Cinza Borda** | `gray-600` | `#4B5563` | `rgb(75, 85, 99)` | Bordas e separadores |
| **Cinza Texto** | `gray-300` | `#D1D5DB` | `rgb(209, 213, 219)` | Texto secundário |
| **Branco** | `white` | `#FFFFFF` | `rgb(255, 255, 255)` | Texto principal |

#### **🎯 Cores de Estado**

| Estado | Cor | Hex | RGB | Uso |
|--------|-----|-----|-----|-----|
| **Sucesso** | `green-600` | `#059669` | `rgb(5, 150, 105)` | Confirmações |
| **Aviso** | `yellow-600` | `#D97706` | `rgb(217, 119, 6)` | Alertas |
| **Erro** | `red-600` | `#DC2626` | `rgb(220, 38, 38)` | Erros |
| **Info** | `blue-600` | `#2563EB` | `rgb(37, 99, 235)` | Informações |

## 🎨 **Gradientes**

### **Background Principal**
```css
bg-gradient-to-br from-black via-gray-900 to-black
```
- **Uso**: Páginas de login e fundos principais
- **Efeito**: Elegância e profundidade
- **Direção**: Diagonal (bottom-right)

### **Background Secundário**
```css
bg-gradient-to-r from-gray-800 to-gray-700
```
- **Uso**: Cards e elementos destacados
- **Efeito**: Sutil diferenciação
- **Direção**: Horizontal

## 🎨 **Sombras**

### **Sombras Padrão**
```css
shadow-lg                    /* Sombra principal */
hover:shadow-gray-500/25     /* Sombra hover sutil */
shadow-2xl                   /* Sombra destacada */
```

### **Sombras Coloridas**
```css
hover:shadow-red-500/25      /* Sombra vermelha */
hover:shadow-blue-500/25     /* Sombra azul */
```

## 🎨 **Bordas**

### **Bordas Padrão**
```css
border-gray-600              /* Borda padrão */
border-gray-700              /* Borda escura */
border-gray-500              /* Borda clara */
```

### **Bordas de Estado**
```css
border-red-600               /* Borda de erro */
border-green-600             /* Borda de sucesso */
border-yellow-600            /* Borda de aviso */
```

## 🎨 **Transparências**

### **Overlays**
```css
bg-red-900/30                /* Overlay vermelho */
bg-gray-900/50               /* Overlay escuro */
bg-black/20                  /* Overlay sutil */
```

### **Bordas Transparentes**
```css
border-red-800/50            /* Borda vermelha transparente */
border-gray-600/50           /* Borda cinza transparente */
```

## 🎨 **Componentes**

### **Botão Mitsuwa**

#### **Estados Completos**
```css
/* Estado Normal */
bg-gray-700 text-white border-gray-600 shadow-lg

/* Estado Hover */
hover:bg-gray-600 hover:border-gray-500 hover:shadow-gray-500/25

/* Estado Focus */
focus:ring-gray-500 focus:ring-2 focus:ring-offset-2

/* Estado Active */
active:bg-gray-800 active:border-gray-700 active:scale-95

/* Estado Disabled */
disabled:opacity-50 disabled:cursor-not-allowed

/* Estado Loading */
animate-spin border-2 border-current border-t-transparent
```

#### **Uso**
```tsx
<Button variant="mitsuwa" size="lg">
    Entrar
</Button>
```

### **Card Mitsuwa**

#### **Estrutura**
```css
bg-gray-800 border-gray-600 shadow-2xl
```

#### **Header**
```css
border-b border-gray-600
```

#### **Conteúdo**
```css
bg-gray-800
```

### **Input Mitsuwa**

#### **Estados**
```css
/* Normal */
bg-gray-700 border-gray-600 text-white

/* Focus */
focus:ring-gray-500 focus:border-gray-500

/* Hover */
hover:border-gray-500
```

## 🎨 **Tipografia**

### **Hierarquia de Cores**

| Elemento | Cor | Classe | Uso |
|----------|-----|--------|-----|
| **Títulos** | Branco | `text-white` | Títulos principais |
| **Subtítulos** | Cinza claro | `text-gray-300` | Subtítulos e descrições |
| **Links** | Vermelho claro | `text-red-400` | Links e ações |
| **Links Hover** | Vermelho hover | `text-red-300` | Estados hover |
| **Texto secundário** | Cinza médio | `text-gray-400` | Texto auxiliar |

### **Tamanhos**
```css
text-sm                     /* 14px - Texto pequeno */
text-base                   /* 16px - Texto padrão */
text-lg                     /* 18px - Texto grande */
text-xl                     /* 20px - Títulos pequenos */
text-2xl                    /* 24px - Títulos médios */
text-3xl                    /* 30px - Títulos grandes */
```

## 🎨 **Espaçamentos**

### **Padding Padrão**
```css
p-4                         /* 16px - Padding padrão */
p-6                         /* 24px - Padding grande */
p-8                         /* 32px - Padding extra grande */
```

### **Margin Padrão**
```css
m-4                         /* 16px - Margin padrão */
m-6                         /* 24px - Margin grande */
m-8                         /* 32px - Margin extra grande */
```

### **Gaps**
```css
space-y-6                   /* 24px - Espaçamento vertical */
space-x-4                   /* 16px - Espaçamento horizontal */
gap-4                       /* 16px - Gap padrão */
gap-6                       /* 24px - Gap grande */
```

## 🎨 **Animações**

### **Transições Padrão**
```css
transition-all duration-300 /* Transição suave */
transition-colors duration-200 /* Transição de cores */
```

### **Efeitos**
```css
active:scale-95             /* Escala no clique */
hover:scale-105            /* Escala no hover */
animate-spin               /* Rotação para loading */
```

## 🎨 **Breakpoints**

### **Responsividade**
```css
sm:                         /* 640px+ */
md:                         /* 768px+ */
lg:                         /* 1024px+ */
xl:                         /* 1280px+ */
2xl:                        /* 1536px+ */
```

## 🎨 **Exemplos de Uso**

### **Página de Login**
```tsx
<div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
    <Card className="bg-gray-800 border-gray-600 shadow-2xl">
        <CardHeader className="border-b border-gray-600">
            <CardTitle className="text-white">Entrar</CardTitle>
        </CardHeader>
        <CardContent className="bg-gray-800">
            <Button variant="mitsuwa" size="lg">
                Entrar
            </Button>
        </CardContent>
    </Card>
</div>
```

### **Header**
```tsx
<header className="bg-white shadow-sm border-b border-gray-200">
    <div className="flex items-center space-x-3">
        <img src="/logoMem.png" className="h-20 w-20 object-contain" />
        <h1 className="text-xl font-bold text-gray-900">Service Orders</h1>
    </div>
</header>
```

## 🎨 **Diretrizes de Uso**

### **✅ Faça**
- Use vermelho apenas para elementos de destaque
- Mantenha consistência com a paleta definida
- Use gradientes para backgrounds principais
- Aplique sombras sutis para profundidade
- Mantenha contraste adequado para acessibilidade

### **❌ Evite**
- Usar cores fora da paleta definida
- Criar variações não documentadas
- Usar gradientes excessivos
- Aplicar sombras muito pesadas
- Comprometer a legibilidade

## 🎨 **Ferramentas**

### **Geradores de Cores**
- [Tailwind Color Palette](https://tailwindcss.com/docs/customizing-colors)
- [Coolors](https://coolors.co/)
- [Adobe Color](https://color.adobe.com/)

### **Testes de Contraste**
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Contrast Ratio](https://contrast-ratio.com/)

## 🎨 **Versionamento**

- **v1.0** - Implementação inicial do tema Mitsuwa
- **v1.1** - Adição de variantes de botão
- **v1.2** - Documentação completa do sistema

---

**Última atualização**: Dezembro 2024  
**Mantenedor**: Equipe de Desenvolvimento Mitsuwa
