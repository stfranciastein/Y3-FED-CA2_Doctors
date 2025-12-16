///////////////////////
/// Notes for implementing toast notifications ///
///////////////////////

// - Import the toast function from the sonner library
// - Call toast.success() with a success message after successful operations (create, update, delete)
// - Optionally, call toast.error() with an error message in catch blocks
// - Ensure the Toaster component is included in the main application component to display the notifications
// - Make sure to import axios from the configured api instance for consistent base URL usage

///////////////////////
/// Prop Drilling ///
///////////////////////

// Instead of passing down props through multiple layers of components, you can simply implement prop drilling.
// You do this by passing props DIRECTLY to the components that need them, rather than making them pass through several layers of other components.
// This keeps your code cleaner and much easier to maintain.
// ForwardRef is a technique in React that allows you to pass a ref through a component to one of its children, propdrilling is a similar concept but for props.

///////////////////////
/// State Management ///
///////////////////////

// Redux Toolkit
// Redux is the more popular state management libraries for React Applications.
// It allows you to create global states (kind of like GlobalVariables in Creation Kit) that can be accessed from any other component without needing to pass it down through props.
// This is recommended and very useful for larger applications as it makes it hard to maintain state when you have more complex state management needs.
// www.redux.js.org

// RTK Query //
// A data fetching and caching tool built on top of the Redux Toolkit.
// It simplifies the process of fetching, caching and managing server state in react applications.
// www.redux.js.org/rtk-query/overview

// Auth Provider
// This is another way you can manage authentication for your app instead of prop drilling or using Redux.
// You create an AuthProvider component that uses React Context to provide authentication state and functions to all components in the app.

// Step 1: Create a provider component that holds the authentication logic and state: UseAuth.js
// Step 2: Wrap your main application component with the AuthProvider in your main entry file (e.g., index.js or App.jsx)
// Step 3: Use the useAuth hook in any component that needs access to authentication state or functions.

// This method is simpler than Redux and is suitable for small to medium-sized applications.
// It avoids the complexity of Redux while still providing a clean way to manage authentication state globally.

///////////////////////
/// Form validation ///
///////////////////////

// HTMLFOR // 
// A lightweight library for form validation in React applications.
// It provides a simple way to validate form inputs and manage form state.
// www.npmjs.com/package/htmlfor


// Valid inputs //
// Enforce this with HTML attributes on top of using a validation library.
// Use aria-labbels for the inputs for better accessibility for screen readers.
// When displaying errors, make sure to link them to the inputs using aria-describedby attribute.
// Some fields if needed can have multiple errors, in that case make sure to list them all in the error message container.


// React hook form //
// A popular library for managing form state and validation in React applications.
// It provides a simple and efficient way to handle forms with minimal re-renders.
// www.react-hook-form.com