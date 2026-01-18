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

playwright_tests() {
    write_log "Running the playwright tests..."
    # TODO
}

build_extension() {
    write_log "Building the extension"
    # TODO: wxt zip
}

detect_blue_argon() {
    write_log "Checking for Blue Argon violations"
}

# Pipeline
# TODO: print the version and maybe some other things as well

# formatter
# linter
# type_checker
# unit_tests