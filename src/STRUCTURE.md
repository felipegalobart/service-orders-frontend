# Frontend Structure

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Basic UI components (Button, Input, Modal, etc.)
│   ├── forms/           # Form components (LoginForm, PersonForm, etc.)
│   └── layout/          # Layout components (Header, Sidebar, Footer)
├── pages/               # Page components for routing
│   ├── auth/            # Authentication pages (Login, Register)
│   ├── dashboard/       # Dashboard pages (Home, Profile)
│   └── persons/         # Person management pages (List, Create, Edit, View)
├── services/            # API services and external integrations
├── hooks/               # Custom React hooks
├── utils/               # Utility functions and helpers
├── types/               # TypeScript type definitions
├── contexts/            # React contexts for state management
└── assets/              # Static assets (images, icons, etc.)
```

## 🎯 Purpose of Each Folder

### Components
- **ui/**: Basic, reusable UI components (buttons, inputs, modals)
- **forms/**: Complex form components with validation
- **layout/**: Layout and navigation components

### Pages
- **auth/**: Authentication and user management
- **dashboard/**: Main application dashboard
- **persons/**: Person (client/supplier) management

### Services
- API communication layer
- External service integrations
- Data fetching logic

### Hooks
- Custom React hooks for reusable logic
- State management hooks
- API integration hooks

### Utils
- Helper functions
- Constants
- Validation utilities

### Types
- TypeScript interfaces and types
- API response types
- Component prop types

### Contexts
- React contexts for global state
- Theme management
- Authentication state

## 📝 Usage Examples

```typescript
// Import components
import { Button, Input, Modal } from '@/components/ui';
import { LoginForm } from '@/components/forms';
import { Header, Sidebar } from '@/components/layout';

// Import pages
import { Login, PersonList, PersonCreate } from '@/pages';

// Import services
import { authService, personService } from '@/services';

// Import hooks
import { useAuth, usePersons } from '@/hooks';

// Import types
import { IPerson, IUser } from '@/types';
```
