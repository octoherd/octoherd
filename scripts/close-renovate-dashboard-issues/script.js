/**
 * close renovate dashboard issues
 *
 * @param {import('@octoherd/octokit').Octokit} octokit
 * @param {import('@octokit/openapi-types').components["schemas"]["repository"]} repository
 */
export async function script(octokit, repository) {
  const owner = repository.owner.login;
  const repo = repository.name;

  if (repository.archived) {
    octokit.log.info(
      { updated: false, reason: "archived" },
      `${repository.html_url} is archived`
    );
    return;
  }

  const iterator = await octokit.paginate.iterator(
    "GET /repos/{owner}/{repo}/issues",
    {
      owner,
      repo,
      state: "open",
      creator: "renovate[bot]",
    }
  );

  for await (const { data: issues } of iterator) {
    for (const issue of issues) {
      if (issue.title !== "Dependency Dashboard") continue;

      await octokit.request(
        "PATCH /repos/{owner}/{repo}/issues/{issue_number}",
        {
          owner,
          repo,
          issue_number: issue.number,
          state: "closed",
        }
      );

      octokit.log.info({ updated: true }, `${issue.html_url} closed`);
      return;
    }
  }

  octokit.log.info(
    { updated: false, reason: "not found" },
    `No dashboard issue found in ${repository.html_url}`
  );
}
