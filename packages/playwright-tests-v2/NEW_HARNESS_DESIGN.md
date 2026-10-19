# Playwright Test Harness
Design overview for an improved Playwright testing harness.

## Problem
The majority of the Playwright tests use `test-app-ui` as the host page, which connects to the websocket server in `test-app-server`. This current test harness has several issues.

### Cognitive Load
For example, `packages/playwright-tests/tests/extension.test.ts` we call `await hostPageModel.sendEchoMessage('HELLO');`. Later the tests call `assertTableMessages`, passing stringified messages such as `{"type":"EchoRequest","payload":{"message":"HELLO"}}`. Readers of this test will have no idea why this assertion is correct without having to dig into the source code of the test application.

Also, because the host page is a headed UI, we have to constantly call `.bringToFront()` to swap the test's focus back and forth between the chrome extension and the host page.

### Inflexibility
Testing new behaviors often means creating new UI elements in the harness and/or updating the server to support new messages. This doesn't scale well.

### Poor test/worker isolation
All tests share the same web server, meaning tests can impact other tests. I'm not sure if this actually happens today, but it would be nice to eliminate any possibility of this issue.

## Solution
We'll build a new test harness to address these issues. The harness should expose some API for the tests to more-directly manipulate both the client and server of the WebSocket connection, rather than relying on UI interactions the implicitly manipulate them.

## High Level Design
The harness will likely be a Playwright fixture or set of fixtures that starts a node.js server in the same process as Playwright.

The node server will serve the host page, which should be a very simple HTML document. This host page should embed some API in the `Window` that the harness can access to manipulate the client side of the connection (e.g. allow Playwright tests to send messages from the client). This "API" could just be a literal WebSocket instance, or perhaps something leaner.

The host page will open a WebSocket connection with the node server. So, the node server will handle regular http requests to serve the host page itself, and it will also accept websocket connections from the host page. The harness should allow Playwright tests to manipulate the server side of the connection (e.g. send messages from the server).

For MVP, we'll assume the server can have up to 1 client and no more

## Current Test Needs