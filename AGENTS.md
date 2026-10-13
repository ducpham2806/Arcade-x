# ArcadeX Development Guidelines & Persisted Design Rules

## 1. Modal Sizing & Screen Space Utilization
- **Spacious, Full-Size Modals**: Modals and menus (such as Menu Tiện Ích, Hồ Sơ Game Thủ, Sổ Nhiệm Vụ, Cửa Hàng, Lò Rèn, BXH) must utilize the full screen on mobile (`w-full h-full`) and spacious fixed sizing on desktop (`sm:h-[92vh] sm:max-h-[900px] sm:max-w-4xl lg:max-w-5xl`).
- **No Unnecessary Scrolling**: Do NOT artificially restrict modal height (e.g., `max-h-[85vh]` bottom sheets with small inner heights) when there is plenty of screen estate. All menu items and actions should fit comfortably in view without requiring scrolling on standard screens.
- **Responsive Grid Scaling**: Use flexible grids (`grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`) with compact cards and balanced spacing so all utility buttons render cleanly on a single screen.

## 2. Modal Frame Stability & Tab Switching
- **Fixed Container Size**: Keep the outer container dimensions fixed across all tabs in the same modal.
- **Independent Scroll Areas**: Always wrap tab contents in `<div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">` with fixed header/footer so switching between tabs never causes layout jumping, resizing, or auto-scaling.

## 3. Gameplay Experience & Notifications
- **In-Game Non-Intrusive Toasts**: When a player levels up or earns rewards inside a game match, display a toast notification (`LevelUpToast`) instead of interrupting gameplay with a blocking modal. Full level-up celebration banners appear on the launcher screen.
- **Force Update Protection**: Force update modals must only appear when the user is on the launcher screen (`activeGameId === null`). Never block or interrupt an active game session.

