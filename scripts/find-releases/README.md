# find releases

> An [octoherd](https://github.com/octoherd) script to find GitHub releases

## Usage

```
git clone https://github.com/octoherd/scripts.git
$ npx @octoherd/cli \
  --octoherd-token 0123456789012345678901234567890123456789 \
  scripts/star-or-unstar/script.js \
  "octokit/*"
```

Optionally add a `--since` flag to ignore releases before a defined date, e.g. `--since 2020-02-02`

## License

[ISC](../../LICENSE.md)
