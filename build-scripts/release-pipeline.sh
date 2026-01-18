#!/bin/bash
set -euo pipefail

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
    write_separator
    write_log "Running the formatter..."
    prettier --check --log-level warn .
    write_log "Formatting successful ✅"
}

linter() {
    write_separator
    write_log "Running the linter..."
    pnpm --filter socket-inspector lint
    write_log "Linting successful ✅"
}

type_checker() {
    write_separator
    write_log "Running the type checker..."
    pnpm --filter socket-inspector compile
    write_log "Type checking successful ✅"
}

unit_tests() {
    write_separator
    write_log "Running the unit tests..."
    pnpm --filter socket-inspector test:unit
    write_log "Unit tests successful ✅"
}

# TODO: may need to run the dev server in the background and then run tests in the foreground
playwright_tests() {
    write_log "Running the playwright tests..."
}

build_extension() {
    write_log "Building the extension"
    pnpm --filter socket-inspector zip
    write_log "Extension build successful ✅"
}

detect_blue_argon() {
    write_log "Checking for Blue Argon violations"
    local BANNED_STRING="cdn.jsdelivr.net"
    local BUILD_PATH="packages/extension/.output/chrome-mv3"
    if grep -rin "$BANNED_STRING" "$BUILD_PATH"; then
        echo "🚨🚨 Blue Argon violation detected 🚨🚨"
        exit 1
    fi
    write_log "No Blue Argon violations detected ✅"
}

# Pipeline

formatter
linter
type_checker
unit_tests
build_extension
detect_blue_argon

# TODO: print extension version from manifest.json as MVP