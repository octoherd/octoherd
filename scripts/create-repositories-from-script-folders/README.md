# create-repositories-from-folder

> An [octoherd](https://github.com/octoherd) script that creates new repositories from folders

This script is specific to the needs of a one-time migration for [@octoherd](https://github.com/octoherd). But it might be a good starting point if you need to create a script to eject a monorepo setup yourself.

## Usage

```
git clone https://github.com/octoherd/scripts.git
$ npx @octoherd/cli \
  --octoherd-token 0123456789012345678901234567890123456789 \
  scripts/sync-branch-protections/script.js \
  "octoherd/scripts" \
  --path-to-folders "scripts/**"
```

## License

[ISC](../../LICENSE.md)
