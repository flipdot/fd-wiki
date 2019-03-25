const GATEKEEPER_URI = "http://localhost:9999";

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
      return `${key}=${data[key]}`;
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

function setAccessToken(token) {
  localStorage.setItem("access_token", token);
}

function getAccessToken() {
  return localStorage.getItem("access_token");
}

export async function getPage(page) {
  let rawPage;

  const accessToken = getAccessToken();
  if (accessToken) {
    const res = await fetch(
      `https://api.github.com/repos/flipdot/flipdot.github.io/contents${page}.md`,
      {
        headers: {
          Authorization: `token ${accessToken}`,
          Accept: "application/vnd.github.VERSION.raw"
        }
      }
    );
    rawPage = await res.text();
  } else {
    const res = await fetch(
      `https://raw.githubusercontent.com/flipdot/flipdot.github.io/master${page}.md`
    );
    rawPage = await res.text();
  }

  return rawPage;
}

export async function getSitemap() {
  const accessToken = getAccessToken();

  const res = await fetch(
    `https://api.github.com/repos/flipdot/flipdot.github.io/git/trees/master?recursive=true`,
    {
      headers: {
        Authorization: accessToken ? `token ${accessToken}` : undefined
      }
    }
  );

  const { tree: flatTree } = await res.json();
  const tree = [];

  flatTree
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
