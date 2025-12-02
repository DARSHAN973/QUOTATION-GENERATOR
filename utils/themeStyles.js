// Theme-aware utility classes for consistent styling across light and dark modes
// This ensures the application maintains a professional look regardless of user's OS theme preference

// Base container styles - light background that adapts to theme
export const containerStyles = {
  primary: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
  secondary: "bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700",
  card: "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700",
  panel: "bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
};

// Text styles that work in both light and dark modes
export const textStyles = {
  primary: "text-gray-900 dark:text-gray-100",
  secondary: "text-gray-600 dark:text-gray-400",
  muted: "text-gray-500 dark:text-gray-500",
  accent: "text-blue-600 dark:text-blue-400"
};

// Input styles that remain visible and functional in both modes
export const inputStyles = {
  base: "w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent",
  select: "w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent",
  readonly: "w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100",
  textarea: "w-full p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
};

// Button styles
export const buttonStyles = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white",
  secondary: "bg-gray-600 hover:bg-gray-700 text-white",
  success: "bg-green-600 hover:bg-green-700 text-white",
  warning: "bg-yellow-600 hover:bg-yellow-700 text-white",
  danger: "bg-red-600 hover:bg-red-700 text-white",
  outline: "text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
};

// Status and alert styles
export const statusStyles = {
  success: "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200",
  error: "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200",
  warning: "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200",
  info: "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200"
};

// Table styles
export const tableStyles = {
  header: "border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800",
  cell: "border border-gray-400 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100",
  row: "border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50",
  headerCell: "text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300"
};

// Sidebar styles
export const sidebarStyles = {
  container: "w-64 h-screen bg-slate-900 text-white border-r border-slate-700",
  activeTab: "bg-blue-600 text-white shadow-lg",
  inactiveTab: "text-slate-300 hover:bg-slate-800 hover:text-white"
};

// Form label styles
export const labelStyles = {
  base: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",
  required: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 after:content-['*'] after:text-red-500"
};

// Helper function to combine theme styles
export const combineStyles = (...styles) => {
  return styles.filter(Boolean).join(' ');
};