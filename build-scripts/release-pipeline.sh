#!/bin/bash
set -euo pipefail

write_log() {
    local LOG_PREFIX="[SOCKET_INSPECTOR]"
    echo "$LOG_PREFIX:$1"
}

write_separator() {
    echo "------------------------------"
}

formatter() {
    write_separator
    write_log "Running the formatter..."
    prettier --check --log-level warn .
    write_log "Formatting was successful ✅"
}

type_checker() {
    write_separator
    cd packages/extension
    write_log "Running the type checker..."
    tsc --noEmit
    write_log "Type checking was successful ✅"
}

formatter && type_checker
