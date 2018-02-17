const getFileContentType = require("../getFileContentType")

it("gets a content type of text/plain for LICENSE|README|CHANGES|AUTHORS|Makefile", () => {
  expect(getFileContentType("AUTHORS")).toBe("text/plain")
  expect(getFileContentType("CHANGES")).toBe("text/plain")
  expect(getFileContentType("LICENSE")).toBe("text/plain")
  expect(getFileContentType("Makefile")).toBe("text/plain")
  expect(getFileContentType("PATENTS")).toBe("text/plain")
  expect(getFileContentType("README")).toBe("text/plain")
})

it("gets a content type of text/plain for .*rc files", () => {
  expect(getFileContentType(".eslintrc")).toBe("text/plain")
  expect(getFileContentType(".babelrc")).toBe("text/plain")
  expect(getFileContentType(".anythingrc")).toBe("text/plain")
})

it("gets a content type of text/plain for .git* files", () => {
  expect(getFileContentType(".gitignore")).toBe("text/plain")
  expect(getFileContentType(".gitanything")).toBe("text/plain")
})

it("gets a content type of text/plain for .*ignore files", () => {
  expect(getFileContentType(".eslintignore")).toBe("text/plain")
  expect(getFileContentType(".anythingignore")).toBe("text/plain")
})

it("gets a content type of text/plain for .ts files", () => {
  expect(getFileContentType("app.ts")).toBe("text/plain")
  expect(getFileContentType("app.d.ts")).toBe("text/plain")
})

it("gets a content type of text/plain for .flow files", () => {
  expect(getFileContentType("app.js.flow")).toBe("text/plain")
})
