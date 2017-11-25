const isBareModuleIdentifier = require("../isBareModuleIdentifier")

describe("isBareModuleIdentifier", () => {
  it("returns true for bare module identifiers", () => {
    expect(isBareModuleIdentifier("react")).toBe(true)
    expect(isBareModuleIdentifier("react-dom")).toBe(true)
    expect(isBareModuleIdentifier("react-dom/server")).toBe(true)
  })

  it("returns false for non-bare module identifiers", () => {
    expect(isBareModuleIdentifier("/absolute-path")).toBe(false)
    expect(isBareModuleIdentifier("./relative-path")).toBe(false)
    expect(isBareModuleIdentifier("//www.example.com/script.js")).toBe(false)
    expect(isBareModuleIdentifier("https://www.example.com/script.js")).toBe(false)
  })
})
