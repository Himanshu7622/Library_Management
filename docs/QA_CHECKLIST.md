# Windows Startup Error QA Checklist

This checklist validates that the Library Management System handles startup errors gracefully on Windows.

## Environment Setup

### Pre-Test Requirements
- [ ] Windows 10 or 11 machine
- [ ] Node.js 24.11.0 installed
- [ ] Git Bash installed
- [ ] Visual Studio 2022 NOT installed (to test compilation failure)
- [ ] Clean repository clone

## Test Scenarios

### 1. Fresh Install with Node.js 24 (Expected Error)

**Steps:**
1. Clone repository: `git clone <repo-url>`
2. Navigate to directory: `cd Library_Management`
3. Run: `npm install`

**Expected Results:**
- [ ] Postinstall script runs and displays Node.js 24+ warning
- [ ] better-sqlite3 compilation fails with "C++20 or later required" error
- [ ] Error message is clearly visible in npm install output
- [ ] Instructions for Windows setup are displayed
- [ ] installation completes but with native module failure

**Verification:**
```bash
# Check that npm install completes despite errors
npm install

# Check that node_modules exists
test -d node_modules && echo "node_modules created"

# Check that better-sqlite3 exists but no .node file
test -d node_modules/better-sqlite3 && echo "better-sqlite3 installed"
test ! -f node_modules/better-sqlite3/lib/binding.node && echo "No compiled binary found"
```

### 2. Application Startup (Expected Error UI)

**Steps:**
1. Run: `npm run dev`
2. Wait for loading screen

**Expected Results:**
- [ ] Loading screen appears: "Loading Library Management System..."
- [ ] After 10 seconds, error UI appears (NOT infinite loading)
- [ ] Error UI shows "Application Startup Failed" title
- [ ] Error details display the compilation error
- [ ] Windows-specific fix instructions are shown
- [ ] "Retry" button is available
- [ ] "Copy Error Details" button works
- [ ] "Open Logs Folder" button works

**Verification:**
- [ ] No infinite loading spinner
- [ ] Error appears within 10 seconds
- [ ] Error log file created at `%APPDATA%\Library Management System\startup-error.log`
- [ ] Error log contains proper error details and system info

### 3. Error UI Functionality

**Test Copy Error Details:**
- [ ] Click "Copy Error Details" button
- [ ] Button text changes to "Copied!" temporarily
- [ ] Error details are copied to clipboard
- [ ] Can paste and verify copied content

**Test Open Logs Folder:**
- [ ] Click "Open Logs Folder" button
- [ ] File dialog opens to correct location
- [ ] Can see startup-error.log file

**Test Show Technical Details:**
- [ ] Click "Show Technical Details" link
- [ ] Stack trace appears in expandable section
- [ ] Click again to hide technical details

**Test Retry:**
- [ ] Click "Retry" button
- [ ] Error UI disappears
- [ ] Loading screen appears again
- [ ] After 10 seconds, error UI reappears

### 4. Report Issue Link

**Steps:**
- [ ] Click "Report Issue" link
- [ ] Browser opens to GitHub issues page (or local equivalent)

### 5. Node.js 20 LTS Compatibility (Expected Success)

**Setup:**
1. Install Node.js 20 LTS (using nvm or installer)
2. Switch to Node.js 20: `nvm use 20`
3. Clean install: `rd /s /q node_modules` && `del package-lock.json`
4. Reinstall: `npm install`

**Expected Results:**
- [ ] better-sqlite3 installs successfully
- [ ] No compilation errors
- [ ] Postinstall shows Node.js version check
- [ ] Application starts successfully
- [ ] No error UI appears

**Verification:**
```bash
# Verify better-sqlite3 binary exists
test -f node_modules/better-sqlite3/lib/binding.node && echo "Binary compiled successfully"

# Test application startup
npm run dev
# Should reach login screen without errors
```

### 6. Visual Studio 2022 Build (Expected Success)

**Setup:**
1. Install Visual Studio 2022 Community
2. Include "C++ desktop development" workload
3. Open "x64 Native Tools Command Prompt for VS 2022"
4. Set environment: `set GYP_MSVS_VERSION=2022`
5. Clean install: `rd /s /q node_modules` && `del package-lock.json`
6. Run: `npm install`

**Expected Results:**
- [ ] better-sqlite3 compiles successfully
- [ ] No compilation errors
- [ ] Application starts successfully
- [ ] Works in Native Tools Command Prompt

### 7. Git Bash vs Native Tools Command Prompt

**Git Bash Test:**
- [ ] Git operations work: `git status`, `git add`, `git commit`
- [ ] `npm install` may fail with compilation errors
- [ ] `npm run dev` shows error UI (if compilation failed)

**Native Tools Command Prompt Test:**
- [ ] `vcvars64.bat` runs without errors
- [ ] `set GYP_MSVS_VERSION=2022` works
- [ ] `npm install` succeeds with Visual Studio 2022
- [ ] `npm run dev` works successfully

### 8. Error Log Validation

**Check Error Log File:**
1. Navigate to `%APPDATA%\Library Management System\`
2. Open `startup-error.log`
3. Verify contents:

**Expected Log Format:**
```json
{
  "phase": "DATABASE_INITIALIZATION",
  "error": "C++20 or later required.",
  "stack": "Error: C++20 or later required.\n    at ...",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "platform": "win32",
  "nodeVersion": "v24.11.0",
  "arch": "x64"
}
```

**Verification:**
- [ ] Log file created automatically
- [ ] All required fields present
- [ ] Timestamp is valid ISO format
- [ ] Platform, node version, and arch are correct
- [ ] Error message is meaningful

## Automated Tests

### Jest Tests
Run the startup error tests:
```bash
npm test -- tests/startup-error.test.js
```

**Expected Results:**
- [ ] All tests pass
- [ ] Error handling logic is tested
- [ ] Timeout behavior is verified
- [ ] Error UI component logic is validated

## Performance Tests

### Startup Time
- [ ] Error UI appears within 10 seconds of startup
- [ ] No infinite loading scenarios
- [ ] Memory usage remains reasonable during error state

### Error Recovery
- [ ] Retry button functionality works
- [ ] Multiple retry attempts don't cause memory leaks
- [ ] Error details remain accurate across retries

## Accessibility Tests

### Error UI Accessibility
- [ ] All interactive elements are keyboard accessible
- [ ] Screen reader reads error messages properly
- [ ] High contrast mode works correctly
- [ ] Font scaling doesn't break layout

## Cross-Platform Validation

### Windows Versions
- [ ] Windows 10 (1903+)
- [ ] Windows 11
- [ ] Both x64 and ARM64 architectures

### Build Tool Variations
- [ ] Visual Studio 2019 (should show C++20 error)
- [ ] Visual Studio 2022 (should work)
- [ ] Build Tools vs Full IDE
- [ ] Different Windows SDK versions

## Documentation Validation

### README Instructions
- [ ] Windows setup guide is accurate
- [ ] All command examples work as documented
- [ ] Error messages match documentation
- [ ] Troubleshooting section covers encountered issues

### Postinstall Script
- [ ] Runs automatically after `npm install`
- [ ] Displays correct warnings for Node.js 24
- [ ] Provides actionable guidance
- [ ] Doesn't break installation process

## Final Validation

### Complete User Journey
1. **Fresh user with Node.js 24**: Should see helpful error UI and clear instructions
2. **User follows instructions**: Should be able to resolve issues and run app
3. **User with Node.js 20**: Should have smooth experience
4. **User with VS 2022**: Should be able to build successfully

### Error Handling Robustness
- [ ] No infinite loading scenarios
- [ ] Clear error messages with actionable steps
- [ ] Proper fallback behavior
- [ ] Error logging for debugging
- [ ] User-friendly error recovery options

---

**Testing Checklist Completion:**
- [ ] All scenarios tested
- [ ] All verifications completed
- [ ] Documentation validated
- [ ] Automated tests passing
- [ ] Accessibility confirmed
- [ ] Performance acceptable
- [ ] Cross-platform compatibility verified

**Result: Application handles Windows startup errors gracefully without hanging indefinitely.**