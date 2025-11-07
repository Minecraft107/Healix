# VS Code Migration Guide

This guide will help you migrate your existing Kerala Migrant Health App to work seamlessly with VS Code.

## Quick Setup Steps

1. **Copy all files to the new structure:**
   ```bash
   # Create the src directory structure
   mkdir -p src/components/ui src/components/figma src/guidelines
   
   # Copy components to src
   cp -r components/* src/components/
   cp -r styles src/
   cp -r guidelines src/
   
   # Move App.tsx to src (already created)
   # The new App.tsx is already in /src/App.tsx
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

## File Structure Changes

### Before (Current):
```
├── App.tsx
├── components/
├── styles/
└── guidelines/
```

### After (VS Code Ready):
```
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── components/
│   ├── styles/
│   └── guidelines/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── index.html
```

## What's Been Added

1. **package.json** - Defines dependencies and scripts
2. **tsconfig.json** - TypeScript configuration
3. **vite.config.ts** - Vite build tool configuration
4. **index.html** - Entry point HTML file
5. **src/main.tsx** - React app entry point
6. **.vscode/** - VS Code workspace settings
7. **.eslintrc.cjs** - ESLint configuration

## Key Features Added

### Development Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run type-check` - Check TypeScript types
- `npm run lint` - Run ESLint

### VS Code Integration
- Auto-formatting on save
- Tailwind CSS IntelliSense
- TypeScript support
- ESLint integration
- Path intellisense

### Recommended VS Code Extensions
The `.vscode/extensions.json` file will prompt you to install:
- Tailwind CSS IntelliSense
- Prettier - Code formatter
- ESLint
- TypeScript support
- Auto Rename Tag
- Path IntelliSense

## Import Path Updates Needed

You'll need to update some import paths in your components:

### UI Components
Change from:
```typescript
import { Button } from './ui/button';
```

To (if using path aliases):
```typescript
import { Button } from '@/components/ui/button';
```

Or keep relative paths (no changes needed):
```typescript
import { Button } from './ui/button';
```

## Manual Steps Required

1. **Copy all component files** from `/components/` to `/src/components/`
2. **Copy styles** from `/styles/` to `/src/styles/` (already done)
3. **Copy guidelines** from `/guidelines/` to `/src/guidelines/`
4. **Remove old files** in root directory once everything is working

## Verification Steps

1. Run `npm run dev` and check if the app loads
2. Test all navigation flows
3. Verify all components render correctly
4. Check TypeScript compilation with `npm run type-check`
5. Run linting with `npm run lint`

## Benefits of This Setup

1. **Better IntelliSense** - Full TypeScript and Tailwind support
2. **Hot Module Replacement** - Faster development with Vite
3. **Consistent Formatting** - Prettier integration
4. **Type Safety** - Full TypeScript configuration
5. **Modern Build** - Optimized production builds
6. **VS Code Optimized** - Workspace settings for better DX

## Troubleshooting

If you encounter issues:

1. **Import errors**: Check file paths and ensure all files are copied to src/
2. **TypeScript errors**: Run `npm run type-check` to identify issues
3. **Build errors**: Check console output and ensure all dependencies are installed
4. **Missing files**: Verify all components are copied to the correct locations

Once you've completed the migration, you'll have a professional VS Code-ready React project with all modern development tools configured!