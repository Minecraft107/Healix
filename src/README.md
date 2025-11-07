# Kerala Migrant Health App

A mobile app prototype for Kerala migrant workers to access health-related information. Built with React, TypeScript, and Tailwind CSS.

## Features

- Multi-language support (Malayalam, Hindi, English)
- User authentication with Aadhaar/mobile OTP and face scan
- Healthcare policies and schemes information
- Family member management
- Voice-guided navigation
- AI chatbot assistance

## Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Type checking:**
   ```bash
   npm run type-check
   ```

## VS Code Setup

This project is optimized for VS Code with the following recommended extensions:
- Tailwind CSS IntelliSense
- Prettier - Code formatter
- ESLint
- TypeScript and JavaScript Language Features

The workspace includes configured settings for auto-formatting, ESLint integration, and Tailwind CSS support.

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components (shadcn/ui)
│   └── figma/          # Figma-related components
├── styles/             # Global CSS styles
└── App.tsx            # Main application component
```

## Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling framework
- **Vite** - Build tool and dev server
- **Lucide React** - Icons
- **shadcn/ui** - UI component library