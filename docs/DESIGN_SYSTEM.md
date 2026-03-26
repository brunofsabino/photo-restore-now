# Design System - PhotoRestoreNow

Design system baseado nos princípios do **Refactoring UI** por Adam Wathan e Steve Schoger.

## 🎨 Princípios Fundamentais

### 1. **Use Fewer Borders** 
Substitua bordas por sombras sutis para criar hierarquia visual.

```tsx
// ❌ Evite
<div className="border border-gray-200">

// ✅ Prefira
<DSCard variant="default"> // Usa shadow-md sem borda
```

### 2. **Text Hierarchy via Size AND Weight**
Combine tamanho E peso para criar hierarquia clara.

```tsx
// ❌ Apenas tamanho
<p className="text-sm text-gray-400">

// ✅ Tamanho + peso semântico
<DSSupportingText size="sm"> // text-xs + font-medium + text-gray-500
```

### 3. **Consistent Spacing Scale**
Use sistema de espaçamento baseado em 8px grid.

```tsx
import { spacing } from '@/lib/design-system';

// 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96
```

---

## 📦 Componentes Disponíveis

### **DSButton**
Botões com hierarquia visual clara.

```tsx
import { DSButton } from '@/components/ds';

// Primary CTA - máxima atenção
<DSButton variant="primary" size="lg">
  Get Started
</DSButton>

// Secondary - importante mas menos atenção
<DSButton variant="secondary">
  Learn More
</DSButton>

// Ghost - ação terciária
<DSButton variant="ghost">
  Cancel
</DSButton>

// Com ícones
<DSButton 
  variant="primary" 
  leftIcon={<Star />}
  rightIcon={<ArrowRight />}
>
  Continue
</DSButton>

// Loading state
<DSButton isLoading variant="primary">
  Processing...
</DSButton>
```

**Props:**
- `variant`: `'primary' | 'secondary' | 'ghost' | 'destructive'`
- `size`: `'sm' | 'md' | 'lg' | 'xl'`  
- `isLoading`: boolean
- `leftIcon`, `rightIcon`: React.ReactNode

---

### **DSCard**
Cards sem bordas, com sombras.

```tsx
import { DSCard } from '@/components/ds';

// Card padrão - sombra sutil
<DSCard variant="default" padding="md">
  <h3>Title</h3>
  <p>Content</p>
</DSCard>

// Card interativo - hover lift
<DSCard variant="interactive" onClick={handleClick}>
  Clickable Card
</DSCard>

// Card destacado - gradiente + borda
<DSCard variant="featured">
  Premium Content
</DSCard>

// Glass morphism
<DSCard variant="glass">
  Modern blurred background
</DSCard>

// Flat - sem sombra
<DSCard variant="flat">
  Subtle background
</DSCard>
```

**Variantes:**
- `default`: Shadow sutil, branco
- `interactive`: Hover lift, clickable
- `featured`: Gradiente, ring primário
- `flat`: Background cinza, sem shadow
- `glass`: Backdrop blur, transparência

**Sub-componentes:**
```tsx
<DSCard>
  <DSCardHeader>
    <DSCardTitle>Title</DSCardTitle>
    <DSCardDescription>Description</DSCardDescription>
  </DSCardHeader>
  <DSCardContent>
    Main content
  </DSCardContent>
  <DSCardFooter>
    Actions
  </DSCardFooter>
</DSCard>
```

---

### **DSBadge**
Tags e status badges com cores semânticas.

```tsx
import { DSBadge } from '@/components/ds';
import { Star } from 'lucide-react';

<DSBadge variant="primary">New</DSBadge>
<DSBadge variant="success">Active</DSBadge>
<DSBadge variant="warning">Pending</DSBadge>
<DSBadge variant="neutral">Default</DSBadge>

// Com ícone
<DSBadge variant="primary" icon={<Star className="h-4 w-4" />}>
  Featured
</DSBadge>
```

---

### **Typography**
Componentes semânticos com estilos consistentes.

```tsx
import { DSDisplay, DSHeading, DSText, DSLabel, DSSupportingText } from '@/components/ds';

// Display - Hero text
<DSDisplay size="lg">
  Bring Your Photos Back to Life
</DSDisplay>

// Headings
<DSHeading size="xl">Section Title</DSHeading>
<DSHeading size="md" as="h3">Subsection</DSHeading>

// Body text
<DSText size="lg">
  Large body text with relaxed line-height
</DSText>

// Labels - UI elements
<DSLabel size="md" htmlFor="email">
  Email Address
</DSLabel>

// Supporting text - menor, mais leve
<DSSupportingText size="sm">
  Helper text or metadata
</DSSupportingText>
```

**Tamanhos:**
- Display: `xl | lg | md | sm`
- Heading: `xl | lg | md | sm | xs`
- Text: `xl | lg | md | sm | xs`
- Label: `lg | md | sm`
- Supporting: `md | sm`

---

### **DSContainer**
Container responsivo com tamanhos predefinidos.

```tsx
import { DSContainer } from '@/components/ds';

<DSContainer size="lg"> // max-w-6xl
  <h1>Content</h1>
</DSContainer>

<DSContainer size="md" center={false}>
  Not centered
</DSContainer>
```

**Tamanhos:**
- `xs`: 448px - formulários pequenos
- `sm`: 672px - conteúdo
- `md`: 896px - artigos
- `lg`: 1152px - dashboards (padrão)
- `xl`: 1280px - full app

---

## 🎨 Sistema de Cores

```tsx
import { colors } from '@/lib/design-system';

// Primary brand
colors.primary[500] // #3b82f6
colors.primary[600] // Main brand

// Semantic colors
colors.success[500]
colors.warning[500]
colors.error[500]

// Neutral grays (higher contrast)
colors.neutral[500] // #737373
colors.neutral[700] // #404040
```

**Uso no Tailwind:**
```tsx
// Funciona automaticamente
className="bg-primary-600 text-primary-100"
```

---

## 🌈 Sombras (Shadows)

```tsx
import { shadows } from '@/lib/design-system';

shadows.xs    // shadow-sm - Sutil
shadows.sm    // shadow-md - Cards
shadows.md    // shadow-lg - Dropdowns
shadows.lg    // shadow-xl - Modais
shadows.xl    // shadow-2xl - Máxima elevação

// Sombras coloridas
shadows.primary  // shadow-lg shadow-primary-200/50
```

---

## 📏 Espaçamento

```tsx
import { spacing } from '@/lib/design-system';

// Sistema consistente (8px grid)
spacing[1]  // 4px
spacing[2]  // 8px
spacing[4]  // 16px
spacing[6]  // 24px
spacing[8]  // 32px
spacing[12] // 48px
```

**Uso no Tailwind:**
```tsx
className="mb-6 p-8 gap-4" // 24px, 32px, 16px
```

---

## 🎭 Animações

```tsx
import { animations } from '@/lib/design-system';

// Hover lift
<div className={animations.hoverLift}>
  Card content
</div>

// Fade in
<div className={animations.fadeIn}>
  Content
</div>

// Slide up
<div className={animations.slideUp}>
  Modal
</div>
```

---

## 🔧 Utilitários

### **cn() - Combine classes**
```tsx
import { cn } from '@/lib/design-system';

const buttonClass = cn(
  'base-styles',
  isActive && 'active-styles',
  className // prop do componente
);
```

---

## 📝 Exemplos de Uso

### **Pricing Card**
```tsx
<DSCard variant="featured" padding="none">
  {/* Header */}
  <div className="p-8 text-center">
    <DSHeading size="lg">Premium Plan</DSHeading>
    <div className="text-5xl font-extrabold text-gray-900">$29</div>
    <DSSupportingText>per month</DSSupportingText>
  </div>
  
  {/* Features */}
  <div className="px-8 pb-8">
    <ul className="space-y-3">
      <li className="flex gap-3">
        <Check className="text-success-600" />
        <span>Feature 1</span>
      </li>
    </ul>
    
    <DSButton variant="primary" size="lg" className="w-full">
      Get Started
    </DSButton>
  </div>
</DSCard>
```

### **Hero Section**
```tsx
<section className="py-20 bg-gradient-to-br from-blue-100 to-white">
  <DSContainer size="lg">
    <div className="text-center">
      <DSDisplay size="lg" className="mb-6">
        Transform Your Photos
      </DSDisplay>
      <DSText size="xl" className="mb-8 text-gray-600">
        AI-powered restoration in 24 hours
      </DSText>
      <DSButton variant="primary" size="xl">
        Get Started Now
      </DSButton>
    </div>
  </DSContainer>
</section>
```

### **Form**
```tsx
<form className="space-y-6">
  <div>
    <DSLabel size="md" htmlFor="email">
      Email Address
    </DSLabel>
    <input 
      id="email"
      type="email" 
      className={inputVariants.default}
    />
    <DSSupportingText size="sm">
      We'll never share your email
    </DSSupportingText>
  </div>
  
  <DSButton type="submit" variant="primary" size="lg">
    Submit
  </DSButton>
</form>
```

---

## ✅ Checklist de Refatoração

Ao refatorar páginas existentes:

- [ ] Substituir `<Button>` por `<DSButton>` com variants apropriados
- [ ] Trocar `<Card>` por `<DSCard>` com variant correto
- [ ] Usar `<DSDisplay>` / `<DSHeading>` em vez de tags `<h1-h6>` genéricas
- [ ] Aplicar `<DSText>` para parágrafos com line-height correto
- [ ] Substituir badges por `<DSBadge>` com cores semânticas
- [ ] Usar `<DSContainer>` para width constraints
- [ ] Remover bordas desnecessárias, adicionar sombras
- [ ] Garantir espaçamento consistente (8px grid)
- [ ] Aplicar text hierarchy (tamanho + peso)
- [ ] Adicionar hover states (lift, scale)

---

## 📚 Recursos

- **Refactoring UI** - Adam Wathan & Steve Schoger
- **Princípios aplicados:**
  - Start with too much white space
  - Use fewer borders
  - Think in systems, not pixels
  - Define systems in advance
  - supercharge the defaults

---

## 🎯 Próximos Passos

1. Refatorar homepage com design system
2. Atualizar página de select-service
3. Melhorar dashboard com novos componentes
4. Criar input components (forms)
5. Adicionar modal/dialog components
6. Implementar toast notifications
