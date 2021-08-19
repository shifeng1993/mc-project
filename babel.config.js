module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  "plugins": [["import", {
    libraryName: "antd",
    libraryDirectory: "lib",   // default: lib
    style: true
  }]]
}
