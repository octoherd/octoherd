/**
 * Create a CODE_OF_CONDUCT.md file unless it already exists.
 * Ignores forks and archived repositories
 *
 * @param {import('@octoherd/octokit').Octokit} octokit
 * @param {import('@octokit/openapi-types').components["schemas"]["repository"]} repository
 */
export async function script(octokit, repository) {
  if (repository.archived) {
    octokit.log.info(`${repository.html_url} is archived, ignoring.`);
    return;
  }

  const owner = repository.owner.login;
  const repo = repository.name;
  const path = ".github/dependabot.yml";

  const sha = await octokit
    .request("GET /repos/{owner}/{repo}/contents/{path}", {
      owner,
      repo,
      path,
    })
    .then(
      (response) => response.data.sha,
      (error) => null
    );

  if (!sha) {
    octokit.log.info(`${path} does not exist in ${repository.html_url}`);
    return;
  }

  const {
    data: { commit },
  } = await octokit.request("DELETE /repos/{owner}/{repo}/contents/{path}", {
    owner,
    repo,
    path,
    sha,
    message: `build(dependabot): disable by removing configuration
    
I'm taking a break. I'll enable automated dependency updates when I'm back in 2021. But probably not with Dependabot, but Renovate.`,
  });

  octokit.log.info(
    `${path} deleted in ${repository.html_url} via ${commit.html_url}`
  );
}
