# Contributing to Beatyx

Thank you for contributing! To maintain a high standard of code quality and organization, please follow these guidelines.

## Directory Structure

We use a **Feature-Based Architecture**. All new features or major components should be placed in the `src/features` directory.

### Feature Folder Template

```text
src/features/<feature-name>/
├── index.js          # The "Barrel" file (public API)
├── <FeatureName>.jsx # Main component
├── <SubComponent>.jsx
├── <featureName>Service.js # API logic for this feature
└── <FeatureName>.css  # Feature-specific styles
```

> [!IMPORTANT]
> **No Asset/Util Sprawl:** CSS and API logic specifically tied to a feature **must** live inside the feature folder, not in global `assets` or `utils` directories.

## Naming Conventions

- **React Components:** `PascalCase.jsx` (e.g., `Player.jsx`, `TrackLineCard.jsx`).
- **Styles:** `PascalCase.css` matching the component (e.g., `Player.css`).
- **Services/Helpers:** `camelCase.js` (e.g., `authService.js`, `useThrottle.js`).
- **Directories:** `kebab-case` for general folders, but feature folders often use the feature name (e.g., `features/player`).

## Import Rules

### Absolute Paths

We use path aliases to avoid "prop drilling" and messy relative paths. Always use the `@/` alias which points to the `src` directory.

**Correct:**

```javascript
import { Player } from "@/features/player";
import { userService } from "@/services/userService";
```

**Incorrect:**

```javascript
import { Player } from "../../features/player/Player";
```

### The "Barrel" Rule

Never import directly from internal feature files if a barrel (`index.js`) exists. This ensures a clean public API for each module.

**Correct:**

```javascript
import { PlayerProvider } from "@/features/player";
```

**Incorrect:**

```javascript
import { PlayerProvider } from "@/features/player/PlayerContext";
```

## How to Verify Your Changes

Before submitting a Pull Request, ensure your code passes our quality checks.

### Manual Verification

Run the following commands in the `client` (or root, if configured) directory:

```bash
# Run ESLint to check for code standards and errors
npm run lint

# Run Prettier to check/fix formatting (if configured)
npm run format
```

### Automated Hooks (Husky)

We use **Husky** with **lint-staged**.

- **What it does:** When you run `git commit`, Husky triggers a pre-commit hook that runs `lint-staged`.
- **Why:** This automatically runs linting and formatting on your _staged files only_, ensuring that no poorly formatted or broken code enters the repository. If linting fails, the commit will be blocked until you fix the issues.
