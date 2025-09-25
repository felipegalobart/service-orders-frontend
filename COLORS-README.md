# 🎨 Mitsuwa Color System

## 📋 **Visão Geral**

Este diretório contém toda a documentação e configuração do sistema de cores da Mitsuwa, garantindo consistência visual em todo o projeto.

## 📁 **Estrutura de Arquivos**

```
src/
├── config/
│   └── colors.ts              # Configuração TypeScript das cores
├── styles/
│   └── mitsuwa-colors.css     # Variáveis CSS e classes utilitárias
└── MITSUWA-DESIGN-SYSTEM.md   # Documentação completa do design system
```

## 🎨 **Arquivos de Configuração**

### **1. `colors.ts` - Configuração TypeScript**
- ✅ **Constantes de cores** com valores hexadecimais
- ✅ **Paletas específicas** para diferentes componentes
- ✅ **Funções utilitárias** para acesso programático
- ✅ **Tipos TypeScript** para type safety
- ✅ **Classes pré-definidas** para uso rápido

### **2. `mitsuwa-colors.css` - Variáveis CSS**
- ✅ **Variáveis CSS customizadas** (`:root`)
- ✅ **Classes utilitárias** prontas para uso
- ✅ **Suporte a dark mode** automático
- ✅ **Responsividade** integrada
- ✅ **Estilos de impressão** otimizados

### **3. `MITSUWA-DESIGN-SYSTEM.md` - Documentação**
- ✅ **Guia completo** de uso das cores
- ✅ **Exemplos práticos** de implementação
- ✅ **Diretrizes de uso** e boas práticas
- ✅ **Ferramentas** e recursos auxiliares

## 🚀 **Como Usar**

### **Opção 1: Classes Tailwind (Recomendado)**
```tsx
// Usar classes Tailwind com as cores definidas
<button className="bg-gray-700 hover:bg-gray-600 text-white">
  Entrar
</button>
```

### **Opção 2: Configuração TypeScript**
```tsx
import { PALETTES, CLASS_UTILITIES } from '@/config/colors';

// Usar paleta específica
<div className={PALETTES.login.background}>
  <Card className={PALETTES.login.card}>
    <Button className={CLASS_UTILITIES.buttonMitsuwa}>
      Entrar
    </Button>
  </Card>
</div>
```

### **Opção 3: Variáveis CSS**
```tsx
// Usar classes CSS customizadas
<button className="btn-mitsuwa">
  Entrar
</button>
```

## 🎯 **Cores Principais**

### **Vermelho (Cor Principal)**
- **600**: `#DC2626` - Cor principal da marca
- **700**: `#B91C1C` - Estados hover
- **400**: `#F87171` - Links e destaques
- **300**: `#FCA5A5` - Links hover

### **Cinza (Elementos Secundários)**
- **800**: `#1F2937` - Cards e containers
- **700**: `#374151` - Botões principais
- **600**: `#4B5563` - Bordas e separadores
- **300**: `#D1D5DB` - Texto secundário

### **Preto e Branco**
- **Preto**: `#000000` - Background principal
- **Branco**: `#FFFFFF` - Texto principal

## 🎨 **Paletas por Componente**

### **Página de Login**
```css
background: bg-gradient-to-br from-black via-gray-900 to-black
card: bg-gray-800 border-gray-600 shadow-2xl
button: bg-gray-700 hover:bg-gray-600
```

### **Header**
```css
background: bg-white shadow-sm border-b border-gray-200
logo: h-20 w-20 object-contain
title: text-xl font-bold text-gray-900
```

### **Cards**
```css
default: bg-white border-gray-200 shadow-sm
dark: bg-gray-800 border-gray-600 shadow-2xl
```

## 🎨 **Estados de Componentes**

### **Botão Mitsuwa**
```css
/* Normal */
bg-gray-700 text-white border-gray-600 shadow-lg

/* Hover */
hover:bg-gray-600 hover:border-gray-500 hover:shadow-gray-500/25

/* Focus */
focus:ring-gray-500 focus:ring-2 focus:ring-offset-2

/* Active */
active:bg-gray-800 active:border-gray-700 active:scale-95

/* Disabled */
disabled:opacity-50 disabled:cursor-not-allowed
```

### **Input Mitsuwa**
```css
/* Normal */
bg-gray-700 border-gray-600 text-white

/* Focus */
focus:border-gray-500 focus:ring-gray-500

/* Hover */
hover:border-gray-500
```

## 🎨 **Gradientes**

### **Background Principal**
```css
bg-gradient-to-br from-black via-gray-900 to-black
```

### **Background Secundário**
```css
bg-gradient-to-r from-gray-800 to-gray-700
```

## 🎨 **Sombras**

### **Sombras Padrão**
```css
shadow-sm    /* Sombra pequena */
shadow-md    /* Sombra média */
shadow-lg    /* Sombra grande */
shadow-xl    /* Sombra extra grande */
shadow-2xl   /* Sombra máxima */
```

### **Sombras Coloridas**
```css
hover:shadow-red-500/25    /* Sombra vermelha */
hover:shadow-gray-500/25   /* Sombra cinza */
hover:shadow-blue-500/25   /* Sombra azul */
```

## 🎨 **Transições**

### **Durações**
```css
duration-150  /* Transição rápida */
duration-300  /* Transição normal */
duration-500  /* Transição lenta */
```

### **Propriedades**
```css
transition-all           /* Todas as propriedades */
transition-colors        /* Apenas cores */
transition-transform      /* Apenas transformações */
```

## 🎨 **Responsividade**

### **Breakpoints**
```css
sm: 640px+   /* Mobile grande */
md: 768px+   /* Tablet */
lg: 1024px+  /* Desktop */
xl: 1280px+  /* Desktop grande */
2xl: 1536px+ /* Desktop extra grande */
```

### **Exemplo Responsivo**
```css
h-20 w-20 sm:h-24 sm:w-24  /* 80px mobile, 96px desktop */
```

## 🎨 **Acessibilidade**

### **Contraste**
- ✅ **Texto principal**: Branco sobre preto (21:1)
- ✅ **Texto secundário**: Cinza claro sobre preto (4.5:1)
- ✅ **Botões**: Branco sobre cinza escuro (4.5:1)
- ✅ **Links**: Vermelho claro sobre preto (4.5:1)

### **Focus States**
```css
focus:ring-gray-500 focus:ring-2 focus:ring-offset-2
```

## 🎨 **Dark Mode**

### **Suporte Automático**
```css
@media (prefers-color-scheme: dark) {
  :root {
    /* Cores ajustadas automaticamente */
  }
}
```

## 🎨 **Ferramentas**

### **Geradores de Cores**
- [Tailwind Color Palette](https://tailwindcss.com/docs/customizing-colors)
- [Coolors](https://coolors.co/)
- [Adobe Color](https://color.adobe.com/)

### **Testes de Contraste**
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Contrast Ratio](https://contrast-ratio.com/)

## 🎨 **Exemplos Práticos**

### **Página de Login Completa**
```tsx
import { PALETTES } from '@/config/colors';

export const LoginPage = () => (
  <div className={PALETTES.login.background}>
    <Card className={PALETTES.login.card}>
      <CardHeader className={PALETTES.login.cardHeader}>
        <CardTitle className={PALETTES.login.title}>
          Entrar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Button className={PALETTES.login.button}>
          Entrar
        </Button>
        <Link className={PALETTES.login.link} to="/register">
          Criar conta
        </Link>
      </CardContent>
    </Card>
  </div>
);
```

### **Header Completo**
```tsx
import { PALETTES } from '@/config/colors';

export const Header = () => (
  <header className={PALETTES.header.background}>
    <div className="flex items-center space-x-3">
      <img 
        src="/logoMem.png" 
        className={PALETTES.header.logo}
        alt="Logo Mitsuwa" 
      />
      <h1 className={PALETTES.header.title}>
        Service Orders
      </h1>
    </div>
  </header>
);
```

## 🎨 **Manutenção**

### **Atualizações**
1. **Cores**: Atualize em `colors.ts` e `mitsuwa-colors.css`
2. **Documentação**: Mantenha `MITSUWA-DESIGN-SYSTEM.md` atualizado
3. **Testes**: Verifique contraste e acessibilidade
4. **Consistência**: Use as ferramentas de validação

### **Versionamento**
- **v1.0**: Implementação inicial
- **v1.1**: Adição de variantes de botão
- **v1.2**: Documentação completa
- **v1.3**: Suporte a dark mode

---

**Última atualização**: Dezembro 2024  
**Mantenedor**: Equipe de Desenvolvimento Mitsuwa
