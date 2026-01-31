# UI Components Skill

## Overview

This skill covers UI component patterns using Radix UI primitives, Tailwind CSS styling, and common component patterns. Use this when building accessible, responsive UI components.

## Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| CSS Framework | Tailwind CSS | 4.1.6 |
| UI Primitives | Radix UI | Latest |
| Icons | Lucide React | 0.563.0 |
| Class Utilities | clsx, tailwind-merge | Latest |

## Directory Structure

```
app/
├── components/
│   ├── ui/                    # Reusable UI primitives
│   │   ├── Button.tsx
│   │   ├── Dialog.tsx
│   │   └── Input.tsx
│   ├── product/               # Product-specific components
│   ├── cart/                  # Cart components
│   └── layout/                # Layout components
└── styles/
    ├── app.css               # Global styles
    └── tailwind.css          # Tailwind directives
```

## Core Patterns

### Pattern: Button Component

**When to use:** Consistent button styling across the app

```typescript
import {clsx} from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
        {
          // Variants
          'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500':
            variant === 'primary',
          'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500':
            variant === 'secondary',
          'border border-gray-300 bg-transparent hover:bg-gray-50 focus:ring-gray-500':
            variant === 'outline',
          'bg-transparent hover:bg-gray-100': variant === 'ghost',
          // Sizes
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-4 py-2 text-base': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
        },
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
```

### Pattern: Dialog/Modal Component

**When to use:** Confirmation modals, forms, alerts

```typescript
import * as Dialog from '@radix-ui/react-dialog';
import {X} from 'lucide-react';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function DialogComponent({
  open,
  onOpenChange,
  title,
  description,
  children,
}: DialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="flex items-start justify-between">
            <div>
              <Dialog.Title className="text-lg font-semibold">
                {title}
              </Dialog.Title>
              {description && (
                <Dialog.Description className="mt-1 text-sm text-gray-600">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close asChild>
              <button className="rounded-sm p-1 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>
          <div className="mt-4">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

**Usage:**

```typescript
import {DialogComponent} from '~/components/ui/Dialog';
import {useState} from 'react';

export function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Dialog</button>
      
      <DialogComponent
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Confirm Action"
        description="Are you sure you want to proceed?"
      >
        <div className="flex gap-2">
          <button onClick={() => setIsOpen(false)}>Cancel</button>
          <button onClick={() => {
            // Handle confirm
            setIsOpen(false);
          }}>
            Confirm
          </button>
        </div>
      </DialogComponent>
    </>
  );
}
```

### Pattern: Dropdown Menu

**When to use:** User menus, action menus

```typescript
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {ChevronDown, User, LogOut, Settings} from 'lucide-react';

export function UserMenu() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-gray-100">
          <User className="h-5 w-5" />
          <span>My Account</span>
          <ChevronDown className="h-4 w-4" />
        </button>
      </DropdownMenu.Trigger>
      
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[200px] rounded-md border bg-white p-1 shadow-lg"
          sideOffset={5}
        >
          <DropdownMenu.Item asChild>
            <a
              href="/account"
              className="flex items-center gap-2 rounded-sm px-2 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 outline-none"
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </a>
          </DropdownMenu.Item>
          
          <DropdownMenu.Item asChild>
            <a
              href="/account/settings"
              className="flex items-center gap-2 rounded-sm px-2 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 outline-none"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </a>
          </DropdownMenu.Item>
          
          <DropdownMenu.Separator className="my-1 h-px bg-gray-200" />
          
          <DropdownMenu.Item asChild>
            <button
              className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm text-red-600 hover:bg-red-50 focus:bg-red-50 outline-none"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
```

### Pattern: Form Input

**When to use:** Consistent form inputs with labels and errors

```typescript
import * as Form from '@radix-ui/react-form';
import {clsx} from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  name: string;
}

export function Input({label, error, name, className, ...props}: InputProps) {
  return (
    <Form.Field name={name}>
      <Form.Label className="block text-sm font-medium text-gray-700">
        {label}
      </Form.Label>
      <Form.Control asChild>
        <input
          className={clsx(
            'mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500',
            {
              'border-gray-300': !error,
              'border-red-500': error,
            },
            className,
          )}
          {...props}
        />
      </Form.Control>
      {error && (
        <Form.Message className="mt-1 text-sm text-red-600">
          {error}
        </Form.Message>
      )}
    </Form.Field>
  );
}
```

### Pattern: Loading Skeleton

**When to use:** Show loading states

```typescript
export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square bg-gray-200 rounded-md" />
      <div className="mt-2 h-4 bg-gray-200 rounded w-3/4" />
      <div className="mt-1 h-4 bg-gray-200 rounded w-1/2" />
    </div>
  );
}

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({length: 8}).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
```

### Pattern: Responsive Layout

**When to use:** Container widths and responsive grids

```typescript
export function Container({children}: {children: React.ReactNode}) {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {children}
    </div>
  );
}

export function ProductGrid({children}: {children: React.ReactNode}) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {children}
    </div>
  );
}
```

### Pattern: Toast Notifications

**When to use:** Success/error messages

```typescript
import * as Toast from '@radix-ui/react-toast';
import {CheckCircle, XCircle} from 'lucide-react';

interface ToastProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'success' | 'error';
  title: string;
  description?: string;
}

export function ToastNotification({
  open,
  onOpenChange,
  type,
  title,
  description,
}: ToastProps) {
  return (
    <Toast.Provider>
      <Toast.Root
        open={open}
        onOpenChange={onOpenChange}
        className={clsx(
          'flex items-start gap-3 rounded-lg p-4 shadow-lg',
          {
            'bg-green-50 text-green-900': type === 'success',
            'bg-red-50 text-red-900': type === 'error',
          },
        )}
      >
        {type === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
        {type === 'error' && <XCircle className="h-5 w-5 text-red-600" />}
        
        <div className="flex-1">
          <Toast.Title className="font-medium">{title}</Toast.Title>
          {description && (
            <Toast.Description className="mt-1 text-sm">
              {description}
            </Toast.Description>
          )}
        </div>
        
        <Toast.Close className="text-gray-500 hover:text-gray-700">
          <X className="h-4 w-4" />
        </Toast.Close>
      </Toast.Root>
      <Toast.Viewport className="fixed bottom-0 right-0 z-50 m-4 flex max-w-md flex-col gap-2" />
    </Toast.Provider>
  );
}
```

## Styling Patterns

### Utility Function for Class Names

```typescript
import {clsx, type ClassValue} from 'clsx';
import {twMerge} from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Usage:**

```typescript
<div className={cn(
  'base-class',
  condition && 'conditional-class',
  'another-class',
  props.className, // Allow prop overrides
)} />
```

### Responsive Design Patterns

```typescript
// Mobile-first approach
<div className="
  text-sm              // Mobile
  md:text-base         // Tablet (768px+)
  lg:text-lg           // Desktop (1024px+)
  xl:text-xl           // Large desktop (1280px+)
" />

// Grid patterns
<div className="
  grid
  grid-cols-1          // Mobile: 1 column
  sm:grid-cols-2       // Small: 2 columns
  md:grid-cols-3       // Medium: 3 columns
  lg:grid-cols-4       // Large: 4 columns
  gap-4                // Gap between items
" />
```

### Focus States (Accessibility)

```typescript
<button className="
  focus:outline-none
  focus:ring-2
  focus:ring-indigo-500
  focus:ring-offset-2
" />
```

## Testing Patterns

```typescript
import {render, screen} from '@testing-library/react';
import {Button} from '~/components/ui/Button';

describe('Button', () => {
  it('should render children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('should apply variant classes', () => {
    const {container} = render(<Button variant="primary">Primary</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('bg-indigo-600');
  });
});
```

## Gotchas & Best Practices

- **DO:** Use Radix UI for accessible primitives
- **DO:** Follow mobile-first responsive design
- **DO:** Use semantic HTML elements
- **DO:** Provide focus styles for keyboard navigation
- **DO:** Use consistent spacing and sizing scales
- **DO:** Test components with screen readers
- **AVOID:** Inline styles (use Tailwind classes)
- **AVOID:** Forgetting to handle loading and error states
- **AVOID:** Using div for interactive elements (use button)
- **AVOID:** Hardcoding colors (use Tailwind tokens)
- **AVOID:** Ignoring reduced motion preferences

## Related Skills

- `form-validation` - Form components with validation
- `product-personalization` - Dialog patterns for engraving
- `cart-management` - Aside/drawer components
- `shopify-customer-account-api` - User menu patterns
