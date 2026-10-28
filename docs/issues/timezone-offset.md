# Deferred: reported one-hour timezone offset

Public tracker: [GitHub issue #1](https://github.com/abhikmp/claudebuddy-chrome-ext/issues/1). Status: needs-info. Priority: after the ClaudeBuddy 1.0.0 release. This issue does not block release, per the publisher's 28 October 2026 decision.

One Store reviewer reported a one-hour difference despite the automatically chosen timezone appearing correct; choosing a zone farther east matched their expectation. The selected IANA timezone, actual/expected display, observation date and Chrome version are unknown. Obtain these details before assigning a cause or applying a correction.

The production worker uses `America/Los_Angeles` for weekday 05:00–11:00 Pacific, and the popup uses `Intl.DateTimeFormat` for the saved display timezone. Earlier Node/ICU replay found no next-peak mismatch across 8,760 UTC hours in 2026. Published/current regional worker-to-popup comparisons passed 12,384 cases covering India, Croatia, mainland Spain/Ceuta and the Canary Islands around European and Pacific DST changes. These checks did not reproduce the reviewer's browser or automatic timezone detection.

A separate latent helper defect is reproducible: `ptWallClockToUTC(2026, 3, 8, 5)` round-trips to 06:00 Pacific, and `(2026, 11, 1, 5)` to 04:00. The helper samples the offset before the DST transition and applies one correction. Both dates are Sundays, which the peak scheduler skips. This has not been established as the cause of the reviewer's symptom.

- [ ] Obtain the selected timezone, displayed/expected times and observation date; Chrome version if needed.
- [ ] Reproduce the reported case through production scheduling and popup formatting.
- [ ] Correct the demonstrated cause without a blanket one-hour adjustment.
- [ ] Evaluate the transition-Sunday helper defect separately and cover relevant Pacific/European DST boundaries plus the regions above.
- [ ] Record the confirmed cause, regression results and remaining limitations before closing.

The original local investigation and diagnostic captures remain in ignored `.scratch/timezone-offset/`. No production timezone change is included in this release.
