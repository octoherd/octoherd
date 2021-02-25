/**
 * stars or unstars the passed repository based on the `unstar` option
 *
 * @param {import('@octoherd/octokit').Octokit} octokit
 * @param {import('@octokit/openapi-types').components["schemas"]["repository"]} repository
 * @param { {unstar?: boolean} } options Custom user options passed to the CLI
 */
export async function script(octokit, repository, options) {
  const method = options.unstar ? "DELETE" : "PUT";

  // https://docs.github.com/en/rest/reference/activity#star-a-repository-for-the-authenticated-user
  // https://docs.github.com/en/rest/reference/activity#unstar-a-repository-for-the-authenticated-user
  await octokit.request("/user/starred/{owner}/{repo}", {
    method,
    owner: repository.owner.login,
    repo: repository.name,
  });

  octokit.log.info(
    `Star ${options.unstar ? "removed from" : "added to"} ${
      repository.html_url
    }`
  );
}
