# Source Code

This folder contains all application source code.

## Structure

```
src/
├── app/                      # Main application code
│   ├── components/           # React components
│   │   ├── ui/              # Reusable UI components (shadcn/ui)
│   │   ├── figma/           # Figma-specific components
│   │   ├── GlobalSearch.tsx # Global search component
│   │   └── Layout.tsx       # Main layout component
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Page components
│   │   ├── Dashboard.tsx    # Dashboard page
│   │   ├── Inventory.tsx    # Inventory management page
│   │   ├── Movements.tsx    # Stock movements page
│   │   └── Restock.tsx      # Restock alerts page
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   ├── App.tsx              # Root application component
│   └── routes.tsx           # Application routing
└── styles/                  # Global styles and themes
    ├── fonts.css            # Font imports
    ├── index.css            # Main stylesheet
    └── theme.css            # Theme variables and customizations
```

## Key Directories

### `/app/components/ui`
Reusable UI components from shadcn/ui. These are customizable components built on top of Radix UI primitives.

### `/app/pages`
Main page components for different sections of the application:
- Dashboard: Overview and statistics
- Inventory: Product management
- Movements: Stock entry/exit tracking
- Restock: Low stock alerts

### `/app/hooks`
Custom React hooks for shared functionality (e.g., theme management).

### `/app/utils`
Utility functions and helpers (e.g., localStorage management).

### `/styles`
Global styles, theme configurations, and font imports.
