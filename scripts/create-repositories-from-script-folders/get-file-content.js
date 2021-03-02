/**
 * Get contents of a file
 *
 * @param {import('@octoherd/octokit').Octokit} octokit
 * @param {string} owner
 * @param {string} repo
 * @param {string} path
 *
 * @returns {string}
 */
export async function getFileContent(octokit, owner, repo, path) {
  const { data } = await octokit.request(
    "GET /repos/{owner}/{repo}/contents/{path}",
    {
      mediaType: {
        format: "raw",
      },
      owner,
      repo,
      path,
    }
  );

  return data;
}
