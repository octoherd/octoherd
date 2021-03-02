import { getFileContent } from "./get-file-content.js";

/**
 * Updates branch protection based on a settings from a template repository
 *
 * @param {import('@octoherd/octokit').Octokit} octokit
 * @param {import('@octokit/openapi-types').components["schemas"]["repository"]} repository
 * @param {string} path
 * @param {object} contents
 * @param {string} contents.readme
 * @param {string} contents.package
 * @param {string} contents.packageLock
 */
export async function createRepositoryFromFolder(
  octokit,
  repository,
  path,
  contents
) {
  const steps = [
    "Create repository",
    "Create License",
    "Create Code of Conduct",
    "Create Readme",
    "Create release workflow",
    "Create package.json & package-lock.json",
    "Create .gitignore",
    "Create script files",
  ];
  const owner = repository.owner.login;

  const newRepoName = "script-" + path.split("/").pop();
  const description = getDescriptionFromReadme(contents.readme);

  try {
    // Create new repository
    await createRepository(octokit, repository, newRepoName, description);
    steps.shift();

    await createLicense(octokit, owner, newRepoName);
    steps.shift();

    await createCodeOfConduct(octokit, owner, newRepoName);
    steps.shift();

    await createReadme(octokit, owner, newRepoName, contents.readme);
    steps.shift();

    await createReleaseWorkflow(octokit, owner, newRepoName);
    steps.shift();

    await createPackage(
      octokit,
      owner,
      newRepoName,
      description,
      contents.package,
      contents.packageLock
    );
    steps.shift();

    await createGitignore(octokit, owner, newRepoName);
    steps.shift();

    await createScriptFiles(octokit, repository, newRepoName, path);
    steps.shift();
  } catch (error) {
    octokit.log.error(
      "Creating %s/%s failed. Remaining steps %j",
      owner,
      newRepoName,
      steps
    );
    throw error;
  }
}

/**
 * Assumes that the that the README content has a description on its 3rd line
 *
 * @param {string} content
 */
function getDescriptionFromReadme(content) {
  return (
    content
      // get 3rd line
      .split("\n")[2]
      // remove "> " from beggining of line if present
      .replace(/^> /, "")
      // remove markdown for links
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
  );
}

/**
 *
 * @param {import('@octoherd/octokit').Octokit} octokit
 * @param {import('@octokit/openapi-types').components["schemas"]["repository"]} sourceRepository
 * @param {string} newName
 * @param {string} description
 */
async function createRepository(
  octokit,
  sourceRepository,
  newName,
  description
) {
  const owner = sourceRepository.owner.login;
  const isOrg = sourceRepository.owner.type === "Organization";
  const createRepositoryRoute = isOrg
    ? `POST /orgs/${owner}/repos`
    : "POST /user/repos";

  await octokit.request(createRepositoryRoute, {
    name: newName,
    // @octoherd preferences
    allow_merge_commit: false,
    allow_rebase_merge: false,
    delete_branch_on_merge: true,
    description,
    has_projects: false,
    has_wiki: false,
    has_wiki: false,
  });
}

/**
 * Creates a LICENSE.md file
 *
 * @param {import('@octoherd/octokit').Octokit} octokit
 * @param {string} owner
 * @param {string} repo
 */
async function createLicense(octokit, owner, repo) {
  await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
    owner,
    repo,
    path: "LICENSE.md",
    content: Buffer.from(
      `Copyright 2021 Gregor Martynus

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
    `,
      "utf8"
    ).toString("base64"),
    message: "docs(LICENSE): ISC",
  });
}
/**
 * Creates a CODE_OF_CONDUCT.md file
 *
 * @param {import('@octoherd/octokit').Octokit} octokit
 * @param {string} owner
 * @param {string} repo
 */
async function createCodeOfConduct(octokit, owner, repo) {
  await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
    owner,
    repo,
    path: "CODE_OF_CONDUCT.md",
    content: Buffer.from(
      `# Contributor Covenant Code of Conduct

## Our Pledge

In the interest of fostering an open and welcoming environment, we as
contributors and maintainers pledge to making participation in our project and
our community a harassment-free experience for everyone, regardless of age, body
size, disability, ethnicity, gender identity and expression, level of experience,
nationality, personal appearance, race, religion, or sexual identity and
orientation.

## Our Standards

Examples of behavior that contributes to creating a positive environment
include:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

Examples of unacceptable behavior by participants include:

- The use of sexualized language or imagery and unwelcome sexual attention or
  advances
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information, such as a physical or electronic
  address, without explicit permission
- Other conduct which could reasonably be considered inappropriate in a
  professional setting

## Our Responsibilities

Project maintainers are responsible for clarifying the standards of acceptable
behavior and are expected to take appropriate and fair corrective action in
response to any instances of unacceptable behavior.

Project maintainers have the right and responsibility to remove, edit, or
reject comments, commits, code, wiki edits, issues, and other contributions
that are not aligned to this Code of Conduct, or to ban temporarily or
permanently any contributor for other behaviors that they deem inappropriate,
threatening, offensive, or harmful.

## Scope

This Code of Conduct applies both within project spaces and in public spaces
when an individual is representing the project or its community. Examples of
representing a project or community include using an official project e-mail
address, posting via an official social media account, or acting as an appointed
representative at an online or offline event. Representation of a project may be
further defined and clarified by project maintainers.

## Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be
reported by contacting the project team at opensource+coc@martynus.net. All
complaints will be reviewed and investigated and will result in a response that
is deemed necessary and appropriate to the circumstances. The project team is
obligated to maintain confidentiality with regard to the reporter of an incident.
Further details of specific enforcement policies may be posted separately.

Project maintainers who do not follow or enforce the Code of Conduct in good
faith may face temporary or permanent repercussions as determined by other
members of the project's leadership.

## Attribution

This Code of Conduct is adapted from the [Contributor Covenant][homepage], version 1.4,
available at [https://contributor-covenant.org/version/1/4][version]

[homepage]: https://contributor-covenant.org
[version]: https://contributor-covenant.org/version/1/4/
`,
      "utf8"
    ).toString("base64"),
    message: "docs(CODE_OF_CONDUCT): Contributor Covenant",
  });
}

/**
 * Creates a README.md file
 *
 * @param {import('@octoherd/octokit').Octokit} octokit
 * @param {string} owner
 * @param {string} repo
 * @param {string} currentContent
 */
async function createReadme(octokit, owner, repo, currentContent) {
  await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
    owner,
    repo,
    path: "README.md",
    content: Buffer.from(
      currentContent
        .replace("../../LICENSE.md", "LICENSE.md")
        .replace(
          "git clone https://github.com/octoherd/scripts.git",
          `git clone https://github.com/octoherd/${repo}.git`
        )
        .replace(`scripts/${repo}/script.js`, `${repo}/script.js`),
      "utf8"
    ).toString("base64"),
    message: "docs(README): initial version",
  });
}

/**
 * Create .github/workflows/release.yml
 *
 * @param {import('@octoherd/octokit').Octokit} octokit
 * @param {string} owner
 * @param {string} repo
 */
async function createReleaseWorkflow(octokit, owner, repo) {
  await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
    owner,
    repo,
    path: ".github/workflows/release.yml",
    content: Buffer.from(
      `name: Release
on:
  push:
    branches:
      - main

jobs:
  release:
    name: release
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npx semantic-release
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: \${{ secrets.NPM_AUTOMATION_TOKEN }}
`,
      "utf8"
    ).toString("base64"),
    message: "ci: release",
  });
}

/**
 * Create package.json and package-lock.json files
 *
 * @param {import('@octoherd/octokit').Octokit} octokit
 * @param {string} owner
 * @param {string} repo
 * @param {string} description
 * @param {string} package
 * @param {string} packageLock
 */
async function createPackage(
  octokit,
  owner,
  repo,
  description,
  packageString,
  packageLockString
) {
  const pkg = JSON.parse(packageString);
  const pkgLock = JSON.parse(packageLockString);

  pkg.name = `@${owner}/${repo}`;
  pkgLock.name = `@${owner}/${repo}`;
  pkg.version = "0.0.0-developement";
  pkgLock.version = "0.0.0-developement";

  pkg.description = description;
  pkg.exports = "./index.js";
  pkg.keywords = ["octoherd-script"];
  pkg.release = { branches: ["main"] };
  delete pkg.private;
  pkg.publishConfig = {
    access: "public",
  };

  await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
    owner,
    repo,
    path: "package.json",
    content: Buffer.from(JSON.stringify(pkg, null, 2) + "\n", "utf8").toString(
      "base64"
    ),
    message: "build(package): initial version",
  });

  await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
    owner,
    repo,
    path: "package-lock.json",
    content: Buffer.from(
      JSON.stringify(pkgLock, null, 2) + "\n",
      "utf8"
    ).toString("base64"),
    message: "build(package): lock file",
  });
}

/**
 * Create .gitignore
 *
 * @param {import('@octoherd/octokit').Octokit} octokit
 * @param {string} owner
 * @param {string} repo
 */
async function createGitignore(octokit, owner, repo) {
  await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
    owner,
    repo,
    path: ".gitignore",
    content: Buffer.from("node_modules\n", "utf8").toString("base64"),
    message: "ci: release",
  });
}

/**
 *
 * @param {import('@octoherd/octokit').Octokit} octokit
 * @param {import('@octokit/openapi-types').components["schemas"]["repository"]} sourceRepository
 * @param {string} path
 */
async function createScriptFiles(octokit, sourceRepository, repo, path) {
  const owner = sourceRepository.owner.login;
  const { data } = await octokit.request(
    "GET /repos/{owner}/{repo}/contents/{path}",
    {
      owner: sourceRepository.owner.login,
      repo: sourceRepository.name,
      path,
    }
  );

  // this will never be true, it's just a typeguard
  if (!Array.isArray(data)) return;

  for (const item of data) {
    if (item.name === "README.md") continue;

    const content = await getFileContent(
      octokit,
      owner,
      sourceRepository.name,
      item.path
    );
    await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
      owner,
      repo,
      path: item.name,
      content: Buffer.from(content, "utf8").toString("base64"),
      message: "ci: release",
    });
  }
}
