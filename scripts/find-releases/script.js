/**
 * Find releases in repositories. Pass an optional `since` option (`YYYY-MM-dd`) to ignore
 * releases prior a set date
 *
 * @param {import('@octoherd/octokit').Octokit} octokit
 * @param {import('@octokit/openapi-types').components["schemas"]["repository"]} repository
 * @param { {since?: string} } options Custom user options passed to the CLI
 */
export async function script(octokit, repository, options) {
  const since = options.since || "";

  const owner = repository.owner.login;
  const repo = repository.name;

  // https://docs.github.com/en/free-pro-team@latest/rest/reference/repos#list-releases
  const allReleases = await octokit.paginate(
    "GET /repos/{owner}/{repo}/releases",
    {
      owner,
      repo,
      per_page: 100,
    }
  );

  const releases = allReleases.filter((release) => {
    return since ? release.created_at > String(since) : true;
  });

  octokit.log.info(
    {
      releases: releases.map((release) => {
        const type = /\.0\.0$/.test(release.tag_name)
          ? "breaking"
          : /\.0$/.test(release.tag_name)
          ? "feature"
          : "fix";

        return {
          created_at: release.created_at,
          version: release.tag_name,
          notes: release.body,
          type,
        };
      }),
      repository: [owner, repo].join("/"),
    },
    `${releases.length} releases found in ${repository.html_url}${
      since ? ` since ${since}` : ""
    }`
  );
}
