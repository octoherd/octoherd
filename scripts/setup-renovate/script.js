/**
 * Setup renovate by adding `{"renovate": {"extends": "..."}}` to the package.json
 *
 * @param {import('@octoherd/octokit').Octokit} octokit
 * @param {import('@octokit/openapi-types').components["schemas"]["repository"]} repository
 * @param { {extends: string} } options Custom user options passed to the CLI
 */
export async function script(octokit, repository, options) {
  if (!options.extends) {
    throw new Error(`--extends is required`);
  }

  const owner = repository.owner.login;
  const repo = repository.name;
  const path = "package.json";

  if (repository.archived) {
    octokit.log.info(
      { owner, repo, updated: false },
      `${repository.html_url} is archived`
    );
    return;
  }

  const { pkg, sha } = await octokit
    .request("GET /repos/{owner}/{repo}/contents/{path}", {
      owner,
      repo,
      path,
    })
    .then(
      (response) => {
        return {
          pkg: JSON.parse(
            Buffer.from(response.data.content, "base64").toString()
          ),
          sha: response.data.sha,
        };
      },
      (error) => {
        if (error.status === 404) return { pkg: false };
        throw error;
      }
    );

  if (!pkg) {
    octokit.log.info(
      { owner, repo, updated: false },
      `no package.json file in ${repository.html_url}`
    );
    return;
  }

  if (!pkg.renovate) {
    pkg.renovate = {};
  }

  const newExtends = options.extends.split(/\s*,\s*/);
  const currentExtends = pkg.renovate.extends;

  if (
    currentExtends &&
    newExtends.sort().join(",") === currentExtends.sort().join(",")
  ) {
    octokit.log.info(
      { owner, repo, currentExtends, updated: false },
      `"extends" is already set to "${JSON.stringify(currentExtends)}" in ${
        repository.html_url
      }`
    );
    return;
  }

  pkg.renovate.extends = newExtends;

  const {
    data: { commit },
  } = await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
    owner,
    repo,
    path,
    sha,
    content: Buffer.from(JSON.stringify(pkg, null, 2) + "\n").toString(
      "base64"
    ),
    message: `build: renovate setup`,
  });

  if (currentExtends) {
    octokit.log.warn(
      { owner, repo, currentExtends, updated: true },
      `Existing "extends" setting was changed from "${JSON.stringify(
        currentExtends
      )}" in ${commit.html_url}`
    );
  } else {
    octokit.log.info(
      { owner, repo, updated: true },
      `"extends" setting added in ${commit.html_url}`
    );
  }
}
