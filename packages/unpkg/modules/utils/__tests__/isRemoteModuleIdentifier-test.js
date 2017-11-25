const isRemoteModuleIdentifier = require("../isRemoteModuleIdentifier")

describe("isRemoteModuleIdentifier", () => {
  it("returns false for local module identifiers", () => {
    expect(isRemoteModuleIdentifier("/absolute-path")).toBe(false)
    expect(isRemoteModuleIdentifier("./relative-path")).toBe(false)
  })

  it("returns true for remote module identifiers", () => {
    expect(isRemoteModuleIdentifier("https://www.example.com/script.js")).toBe(true)
    expect(isRemoteModuleIdentifier("//www.example.com/script.js")).toBe(true)
  })

  it("returns false for bare module identifiers", () => {
    expect(isRemoteModuleIdentifier("react")).toBe(false)
    expect(isRemoteModuleIdentifier("react-dom")).toBe(false)
    expect(isRemoteModuleIdentifier("react-dom/server")).toBe(false)
  })
})
