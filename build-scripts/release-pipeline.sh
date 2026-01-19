#!/bin/bash
set -euo pipefail

BUILD_PATH="packages/extension/.output/chrome-mv3"

# Helpers
write_log() {
    local LOG_PREFIX="[SOCKET_INSPECTOR]"
    echo "$LOG_PREFIX:$1"
}

write_separator() {
    echo "------------------------------"
}

# Pipeline functions
formatter() {
    write_log "Running the formatter..."
    prettier --check --log-level warn .
    write_log "Formatting successful ✅"
}

linter() {
    write_log "Running the linter..."
    pnpm --filter socket-inspector lint
    write_log "Linting successful ✅"
}

type_checker() {
    write_log "Running the type checker..."
    pnpm --filter socket-inspector prepare
    pnpm --filter socket-inspector compile
    write_log "Type checking successful ✅"
}

unit_tests() {
    write_log "Running the unit tests..."
    pnpm --filter socket-inspector test:unit
    write_log "Unit tests successful ✅"
}

playwright_tests() {
    write_log "Running the playwright tests..."
    pnpm --filter socket-inspector build:mock > /dev/null
    pnpm --filter playwright-tests test:ci
    write_log "Playwright tests successful ✅"
}

build_extension_prod() {
    write_log "Building the extension"
    pnpm --filter socket-inspector zip
    write_log "Extension build successful ✅"
}

detect_blue_argon() {
    write_log "Checking for Blue Argon violations"
    local BANNED_STRING="cdn.jsdelivr.net"
    if [[ ! -d "$BUILD_PATH" ]]; then
        write_log "Error: built extension not found at $BUILD_PATH"
        exit 1
    fi
    if grep -rin "$BANNED_STRING" "$BUILD_PATH"; then
        write_log "🚨🚨 Blue Argon violation detected 🚨🚨"
        exit 1
    fi
    write_log "No Blue Argon violations detected ✅"
}

print_build_success() {
    local MANIFEST_PATH="$BUILD_PATH/manifest.json"
    if [[ ! -f  "$MANIFEST_PATH" ]]; then
        write_log "Error: no manifest found at $MANIFEST_PATH"
    fi
    local VERSION
    VERSION=$(jq -r '.version' "$MANIFEST_PATH")
    echo "Successfully built Socket Inspector version $VERSION 🎉"
}

# Pipeline

formatter
write_separator

linter
write_separator

type_checker
write_separator

unit_tests
write_separator

playwright_tests
write_separator

build_extension_prod
write_separator

detect_blue_argon
write_separator

print_build_success