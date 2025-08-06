# Running Conjugate Igbo on Windows

This guide will help you set up and run the Conjugate Igbo app on your Windows PC.

## Prerequisites

### 1. Install Node.js
- Download and install Node.js from [nodejs.org](https://nodejs.org/)
- Choose the LTS version (recommended)
- Verify installation by opening Command Prompt and running:
  ```
  node --version
  npm --version
  ```

### 2. Install Git (if not already installed)
- Download from [git-scm.com](https://git-scm.com/download/win)
- Use default installation options

### 3. Install Expo CLI
Open Command Prompt or PowerShell as Administrator and run:
```bash
npm install -g @expo/cli
```

## Setup Instructions

### 1. Clone and Setup Project
```bash
# Navigate to your desired directory
cd C:\your-projects-folder

# Clone the repository (if from git)
# git clone <repository-url>
# cd conjugate-igbo

# Or if you have the project folder already:
cd path-to-your-project

# Install dependencies
npm install
```

### 2. Install Expo Go App (for testing on phone)
- Download "Expo Go" from Google Play Store (Android) or App Store (iOS)
- Create an Expo account if you don't have one

### 3. Start the Development Server
```bash
npm run dev
```

This will:
- Start the Metro bundler
- Show a QR code in the terminal
- Open a web interface at http://localhost:8081

## Running the App

### Option 1: On Your Phone (Recommended)
1. Open Expo Go app on your phone
2. Scan the QR code shown in the terminal
3. The app will load on your phone

### Option 2: Web Browser
1. Press `w` in the terminal to open in web browser
2. The app will open at http://localhost:19006

### Option 3: Android Emulator (Advanced)
1. Install Android Studio
2. Set up an Android Virtual Device (AVD)
3. Start the emulator
4. Press `a` in the terminal to run on Android emulator

### Option 4: iOS Simulator (Mac only)
- iOS Simulator is only available on macOS

## Common Issues and Solutions

### Issue: "expo command not found"
**Solution:** Reinstall Expo CLI globally:
```bash
npm uninstall -g @expo/cli
npm install -g @expo/cli
```

### Issue: Port already in use
**Solution:** Kill the process using the port:
```bash
# Find process using port 19000 or 19006
netstat -ano | findstr :19000
# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Issue: Metro bundler fails to start
**Solution:** Clear cache and restart:
```bash
npx expo start --clear
```

### Issue: Dependencies installation fails
**Solution:** Clear npm cache and reinstall:
```bash
npm cache clean --force
rm -rf node_modules
rm package-lock.json
npm install
```

### Issue: "Unable to resolve module"
**Solution:** Reset Metro cache:
```bash
npx expo start --clear
```

## Development Tips

### Hot Reloading
- Changes to your code will automatically reload the app
- If hot reloading stops working, shake your phone and tap "Reload"

### Debugging
- Shake your phone in Expo Go to open developer menu
- Enable "Debug Remote JS" to use Chrome DevTools
- Use `console.log()` statements to debug

### File Structure
```
conjugate-igbo/
├── app/                 # App screens and navigation
│   ├── (tabs)/         # Tab-based screens
│   └── _layout.tsx     # Root layout
├── components/         # Reusable components
├── hooks/             # Custom React hooks
├── data/              # Static data and types
├── lib/               # Utility functions
└── assets/            # Images and other assets
```

## Next Steps

1. **Test the app**: Make sure it loads properly on your phone or browser
2. **Explore the code**: Start with `app/(tabs)/index.tsx` for the main practice screen
3. **Make changes**: Try modifying some text to see hot reloading in action
4. **Add features**: The app is set up for easy expansion

## Getting Help

If you encounter issues:
1. Check the terminal for error messages
2. Try the solutions in the "Common Issues" section above
3. Restart the development server with `npx expo start --clear`
4. Make sure your phone and computer are on the same WiFi network

## Building for Production

When ready to build for app stores:
```bash
# For Android
npx expo build:android

# For iOS (requires Mac)
npx expo build:ios
```

Note: Building for app stores requires an Expo account and additional configuration.