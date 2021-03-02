import { getFileContent } from "./get-file-content.js";
import { createRepositoryFromFolder } from "./create-repository-from-folder.js";

/**
 * Updates branch protection based on a settings from a template repository
 *
 * @param {import('@octoherd/octokit').Octokit} octokit
 * @param {import('@octokit/openapi-types').components["schemas"]["repository"]} repository
 * @param {object} options
 * @param {string} [options.pathToFolders]
 */
export async function script(octokit, repository, { pathToFolders }) {
  if (!pathToFolders) {
    throw new Error(`--path-to-folders is required`);
  }

  const owner = repository.owner.login;
  const repo = repository.name;

  try {
    const { data } = await octokit.request(
      "GET /repos/{owner}/{repo}/contents/{path}",
      {
        owner,
        repo,
        path: pathToFolders,
      }
    );

    if (!Array.isArray(data)) {
      octokit.info(
        "'%s' is not a folder in %s. It's a %s",
        pathToFolders,
        repository.full_name,
        data.type
      );
      return;
    }

    let pkg;
    let pkgLock;

    for (const item of data) {
      if (item.type !== "dir") {
        octokit.info(
          "'%s/%s' is not a folder in %s. It's a %s",
          pathToFolders,
          item.name,
          repository.full_name,
          item.type
        );
        continue;
      }

      pkg = pkg || (await getFileContent(octokit, owner, repo, "package.json"));
      pkgLock =
        pkgLock ||
        (await getFileContent(octokit, owner, repo, "package-lock.json"));

      const readme = await getFileContent(
        octokit,
        owner,
        repo,
        item.path + "/README.md"
      );

      await createRepositoryFromFolder(octokit, repository, item.path, {
        readme,
        package: pkg,
        packageLock: pkgLock,
      });
    }
  } catch (error) {
    if (error.status === 404) {
      octokit.info(
        "'%s' does not exist in %s",
        pathToFolders,
        repository.full_name
      );
      return;
    }

    throw error;
  }
}
