# Octoherd

<a href="https://myoctocat.dev/@gr2m/octoherd/"><img alt="Octoherd Avatar" src="https://raw.githubusercontent.com/octoherd/octoherd/main/assets/octoherd-flipped.gif" width=300 height=300 align=right></a>

Octoherd allows you to run a script against multiple repositories in parallel.

A script is a JavaScript function that receives

1. A pre-authenticated [`octokit`](https://github.com/octoherd/octokit/#readme) instance
2. A repository object
3. An options object with script-specific options

## Example

Source code for [the hello world Octoherd script](https://github.com/octoherd/script-hello-world/#readme)

```js
/**
 * The "Hello, World!" of all Octoherd Scripts!
 *
 * @param {import('@octoherd/cli').Octokit} octokit
 * @param {import('@octoherd/cli').Repository} repository
 * @param {object} options
 * @param {string} [options.greetingName] name to be greeted
 */
export async function script(octokit, repository, { greetingName = "World" }) {
  octokit.log.info("Hello, %s! From %s", greetingName, repository.full_name);
}
```

Run the hello world script with

```
npx @octoherd/script-hello-world \
  --octoherd-token 0123456789012345678901234567890123456789 \
  "octoherd/*"
```

## Find a script

For existing scripts, check out [repositories with the `octoherd-script` label](https://github.com/topics/octoherd-script).

## Create a script

To create your own script, run

```
npm init octoherd-script
```

and follow the instructions. See [octoherd/create-octoherd-script](https://github.com/octoherd/create-octoherd-script) for more information.

## Get involved

It's a great time to get involved, look out for ["pull request welcome" issues](https://github.com/issues?q=is%3Aopen+org%3Aoctoherd+label%3A%22pull+request+welcome%22).

## License

[ISC](LICENSE.md)
