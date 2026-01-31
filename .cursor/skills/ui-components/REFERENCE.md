# UI Components Reference

## Industry Best Practices

### Component Design Principles

**Composition Over Configuration**
```typescript
// DO: Composable components
<Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
  <Dialog.Trigger asChild>
    <button>Open</button>
  </Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay />
    <Dialog.Content>
      <Dialog.Title>Title</Dialog.Title>
      <Dialog.Description>Description</Dialog.Description>
      {children}
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>

// AVOID: Prop explosion
<Dialog
  isOpen={isOpen}
  onClose={() => {}}
  title="Title"
  description="Description"
  showOverlay={true}
  overlayColor="black"
  overlayOpacity={0.5}
  contentPadding="24px"
  // 20+ props...
/>
```

**Consistent Prop Interfaces**
```typescript
// DO: Extend native element props
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({variant = 'primary', size = 'md', ...props}: ButtonProps) {
  return <button {...props} className={getButtonClasses(variant, size)} />;
}

// Usage: All native button props work
<Button type="submit" disabled onClick={handleClick} aria-label="Save">
  Save
</Button>
```

**Polymorphic Components**
```typescript
// DO: Support "as" prop for flexibility
type PolymorphicProps<T extends React.ElementType> = {
  as?: T;
} & React.ComponentPropsWithoutRef<T>;

export function Text<T extends React.ElementType = 'span'>({
  as,
  ...props
}: PolymorphicProps<T>) {
  const Component = as || 'span';
  return <Component {...props} />;
}

// Usage
<Text>Span by default</Text>
<Text as="p">Paragraph</Text>
<Text as="h1">Heading</Text>
<Text as={Link} to="/home">Link</Text>
```

### Accessibility

**ARIA Labels and Roles**
```typescript
// DO: Provide accessible labels
export function Dialog({title, children}: Props) {
  const titleId = useId();
  const descriptionId = useId();
  
  return (
    <div
      role="dialog"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-modal="true"
    >
      <h2 id={titleId}>{title}</h2>
      <div id={descriptionId}>{children}</div>
    </div>
  );
}

// AVOID: Missing ARIA attributes
<div className="dialog">
  <h2>{title}</h2>
  {children}
</div>
```

**Keyboard Navigation**
```typescript
// DO: Support keyboard interactions
export function Menu({items, onSelect}: Props) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((i) => (i + 1) % items.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((i) => (i - 1 + items.length) % items.length);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onSelect(items[focusedIndex]);
        break;
      case 'Escape':
        onClose();
        break;
    }
  };
  
  return (
    <ul role="menu" onKeyDown={handleKeyDown}>
      {items.map((item, index) => (
        <li
          key={item.id}
          role="menuitem"
          tabIndex={focusedIndex === index ? 0 : -1}
          onClick={() => onSelect(item)}
        >
          {item.label}
        </li>
      ))}
    </ul>
  );
}
```

**Focus Management**
```typescript
import {useEffect, useRef} from 'react';

// DO: Trap focus in modals
export function Modal({isOpen, onClose, children}: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!isOpen) return;
    
    const dialog = dialogRef.current;
    if (!dialog) return;
    
    // Get all focusable elements
    const focusableElements = dialog.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    // Focus first element
    firstElement?.focus();
    
    // Trap focus
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };
    
    dialog.addEventListener('keydown', handleKeyDown);
    return () => dialog.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return <div ref={dialogRef}>{children}</div>;
}
```

## Tailwind CSS Best Practices

### Utility Class Organization

**Consistent Order**
```typescript
// DO: Follow a consistent order
// Layout → Display → Spacing → Sizing → Typography → Visual → Misc
<div className="
  relative
  flex items-center justify-between
  px-4 py-2
  w-full max-w-md
  text-sm font-medium
  bg-white border border-gray-300 rounded-md shadow-sm
  hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500
">

// AVOID: Random order
<div className="
  text-sm bg-white focus:ring-2 px-4 relative border w-full
  hover:bg-gray-50 flex py-2 rounded-md max-w-md
">
```

### Extracting Reusable Styles

**Component Variants with clsx**
```typescript
import {clsx} from 'clsx';

const buttonVariants = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
  secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
  outline: 'border border-gray-300 bg-transparent hover:bg-gray-50',
  ghost: 'bg-transparent hover:bg-gray-100',
};

const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export function Button({variant = 'primary', size = 'md', className, ...props}: Props) {
  return (
    <button
      className={clsx(
        // Base styles
        'rounded-md font-medium transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        // Variants
        buttonVariants[variant],
        buttonSizes[size],
        // Allow overrides
        className,
      )}
      {...props}
    />
  );
}
```

### Responsive Design Patterns

**Mobile-First Breakpoints**
```typescript
// DO: Mobile-first (default → sm → md → lg → xl)
<div className="
  grid
  grid-cols-1     // Mobile: 1 column
  sm:grid-cols-2  // Small (640px+): 2 columns
  md:grid-cols-3  // Medium (768px+): 3 columns
  lg:grid-cols-4  // Large (1024px+): 4 columns
  gap-4
">

// AVOID: Desktop-first
<div className="grid-cols-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
```

**Container Patterns**
```typescript
// DO: Responsive padding
export function Container({children}: Props) {
  return (
    <div className="
      container mx-auto
      px-4           // Mobile
      sm:px-6        // Small screens
      lg:px-8        // Large screens
    ">
      {children}
    </div>
  );
}
```

## Radix UI Patterns

### Data Attributes for Styling

**State-Based Styling**
```typescript
// DO: Use data-state attributes
<Dialog.Overlay className="
  fixed inset-0 bg-black/50
  data-[state=open]:animate-in
  data-[state=closed]:animate-out
  data-[state=open]:fade-in-0
  data-[state=closed]:fade-out-0
" />

<Dialog.Content className="
  fixed left-1/2 top-1/2
  -translate-x-1/2 -translate-y-1/2
  bg-white rounded-lg p-6
  data-[state=open]:animate-in
  data-[state=closed]:animate-out
  data-[state=open]:fade-in-0
  data-[state=closed]:fade-out-0
  data-[state=open]:zoom-in-95
  data-[state=closed]:zoom-out-95
" />
```

### Controlled vs Uncontrolled

**Controlled Components**
```typescript
// DO: Use controlled state for complex logic
export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset on close
      setQuery('');
    }
  };
  
  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <button>Search</button>
      </Dialog.Trigger>
      <Dialog.Content>
        <input value={query} onChange={(e) => setQuery(e.target.value)} />
      </Dialog.Content>
    </Dialog.Root>
  );
}
```

### Portal for Overlays

**Proper Stacking**
```typescript
// DO: Use Portal to escape container stacking context
<Dialog.Root>
  <Dialog.Trigger>Open</Dialog.Trigger>
  
  <Dialog.Portal>
    {/* Rendered at document.body, above all content */}
    <Dialog.Overlay />
    <Dialog.Content>
      {children}
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>

// AVOID: Without Portal
<div className="relative overflow-hidden"> {/* Clips dialog */}
  <Dialog.Content>{children}</Dialog.Content>
</div>
```

## Performance Optimization

### Lazy Load Heavy Components

**Code Splitting**
```typescript
import {lazy, Suspense} from 'react';

// Lazy load modal
const ProductModal = lazy(() => import('./ProductModal'));

export function ProductGrid({products}: Props) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  return (
    <>
      <div className="grid">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={() => setSelectedProduct(product)}
          />
        ))}
      </div>
      
      {selectedProduct && (
        <Suspense fallback={<ModalSkeleton />}>
          <ProductModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        </Suspense>
      )}
    </>
  );
}
```

### Memoize Expensive Components

**React.memo**
```typescript
import {memo} from 'react';

// DO: Memoize pure components
export const ProductCard = memo(function ProductCard({product}: Props) {
  return (
    <Link to={`/products/${product.handle}`}>
      <img src={product.featuredImage?.url} alt={product.title} />
      <h3>{product.title}</h3>
      <p>${product.priceRange.minVariantPrice.amount}</p>
    </Link>
  );
});

// Only re-renders if product changes
```

### Virtual Scrolling for Long Lists

**react-window Integration**
```typescript
import {FixedSizeList} from 'react-window';

export function ProductList({products}: Props) {
  const Row = ({index, style}: {index: number; style: React.CSSProperties}) => (
    <div style={style}>
      <ProductCard product={products[index]} />
    </div>
  );
  
  return (
    <FixedSizeList
      height={600}
      itemCount={products.length}
      itemSize={200}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

## Testing Patterns

### Component Testing

```typescript
import {render, screen, fireEvent} from '@testing-library/react';
import {Button} from '~/components/ui/Button';

describe('Button', () => {
  it('should render children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', {name: /click me/i})).toBeInTheDocument();
  });
  
  it('should handle click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
  
  it('should apply variant classes', () => {
    const {container} = render(<Button variant="primary">Primary</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('bg-indigo-600');
  });
});
```

### Accessibility Testing

```typescript
import {axe, toHaveNoViolations} from 'jest-axe';
expect.extend(toHaveNoViolations);

describe('Dialog Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const {container} = render(
      <Dialog open={true} onClose={() => {}}>
        <DialogTitle>Title</DialogTitle>
        <DialogContent>Content</DialogContent>
      </Dialog>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

## Common Pitfalls

### Problem: Z-Index Conflicts

**Symptom:** Modals appear behind other content

**Solution:** Use consistent z-index scale
```typescript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      zIndex: {
        'dropdown': '1000',
        'sticky': '1020',
        'fixed': '1030',
        'modal-backdrop': '1040',
        'modal': '1050',
        'popover': '1060',
        'tooltip': '1070',
      },
    },
  },
};

// Usage
<Dialog.Overlay className="fixed inset-0 z-modal-backdrop" />
<Dialog.Content className="fixed z-modal" />
```

### Problem: Portal Stacking Issues

**Symptom:** Multiple modals overlap incorrectly

**Solution:** Use Radix Portal container
```typescript
// DO: Specify portal container
<Dialog.Portal container={document.getElementById('modals')}>
  <Dialog.Overlay />
  <Dialog.Content />
</Dialog.Portal>

// In root layout
<div id="modals" className="relative z-50" />
```

### Problem: Hydration Mismatch

**Symptom:** Console warnings about mismatched content

**Solution:** Avoid client-only rendering
```typescript
// WRONG: Renders differently on server/client
export function ThemeToggle() {
  const [theme, setTheme] = useState(localStorage.getItem('theme')); // localStorage not available on server
  return <button>{theme === 'dark' ? 'Light' : 'Dark'}</button>;
}

// RIGHT: Use effect for client-only code
export function ThemeToggle() {
  const [theme, setTheme] = useState<string | null>(null);
  
  useEffect(() => {
    setTheme(localStorage.getItem('theme'));
  }, []);
  
  if (theme === null) return null; // Or skeleton
  
  return <button>{theme === 'dark' ? 'Light' : 'Dark'}</button>;
}
```

### Problem: Form Inputs Not Accessible

**Symptom:** Screen readers can't identify inputs

**Solution:** Always use labels
```typescript
// WRONG: No label
<input type="text" placeholder="Email" />

// RIGHT: Associated label
<label htmlFor="email">Email</label>
<input id="email" type="text" placeholder="your@email.com" />

// OR: Wrapping label
<label>
  Email
  <input type="text" placeholder="your@email.com" />
</label>
```

## Dark Mode Support

**CSS Variables Approach**
```typescript
// app/root.tsx
export function Root() {
  return (
    <html className="light"> {/* or "dark" */}
      <head />
      <body>
        <Outlet />
      </body>
    </html>
  );
}

// tailwind.config.js
module.exports = {
  darkMode: 'class', // Use .dark class
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
      },
    },
  },
};

// app.css
:root.light {
  --color-background: 255 255 255;
  --color-foreground: 0 0 0;
}

:root.dark {
  --color-background: 0 0 0;
  --color-foreground: 255 255 255;
}

// Usage
<div className="bg-background text-foreground">
  Content adapts to theme
</div>
```

## Animation Best Practices

**Respect Reduced Motion**
```typescript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': {opacity: '0'},
          '100%': {opacity: '1'},
        },
      },
    },
  },
};

// Component
<div className="
  animate-fade-in
  motion-reduce:animate-none
  motion-reduce:opacity-100
">
  Content
</div>
```

## Related Resources

- Radix UI: https://www.radix-ui.com/primitives
- Tailwind CSS: https://tailwindcss.com/docs
- React Aria: https://react-spectrum.adobe.com/react-aria/
- Headless UI: https://headlessui.com/
- Lucide Icons: https://lucide.dev/
