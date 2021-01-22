# setup renovate

> An [octoherd](https://github.com/octoherd) script to remove a required status check from all protected branches

## Usage

```
git clone https://github.com/octoherd/scripts.git
$ npx @octoherd/cli \
  --token 0123456789012345678901234567890123456789 \
  scripts/scripts/remove-required-ci-check/script.js \
  "octokit/*" \
  --check "Pika CI"
```

## Licenses

[ISC](../../LICENSE.md)
