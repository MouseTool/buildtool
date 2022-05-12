# Contributing to the BuildTool project

`WORK IN PROGRESS`

0. [Basic Structure](basic-structure)
0. [Testing](testing)

## Basic Overview

### Project tree

- `src/`
- `tools/`A collection of utility scripts used for automation.
- `lib/` A collection of libraries under development, to be maintained separately in respective repositories in the future.
- `i18n` Translation data fetched from the NPM script `poeditor:fetch`.

### Updating translations

```json
"poeditor:build": "ts-node tools/build-translations.ts",
"poeditor:fetch": "ts-node -r dotenv/config tools/poeditor-fetch.ts"
```

## Testing

No tests are available at the moment.
