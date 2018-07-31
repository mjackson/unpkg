const getContentType = require("../getContentType");

it("gets a content type of text/plain for LICENSE|README|CHANGES|AUTHORS|Makefile", () => {
  expect(getContentType("AUTHORS")).toBe("text/plain");
  expect(getContentType("CHANGES")).toBe("text/plain");
  expect(getContentType("LICENSE")).toBe("text/plain");
  expect(getContentType("Makefile")).toBe("text/plain");
  expect(getContentType("PATENTS")).toBe("text/plain");
  expect(getContentType("README")).toBe("text/plain");
});

it("gets a content type of text/plain for .*rc files", () => {
  expect(getContentType(".eslintrc")).toBe("text/plain");
  expect(getContentType(".babelrc")).toBe("text/plain");
  expect(getContentType(".anythingrc")).toBe("text/plain");
});

it("gets a content type of text/plain for .git* files", () => {
  expect(getContentType(".gitignore")).toBe("text/plain");
  expect(getContentType(".gitanything")).toBe("text/plain");
});

it("gets a content type of text/plain for .*ignore files", () => {
  expect(getContentType(".eslintignore")).toBe("text/plain");
  expect(getContentType(".anythingignore")).toBe("text/plain");
});

it("gets a content type of text/plain for .ts files", () => {
  expect(getContentType("app.ts")).toBe("text/plain");
  expect(getContentType("app.d.ts")).toBe("text/plain");
});

it("gets a content type of text/plain for .flow files", () => {
  expect(getContentType("app.js.flow")).toBe("text/plain");
});

it("gets a content type of text/plain for .lock files", () => {
  expect(getContentType("yarn.lock")).toBe("text/plain");
});
