# Hanson Weather Guidelines

You are an expert in JavaScript, HTML, CSS, and scalable web application development.
You write secure, maintainable, and performant code following JavaScript, HTML, and
CSS best practices.

We are creating a weather app specifically for Skiing, Snowboarding, and other winter sports
enthusiasts. The app will provide real-time weather information, including temperature,
wind speed, and snowfall predictions, to help users plan their outdoor activities.

We use https://api.open-meteo.com/v1/forecast API to fetch weather data.  Please use their documentation
Located here: https://open-meteo.com/en/docs



## JavaScript Best Practices
- Follow ESLint and Prettier configurations
- Use ES6+ features (arrow functions, destructuring, etc.)
- Prefer const over let, avoid var
- Use async/await for asynchronous operations
- Use template literals for string concatenation
- https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Code_style_guide/JavaScript

## HTML Best Practices
- Use semantic HTML elements
- Use CSS classes to style elements
- Use the appropriate HTML element for the job
- https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Code_style_guide/HTML

## CSS Best Practices
- Use CSS custom properties for colors
- Use CSS selectors that are specific enough
- Use dashed names when more than one word is used
- https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Code_style_guide/CSS

## AGENT (junie, claude, codex, copilot) Instructions
- Save temp files in a folder named .junie/temp_files
- Create Todo-{feature-name}.md files for all steps you implement
- Check off steps from the todo-{feature-name}.md files as tasks are completed incase we need to start again
- Add comments as needed but do not be overly verbose

## Project Notes (Icons)
- Weather icon mapping lives in `server.js` (mapWeatherCodeToIcon, weatherIcons, iconFallback); server returns Meteocons SVG paths via `getWeatherIcon`.
- Front-end renders icons as `<img>` elements in `public/scripts/app.js` for summary, forecast, wind, avalanche risk, and riding conditions.
- Icon sizing is controlled by `em`-based styles in `public/styles/styles.css` (e.g. `.summary-icon`, `.forecast-icon`, `.wind-icon`).
- Meteocons SVGs are stored in `public/images/meteocons/fill/svg`.
- Legacy icon CSS exists in `public/styles/inline.css` for `.icon.*` background images; current UI uses `public/styles/styles.css` and does not apply those classes.

## Project Notes (Mobile First UI)
- Mobile-first layout for cards is defined in `public/styles/styles.css` (base rules, iPhone SE 375px), with media queries scaling up from there.
- Header grid for cards uses `grid-template-areas` in `.city-card-header-content`; summary icon now lives under `.temp-info`.
- `public/scripts/app.js` renders Meteocons SVGs (summary, wind, avalanche, riding conditions) via `<img>` elements with `.icon-svg`.
- Server now returns `windIcon`, `avalancheIcon`, `ridingCondition`, and `ridingConditionIcon` alongside weather data in `server.js`.
