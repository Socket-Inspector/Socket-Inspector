# Design Issues With Test Harness

I dislike that `hostPage.ts` has a function named 'openHostPage', which is the exact same name as the function exposed to the tests in the `Harness` type.

The hostPage.ts openHostPage() function (and dependencies) does too much 'mixing' of 'high-level' and 'low-level' code