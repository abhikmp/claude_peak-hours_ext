# The Active account changes on the first Usage reading from a different Account

The Active account is the Account that produced the most recent Usage reading, and it only changes when a different Account produces one. Logging in to another account does not change it until that account's first message is sent, so there is a short lag after login in which the popup and toolbar icon still show the previous account. We accepted the lag because the UUID in the `/completion` URL is unambiguous, whereas guessing the current Account from organization requests made on page load can pick the wrong organization when a login has several.

The Active account is always page 1 of the popup and drives the icon color, even at 100% usage. When another Account takes over, the previous one is re-sorted: Full accounts go after all others, soonest reset first; the rest stay ordered by most recently used.

## Considered Options

- Detect the switch at login from page-load organization requests: rejected for the mis-detection risk above. Revisit if the lag proves annoying.
