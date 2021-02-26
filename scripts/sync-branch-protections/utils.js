/**
 * turn
 *
 * {
 *   url: 'https://api.github.com/repos/octokit/core.js/branches/master/protection',
 *   required_status_checks: {
 *     url: 'https://api.github.com/repos/octokit/core.js/branches/master/protection/required_status_checks',
 *     strict: true,
 *     contexts: [ 'WIP', 'project-board', 'test (10)', 'test (12)', 'test (14)' ],
 *     contexts_url: 'https://api.github.com/repos/octokit/core.js/branches/master/protection/required_status_checks/contexts'
 *   },
 *   required_pull_request_reviews: {
 *     url: 'https://api.github.com/repos/octokit/core.js/branches/master/protection/required_pull_request_reviews',
 *     dismiss_stale_reviews: false,
 *     require_code_owner_reviews: false
 *   },
 *   enforce_admins: {
 *     url: 'https://api.github.com/repos/octokit/core.js/branches/master/protection/enforce_admins',
 *     enabled: false
 *   },
 *   required_linear_history: { enabled: false },
 *   allow_force_pushes: { enabled: false },
 *   allow_deletions: { enabled: false }
 * }
 *
 * into
 *
 * {
 *   required_status_checks: {
 *     strict: true,
 *     contexts: [ 'WIP', 'project-board', 'test (10)', 'test (12)', 'test (14)' ]
 *   },
 *   required_pull_request_reviews: { dismiss_stale_reviews: false, require_code_owner_reviews: false },
 *   enforce_admins: false,
 *   required_linear_history: false,
 *   allow_force_pushes: false,
 *   allow_deletions: false
 * }
 */
export function protectionResponseDataToUpdateParameters(data) {
  const defaults = {
    required_status_checks: null,
    enforce_admins: null,
    required_pull_request_reviews: null,
    restrictions: null,
  };
  const parameters = mapValues(data, (key, value) => {
    if (/(^|_)url$/.test(key)) return;
    if (Array.isArray(value)) return value;
    if (typeof value !== "object") return value;

    if ("enabled" in value) return value.enabled;
    if ("login" in value) return value.login;
    if ("slug" in value) return value.slug;

    return { ...value };
  });

  return { ...defaults, ...parameters };
}

function mapValues(object, map) {
  if (typeof object !== "object") return object;

  const newObject = Object.fromEntries(
    Object.entries(object).map(([key, value]) => [key, map(key, value)])
  );

  for (const [key, value] of Object.entries(newObject)) {
    if (value === undefined || value === null) {
      delete newObject[key];
    }
    if (Array.isArray(value)) {
      newObject[key] = newObject[key].map((item) => mapValues(item, map));
    } else if (typeof value === "object") {
      newObject[key] = mapValues(newObject[key], map);
    }
  }

  return newObject;
}
