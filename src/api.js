import nanoid from 'nanoid';
import Oktokit from '@octokit/rest';

const GATEKEEPER_URI = "http://localhost:9999";
const CLIENT_ID = "0933e26d6f460754f2a6";
const SCOPES = ['read:user', 'public_repo'];
const REPO = 'wiki';
const OWNER = 'flipdot';

const octokit = new Oktokit({
  auth: () => {
    return getAccessToken();
  },
  userAgent: 'flipdot wiki v1.0',
});

function parseQueryString(query) {
  if (query.startsWith("?")) {
    query = query.substring(1);
  }

  return query.split("&").reduce((acc, item) => {
    const [key, value] = item.split("=");
    return { ...acc, [key]: value != null ? value : true };
  }, {});
}

function queryString(data) {
  return Object.keys(data)
    .map(key => {
      return `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`;
    })
    .join("&");
}

export async function handleOAuth() {
  const query = parseQueryString(window.location.search);
  const { code } = query;

  const res = await fetch(`${GATEKEEPER_URI}/authenticate/${code}`, {
    method: "GET",
    headers: {
      Accept: "application/json"
    }
  });

  setAccessToken((await res.json()).token);
}

export function initiateLogin() {
  const state = nanoid();
  localStorage.setItem('oauth_state', state);

  const query = queryString({
    client_id: CLIENT_ID,
    redirect_uri: window.location.origin + '#oauth',
    scope: SCOPES.join(','),
    state,
  })

  window.location.assign(`https://github.com/login/oauth/authorize?${query}`);
}

function setAccessToken(token) {
  localStorage.setItem("access_token", token);
}

function getAccessToken() {
  return localStorage.getItem("access_token");
}

export function isLoggedIn() {
  return !!getAccessToken();
}

export async function getUserData() {
  const response = await octokit.users.getAuthenticated();
  console.debug('User data retrieved.', { response });
  return response.data;
}

function normalizePage(page) {
  if (page.startsWith('/')) {
    return page.substring(1);
  } else {
    return page;
  }
}

function authorized() {
  return !!getAccessToken();
}

export async function getPage(page) {
  page = normalizePage(page);

  let rawPage;
  if (authorized()) {
    const contents = await octokit.repos.getContents({
      owner: OWNER,
      repo: REPO,
      path: `${page}.md`,
      mediaType: {
        format: 'raw'
      }
    });

    rawPage = contents.data;
  } else {
    // get page without authentication
    const res = await fetch(
      `https://raw.githubusercontent.com/${OWNER}/${REPO}/master/${page}.md`
    );
    rawPage = await res.text();
  }

  return rawPage;
}

export async function getSitemap() {
  const treeRes = await octokit.git.getTree({
    owner: OWNER,
    repo: REPO,
    tree_sha: 'master',
    recursive: 1,
  });

  const tree = [];

  treeRes.data.tree
    .filter(item => item.path.endsWith(".md"))
    .forEach(element => {
      const parts = element.path.split("/");
      insertIntoTree(tree, parts);
    });

  return tree;
}

function insertIntoTree(tree, parts) {
  const [part, ...restParts] = parts;

  // skip files and folders starting with an underscore or a dot
  if (part.startsWith("_") || part.startsWith(".")) {
    return;
  }

  let element = tree.filter(p => p.name === part)[0];

  if (!element) {
    element = { name: part, children: [] };
    tree.push(element);
  }

  if (restParts.length > 0) {
    insertIntoTree(element.children, restParts);
  }
}


// export async function savePage(page, content) {
//   const res = await fetch(pageUrl(page), {
//     method: 'PUT',
//     body: atob(content),
//   });

//   const json = await res.json();
//   json
// }
