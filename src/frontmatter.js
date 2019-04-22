function parseFrontmatter(frontmatter) {
  return frontmatter.split("\n").reduce((acc, item) => {
    const key = /(.*):/.exec(item)[1];
    const value = /.*: (.*)/.exec(item)[1];

    return {
      ...acc,
      [key]: value
    };
  }, {});
}

export function extractFrontmatter(text) {
  const regex = /^---\n((.|\n)*)\n---\n/gm;
  const match = regex.exec(text);

  if (match) {
    const matchEnd = match.index + match[0].length;
    const rawFrontmatter = match[1];
    return {
      frontmatter: parseFrontmatter(rawFrontmatter),
      content: text.substr(matchEnd)
    };
  } else {
    return {
      content: text,
      frontmatter: {}
    };
  }
}
