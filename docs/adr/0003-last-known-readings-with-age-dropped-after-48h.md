# Show last-known readings with their age, and drop Accounts after 48 hours

Historical: superseded by [ADR-0004](0004-remember-accounts-and-show-observed-usage.md). Current production retains Accounts until Forget/reset and distinguishes observed, estimated and unknown usage. The text below records the earlier decision.

Readings only arrive when an Account sends a message, so every Account except the Active one is showing old data. Rather than hiding it, the popup shows each Account's last-known reading with how long ago it was captured. A reading whose reset time has passed is shown as "Full quota available" (an Expired reading), since the quota has reset by definition. An Account with no reading for 48 hours is forgotten automatically, checked by the existing 30-second alarm and when the popup opens. "Reset to default" forgets all Accounts. There is no per-account "forget" control.

## Considered Options

- Hide Accounts that haven't been seen recently: rejected, it hides exactly the information the user wants when deciding where to message next.
- A manual "forget" control per Account: rejected in favour of the 48-hour auto-drop, which adds no UI.
