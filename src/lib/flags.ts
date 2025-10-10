export const flags = {
  // Controls visibility and behavior of Title Bar options in the UI
  enableTitleBarOptions:
    (import.meta.env.VITE_ENABLE_TITLE_BAR as string | undefined)?.toLowerCase() === 'true',
} as const;
