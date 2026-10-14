// Apollo's dev-only devtools hint arms a 10 s timer per client that can fire after a spec's jsdom is gone.
(globalThis as { __DEV__?: boolean }).__DEV__ = false;
