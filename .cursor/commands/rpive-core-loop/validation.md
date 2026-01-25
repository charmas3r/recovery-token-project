# Validation Command

Run a full validation suite: lint checks, unit tests with coverage, and production build.

---

## TODO: Configure for Your Component

> **Fill out this section before using this command.**

| Field | Value |
|-------|-------|
| **Component Type** | `[ ] Android` `[ ] iOS` `[ ] Web` `[ ] Backend` `[ ] Other: _____` |
| **Language/Framework** | _e.g., Kotlin, Swift, TypeScript/React, Go, Python/Django_ |
| **Lint Command** | _e.g., `./gradlew lint`, `swiftlint`, `npm run lint`, `golangci-lint run`_ |
| **Type Check Command** | _e.g., `npx tsc --noEmit`, N/A for dynamic languages_ |
| **Test Command** | _e.g., `./gradlew test`, `xcodebuild test`, `npm run test`, `go test ./...`_ |
| **Coverage Command** | _e.g., `./gradlew jacocoTestReport`, `npm run test -- --coverage`_ |
| **Build Command** | _e.g., `./gradlew assembleRelease`, `xcodebuild`, `npm run build`, `go build`_ |
| **Build Output Directory** | _e.g., `app/build/`, `dist/`, `build/`, `bin/`_ |

### Component-Specific Notes

_Add any component-specific validation requirements here:_
- _Required environment variables_
- _Simulator/emulator requirements_
- _Signing/certificate requirements_
- _Additional validation steps_

---

## Instructions

Execute the following validation steps in order. Stop and report any failures.

> **Note:** The commands below are examples for a TypeScript/Next.js web project. Replace them with the appropriate commands from your TODO configuration above.

### 1. Lint Checks

Run the linter to check for code quality issues:

```bash
# Web (npm/yarn)
npm run lint

# Android (Gradle)
./gradlew lint

# iOS (SwiftLint)
swiftlint

# Backend - Go
golangci-lint run

# Backend - Python
ruff check . && mypy .
```

Check your project's configuration for the exact lint command.

Report any lint errors or warnings found. For errors, list the file, line number, and issue.

### 2. Type Checking

Run static type checking (if applicable):

```bash
# Web (TypeScript)
npx tsc --noEmit

# Android (Kotlin) - handled by compile step
./gradlew compileDebugKotlin

# iOS (Swift) - handled by compile step
xcodebuild -project MyApp.xcodeproj -scheme MyApp -destination 'generic/platform=iOS' build

# Backend - Go (handled by build)
go build ./...

# Backend - Python
mypy .
```

Report any type errors found with file locations and error messages. Note: Some languages handle type checking during compilation.

### 3. Unit Tests with Coverage

Run the test suite with coverage reporting:

```bash
# Web - Vitest
npm run test -- --coverage

# Web - Jest
npm run test -- --coverage --coverageReporters="text" --coverageReporters="text-summary"

# Android (Gradle + JaCoCo)
./gradlew test jacocoTestReport

# iOS (xcodebuild)
xcodebuild test -project MyApp.xcodeproj -scheme MyApp -destination 'platform=iOS Simulator,name=iPhone 15' -enableCodeCoverage YES

# Backend - Go
go test -coverprofile=coverage.out ./... && go tool cover -func=coverage.out

# Backend - Python (pytest)
pytest --cov=. --cov-report=term-missing
```

**Coverage Report Requirements:**
- Display the coverage summary table showing:
  - Statement coverage %
  - Branch coverage %
  - Function coverage %
  - Line coverage %
- List any files with coverage below 80%
- Report total number of tests run, passed, failed, and skipped

### 4. Production Build

Build the application for production/release:

```bash
# Web (Next.js)
npm run build

# Web (Vite/React)
npm run build

# Android (Release APK/AAB)
./gradlew assembleRelease
# or for App Bundle:
./gradlew bundleRelease

# iOS (Archive)
xcodebuild -project MyApp.xcodeproj -scheme MyApp -configuration Release -archivePath build/MyApp.xcarchive archive

# Backend - Go
go build -o bin/app ./cmd/app

# Backend - Python (check syntax/imports)
python -m py_compile $(find . -name "*.py" -not -path "./venv/*")
```

**Platform-Specific Notes:**
- **Web (Next.js):** Ensure `next.config.js` has `distDir: 'dist'` if outputting to `dist/`
- **Android:** Check signing configuration in `build.gradle`
- **iOS:** Ensure provisioning profiles and certificates are configured
- **Backend:** Verify all environment variables are set for production

Report:
- Build success/failure status
- Any build warnings
- Final bundle/binary size summary (if available)

## Output Summary

After all steps complete, provide a summary:

```
## Validation Results

### Lint
- Status: ✅ Pass / ❌ Fail
- Errors: [count]
- Warnings: [count]

### Type Check
- Status: ✅ Pass / ❌ Fail
- Errors: [count]

### Tests
- Status: ✅ Pass / ❌ Fail
- Total: [count]
- Passed: [count]
- Failed: [count]
- Skipped: [count]

### Coverage
- Statements: [%]
- Branches: [%]
- Functions: [%]
- Lines: [%]

### Build
- Status: ✅ Pass / ❌ Fail
- Output: [build output directory]
- Warnings: [count]
```

## Failure Handling

If any step fails:
1. Report the specific failure with details
2. Continue to subsequent steps if possible (except build, which requires lint/type check to pass)
3. Mark overall validation as failed in the summary
