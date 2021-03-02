import { protectionResponseDataToUpdateParameters } from "./utils.js";

let templateBranchProtectionSettings;

/**
 * Updates branch protection based on a settings from a template repository
 *
 * @param {import('@octoherd/octokit').Octokit} octokit
 * @param {import('@octokit/openapi-types').components["schemas"]["repository"]} repository
 * @param { {template: string} } options Custom user options passed to the CLI
 */
export async function script(octokit, repository, options) {
  if (!options.template) {
    throw new Error(`--template is required`);
  }

  try {
    if (!templateBranchProtectionSettings) {
      octokit.log.debug(
        "Load branch protection settings from template repository %s",
        options.template
      );

      const [templateOwner, templateRepo] = options.template.split("/");

      try {
        const {
          data: { default_branch },
        } = await octokit.request("GET /repos/{owner}/{repo}", {
          owner: templateOwner,
          repo: templateRepo,
        });

        const { data } = await octokit.request(
          "GET /repos/{owner}/{repo}/branches/{branch}/protection",
          {
            owner: templateOwner,
            repo: templateRepo,
            branch: default_branch,
          }
        );

        templateBranchProtectionSettings = protectionResponseDataToUpdateParameters(
          data
        );
      } catch (error) {
        if (error.status === 404) {
          throw new Error(`No branch protection in template repository: %s`);
        }

        throw error;
      }

      octokit.log.info(
        templateBranchProtectionSettings,
        "branch protection settings loaded from %s",
        options.template
      );
    }

    const urlParameters = {
      owner: repository.owner.login,
      repo: repository.name,
      branch: repository.default_branch,
    };

    try {
      const { data } = await octokit.request(
        "GET /repos/{owner}/{repo}/branches/{branch}/protection",
        urlParameters
      );
      const branchProtectionParameters = protectionResponseDataToUpdateParameters(
        data
      );
      octokit.log.debug(
        branchProtectionParameters,
        "Current branch protection settings for %s",
        repository.full_name
      );
    } catch (error) {
      if (error.status === 404) {
        octokit.log.debug(
          "No branch protection settings on %s",
          repository.full_name
        );
      } else {
        throw error;
      }
    }

    await octokit.request(
      "PUT /repos/{owner}/{repo}/branches/{branch}/protection",
      {
        ...urlParameters,
        ...templateBranchProtectionSettings,
      }
    );
  } catch (error) {
    if (error.status === 404) {
      octokit.log.info(
        "No branch protection on %s's default branch (%s)",
        repository.full_name,
        repository.default_branch
      );
      return;
    }

    throw error;
  }
}
