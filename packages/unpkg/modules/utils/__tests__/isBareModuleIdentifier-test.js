const isBareModuleIdentifier = require("../isBareModuleIdentifier")

describe("isBareModuleIdentifier", () => {
  it("returns false for local module identifiers", () => {
    expect(isBareModuleIdentifier("/absolute-path")).toBe(false)
    expect(isBareModuleIdentifier("./relative-path")).toBe(false)
  })

  it("returns false for remote module identifiers", () => {
    expect(isBareModuleIdentifier("https://www.example.com/script.js")).toBe(false)
    expect(isBareModuleIdentifier("//www.example.com/script.js")).toBe(false)
  })

  it("returns true for bare module identifiers", () => {
    expect(isBareModuleIdentifier("react")).toBe(true)
    expect(isBareModuleIdentifier("react-dom")).toBe(true)
    expect(isBareModuleIdentifier("react-dom/server")).toBe(true)
  })
})
