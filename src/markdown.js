import remark from "remark";
import recommended from "remark-preset-lint-recommended";
import html from "remark-html";

export async function renderMarkdown(input) {
  return new Promise((resolve, reject) => {
    remark()
      .use(recommended)
      .use(html)
      .process(input, function(err, file) {
        resolve({
          html: String(file),
          lintResult: err
        });
      });
  });
}
