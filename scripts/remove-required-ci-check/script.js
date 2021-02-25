/**
 * Removes required CI check
 *
 * @param {import('@octoherd/octokit').Octokit} octokit
 * @param {import('@octokit/openapi-types').components["schemas"]["repository"]} repository
 * @param { {check: string} } options Custom user options passed to the CLI
 */
export async function script(octokit, repository, options) {
  if (!options.check) {
    throw new Error(`--check is required`);
  }

  const owner = repository.owner.login;
  const repo = repository.name;

  if (repository.archived) {
    octokit.log.info(
      { owner, repo, updated: false },
      `${repository.html_url} is archived`
    );
    return;
  }

  const branches = await octokit.paginate(
    "GET /repos/{owner}/{repo}/branches",
    {
      owner,
      repo,
      protected: true,
    }
  );

  if (branches.length === 0) {
    octokit.log.info(
      { owner, repo, updated: false },
      `No protected branches in ${owner}/${repo}`
    );
  }

  try {
    for (const { name } of branches) {
      const {
        data: { contexts },
      } = await octokit.request(
        "GET /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks",
        {
          owner,
          repo,
          branch: name,
        }
      );

      if (!contexts.includes(options.check)) {
        octokit.log.info(
          { owner, repo, updated: false, contexts },
          `"${options.check}" not found in "${name}"'s branch protection in ${owner}/${repo}`
        );
        continue;
      }

      await octokit.request(
        "PATCH /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks",
        {
          owner,
          repo,
          branch: name,
          contexts: contexts.filter((context) => context !== options.check),
        }
      );

      octokit.log.info(
        { owner, repo, updated: true },
        `"${options.check}" removed from "${name}"'s branch protection in ${owner}/${repo}`
      );
    }
  } catch (error) {
    if (/Required status checks not enabled/i.test(error.message)) {
      octokit.log.info(
        { owner, repo, updated: true },
        `"Required status checks not enabled in ${owner}/${repo}`
      );
      return;
    }

    throw error;
  }
}
