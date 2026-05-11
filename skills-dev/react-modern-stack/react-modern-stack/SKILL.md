---
name: react-modern-stack
description: Generates React/TypeScript frontend boilerplate, including components, hooks, and services using Vite. Use this when you need to scaffold a new UI component, create a custom hook, or add a new service for API interaction.
---

# react-modern-stack

This skill ensures that all frontend code follows the project's TypeScript and React functional component standards.

## Key Features

*   **Atomic Components:** Scaffolding for standardized UI components.
*   **Custom Hooks:** Templates for data fetching and state management logic.
*   **TypeScript Safety:** Enforces proper prop typing and interface definitions.

## How to Use

### Creating a New Component

When the user asks to "create a new component called [Name]", follow these steps:

1.  Read `assets/component-template.tsx`.
2.  Replace `${COMPONENT_NAME}` with the provided name.
3.  Write the file to `src/components/ui/[Name]/[Name].tsx`.
4.  Optionally create an `index.ts` in the same folder for clean exports.

### Creating a Custom Hook

When the user asks to "create a custom hook for [Logic]", follow these steps:

1.  Read `assets/hook-template.ts`.
2.  Replace `${HOOK_NAME}` with the appropriate descriptive name.
3.  Write the file to `src/hooks/use[Name].ts`.

## Design Patterns

*   **Functional Components:** Always use `React.FC` with explicit prop interfaces.
*   **Styling:** Use `tailwind-merge` or a similar utility via the `cn` helper for class name concatenation.
*   **Project Structure:** Group components by feature or atomic level (ui, layouts, pages).
