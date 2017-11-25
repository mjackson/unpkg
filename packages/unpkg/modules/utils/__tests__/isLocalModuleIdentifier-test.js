const isLocalModuleIdentifier = require("../isLocalModuleIdentifier")

describe("isLocalModuleIdentifier", () => {
  it("returns true for local module identifiers", () => {
    expect(isLocalModuleIdentifier("/absolute-path")).toBe(true)
    expect(isLocalModuleIdentifier("./relative-path")).toBe(true)
  })

  it("returns false for remote module identifiers", () => {
    expect(isLocalModuleIdentifier("https://www.example.com/script.js")).toBe(false)
    expect(isLocalModuleIdentifier("//www.example.com/script.js")).toBe(false)
  })

  it("returns false for bare module identifiers", () => {
    expect(isLocalModuleIdentifier("react")).toBe(false)
    expect(isLocalModuleIdentifier("react-dom")).toBe(false)
    expect(isLocalModuleIdentifier("react-dom/server")).toBe(false)
  })
})
