module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset',
	['@babel/preset-env', {
		"targets": {
			"chrome": "58",
			"ie": "11"
		}
	}]
  ]
}
