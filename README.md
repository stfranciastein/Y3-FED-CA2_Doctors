# Made with the Front-End Development Starter Code

This template provides a minimal setup to get started on CA2. It has Vite + React + ReactRouter + Tailwind CSS + ShadCN installed.

## Instructions:

1. Make a copy of this repo
2. Give the copy the name of your application e.g. `ca2-festivals-example`
3. Change the `name` property in `package.json` to your application name
4. `npm install`
5. `npx shadcn@latest init` // you only need to do this once
    - Select a base color
6. `npm run dev`

# Class Notes

1. Implement toast notifcations with the sonner library.
2. Call toast.success() with a success message after succesful operations (CRUD).
3. Call toast.error() with an error message in "catch" blocks.
4. Ensure the Toaster component is included in the main app's component to display the notifications.
5. ~~Make sure to import axios from the configured api instance for conssitent base URL usage and prevent repeating code.~~

# Prop Drilling

1. Instead of pasisng props down through multiple layers of components, just implement prop drilling.
2. I am currently using ForwardRef on cards so that the parent component can have access to the card's dom components.

# State Management

1. Redux Toolkit: popular state management library for React applications. Lets you create global states (like GlobalVariables in CreationKit / papyrus) that can be accessed in any other component without needing to pass it down through props. Useful for larger applications as it makes it hard to maintain state when your management needs become more complex.
2. RK Query