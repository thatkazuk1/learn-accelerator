# Netwright Demo Bundle

The public demo is available at [learn.kazuki.uk](https://learn.kazuki.uk).

The compiled browser game can also be served as a static site. The entry point
is `apps/web/dist/index.html`; do not open it as a `file://` page. No application
server, account, API key, or database is required.

For a local preview, use `pnpm build` followed by `pnpm preview`. A public demo
must use HTTPS. An unencrypted LAN URL does not support offline installation.

## Offline And Updates

Wait for "Ready for offline play" before disconnecting. Browser cache eviction
can remove the downloaded game. External source links require internet.

Upload all files together when updating. Serve `sw.js` and `index.html` with
revalidation (`Cache-Control: no-cache`); hashed files under `assets/` can use
long immutable caching. Close tabs using an old version and reopen to activate
an installed update.

## Progress And Privacy

Progress and written explanations are stored in this browser, under the
website's origin. A different hostname or port has different saves. Nothing
is submitted to an application backend; a hosting provider may still log
ordinary page requests.

When browser storage is blocked, play continues for the current page session.
The interface reports that progress is not saved. Reloading loses that session.

## Suggested Test

Build the first network, try a prediction, then show the dashboard and later
missions. Reload to check progress, then disconnect the browser and repeat.
Use the accompanying demo script for the submission recording.
