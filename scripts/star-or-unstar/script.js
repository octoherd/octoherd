/**
 * stars or unstars the passed repository based on the `unstar` option
 *
 * @param {import('@octoherd/octokit').Octokit} octokit
 * @param {import('@octokit/openapi-types').components["schemas"]["repository"]} repository
 * @param { {unstar?: boolean} } options Custom user options passed to the CLI
 */
export async function script(octokit, repository, options) {
  const method = options.unstar ? "DELETE" : "PUT";

  const id = repository.id;
  const owner = repository.owner.login;
  const repo = repository.name;

  // https://docs.github.com/en/rest/reference/activity#check-if-a-repository-is-starred-by-the-authenticated-user
  const isStarred = await octokit
    .request("GET /user/starred/{owner}/{repo}", {
      owner,
      repo,
    })
    .then(
      () => true,
      () => false
    );

  if ((options.unstar && !isStarred) || (!options.unstar && isStarred)) {
    octokit.log.debug(
      {
        change: 0,
        id,
        owner,
        repo,
      },
      "No change for %s",
      repository.html_url
    );
    return;
  }

  // https://docs.github.com/en/rest/reference/activity#star-a-repository-for-the-authenticated-user
  // https://docs.github.com/en/rest/reference/activity#unstar-a-repository-for-the-authenticated-user
  await octokit.request("/user/starred/{owner}/{repo}", {
    method,
    owner,
    repo,
  });

  octokit.log.info(
    {
      change: options.unstar ? -1 : 1,
      id,
      owner,
      repo,
    },
    "Star %s %s",
    options.unstar ? "removed from" : "added to",
    repository.html_url
  );
}
