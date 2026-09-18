# 🧠 PlanetPulse — Design & Technical Decisions

## 1. Why PlanetPulse?

We chose to build a carbon footprint tracker because everyday activities such as transportation, electricity usage, and food choices contribute to environmental impact, but their impact is often difficult for users to visualize.

PlanetPulse converts these everyday activities into understandable CO₂ numbers and visual comparisons.

---

## 2. Why Vanilla HTML, CSS and JavaScript?

We chose HTML, CSS and Vanilla JavaScript because:

- The project needed to be lightweight.
- No complex framework was required for the MVP.
- The application can run directly in a browser.
- It is easy to deploy using GitHub Pages.
- The core functionality can be implemented without a backend.

This also keeps the project simple and easy to maintain.

---

## 3. Why Fixed Emission Factors?

For this MVP, we use fixed emission factors provided in the problem requirements.

| Activity | Factor |
|----------|--------|
| Car | 0.20 kg CO₂/km |
| Bus | 0.08 kg CO₂/km |
| Flight | 0.25 kg CO₂/km |
| Electricity | 0.80 kg CO₂/kWh |
| Veg Meal | 0.50 kg CO₂/meal |
| Non-Veg Meal | 2.00 kg CO₂/meal |

This makes the calculation system transparent and predictable.

---

## 4. Why a Weekly Target?

A weekly target gives users a simple way to monitor their footprint over a defined period.

We use a:

**Monday → Sunday**

weekly cycle.

The dashboard shows progress toward the target and indicates when the target has been exceeded.

---

## 5. Nudge Instead of Punishment

We decided that PlanetPulse should encourage users rather than shame them.

When the weekly target is exceeded:

- The user is informed.
- The exceeded amount is shown.
- Lower-carbon alternatives can be suggested.
- The user can still continue logging activities.

The application never blocks the user from recording an activity.

---

## 6. Input Validation

Users can accidentally enter unrealistic values.

For example, a very large travel distance may be the result of a data-entry mistake.

PlanetPulse therefore checks for obviously unrealistic quantities and asks the user to correct them rather than silently accepting potentially incorrect data.

---

## 7. Why an Activity Comparison Chart?

Numbers alone can be difficult to compare quickly.

We therefore added an Activity Comparison Bar Chart.

The chart uses:

- X-axis → Activity type
- Y-axis → CO₂ emissions in kg

This makes differences between activities immediately visible.

The chart updates when activities are added or deleted.

---

## 8. Why localStorage?

The MVP does not require a backend database.

Browser localStorage allows PlanetPulse to preserve:

- Logged activities
- Weekly target

after a page refresh.

This keeps the application simple while still providing persistence for the MVP.

---

## 9. Why Activity History?

Users need to understand where their footprint comes from.

The history section allows users to:

- Review previous activities
- Filter by activity type
- Filter by date
- Delete individual entries
- Export their data as CSV

This makes the dashboard more useful than showing only a single total.

---

## 10. Design Philosophy

The interface was designed around three ideas:

### Track
Make recording an activity quick and simple.

### Understand
Use totals, category breakdowns, charts and progress indicators.

### Act
Provide suggestions that encourage lower-carbon choices.

The overall goal is to turn an abstract environmental impact into something users can see and understand.

---

## 11. Future Improvements

Possible future versions could include:

- User accounts
- Cloud data synchronization
- Monthly and yearly trends
- More detailed emission factors
- Personalized reduction goals
- Community challenges
- Mobile application
- More activity categories

These were kept outside the current MVP to maintain a focused and functional prototype.
