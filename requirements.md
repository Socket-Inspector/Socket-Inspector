The ClearDevtools packet should ALWAYS be sent before the socket constructor is patched

ALL packets sent from the MAIN script need to be relayed to the ESW

ALL packets sent from the ESW need to be relayed to the MAIN script

Playwright test ideas:
- test that checks the DOM to make sure MAIN script is first