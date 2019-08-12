import nanoid from 'nanoid';
import Oktokit from '@octokit/rest';
import { Base64 } from 'js-base64';

const GATEKEEPER_URI = 'http://localhost:9999';
const CLIENT_ID = '0933e26d6f460754f2a6';
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
  if (query.startsWith('?')) {
    query = query.substring(1);
  }

  return query.split('&').reduce((acc, item) => {
    const [key, value] = item.split('=');
    return { ...acc, [key]: value != null ? value : true };
  }, {});
}

function queryString(data) {
  return Object.keys(data)
    .map(key => {
      return `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`;
    })
    .join('&');
}

export async function handleOAuth() {
  const query = parseQueryString(window.location.search);
  const { code } = query;

  const res = await fetch(`${GATEKEEPER_URI}/authenticate/${code}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
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
  });

  window.location.assign(`https://github.com/login/oauth/authorize?${query}`);
}

function setAccessToken(token) {
  localStorage.setItem('access_token', token);
}

function getAccessToken() {
  return localStorage.getItem('access_token');
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

export async function getPage(path) {
  path = normalizePage(path);

  let page;

  if (authorized()) {
    const branchRes = await octokit.repos.getBranch({
      owner: OWNER,
      repo: REPO,
      branch: 'master',
    });

    const ref = branchRes.data.commit.sha;

    const res = await octokit.repos.getContents({
      owner: OWNER,
      repo: REPO,
      path: `${path}.md`,
      ref,
    });

    console.log(res);
    page = {
      content: Base64.decode(res.data.content),
      sha: res.data.sha,
      title: titleFromPath(path),
      ref,
    };
  } else {
    // get page without authentication
    const res = await fetch(`https://raw.githubusercontent.com/${OWNER}/${REPO}/master/${path}.md`);

    page = {
      content: await res.text(),
      title: titleFromPath(path),
    };
  }

  return page;
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
    .filter(item => item.path.endsWith('.md'))
    .forEach(element => {
      const parts = element.path.split('/');
      insertIntoTree(tree, parts);
    });

  return tree;
}

function normalizePath(path) {
  if (path.endsWith('.md')) {
    path = path.substr(0, path.length - 3);
  }

  return path;
}

function insertIntoTree(tree, parts) {
  const [part, ...restParts] = parts;

  // skip files and folders starting with an underscore or a dot
  if (part.startsWith('_') || part.startsWith('.')) {
    return;
  }

  const normalizedPart = normalizePath(part);

  let element = tree.filter(p => p.name === normalizedPart)[0];

  if (!element) {
    element = { name: normalizedPart, children: [] };
    tree.push(element);
  }

  if (restParts.length > 0) {
    insertIntoTree(element.children, restParts);
  }
}

function titleFromPath(path) {
  const pathParts = path.split('/');
  return pathParts[pathParts.length - 1];
}

export async function createPage(pagePath) {
  if (pagePath.startsWith('/')) {
    pagePath = pagePath.substr(1);
  }

  if (pagePath.endsWith('.md')) {
    pagePath = pagePath.substr(0, pagePath.length - 3);
  }

  const res = await octokit.repos.createOrUpdateFile({
    owner: OWNER,
    repo: REPO,
    path: `${pagePath}.md`,
    message: 'Create page',
    content: Base64.encode(`# ${titleFromPath(pagePath)}\n`),
  });

  return res.data.content.sha;
}

export async function savePage(pagePath, content, page) {
  if (pagePath.startsWith('/')) {
    pagePath = pagePath.substr(1);
  }

  if (!pagePath.endsWith('.md')) {
    pagePath = pagePath + '.md';
  }

  const branchName = 'edit_' + new Date().getTime();

  let createdSha;

  try {
    // try to update file in place
    const res = await octokit.repos.createOrUpdateFile({
      owner: OWNER,
      repo: REPO,
      path: pagePath,
      message: 'Update page',
      content: Base64.encode(content),
      sha: page.sha,
    });

    createdSha = res.data.content.sha;
  } catch {

  }

  if (!createdSha) {
    // move changes to new branch
    await octokit.git.createRef({
      owner: OWNER,
      repo: REPO,
      ref: `refs/heads/${branchName}`,
      sha: ref,
    });

    const res = await octokit.repos.createOrUpdateFile({
      owner: OWNER,
      repo: REPO,
      path: pagePath,
      message: 'Update page',
      content: Base64.encode(content),
      sha: page.sha,
      branch: branchName,
    });

    createdSha = res.data.content.sha;

    try {
      // try to merge branch to master and delete branch
      await octokit.repos.merge({
        owner: OWNER,
        repo: REPO,
        base: 'master',
        head: branchName,
      });

      await octokit.git.deleteRef({
        owner: OWNER,
        repo: REPO,
        ref: `heads/${branchName}`,
      });
    } catch {
      // could not merge branch -> create pull request
      await octokit.pulls.create({
        owner: OWNER,
        repo: REPO,
        title: `Edit ${page.title}`,
        head: `refs/heads/${branchName}`,
        base: 'master',
      });
    }
  }

  return createdSha;
}
