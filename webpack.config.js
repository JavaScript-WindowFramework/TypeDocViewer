const path = require('path');

module.exports = {
	module: {
		rules: [
			{
				test: /\.(ts|tsx)$/,
				use:['ts-loader']
			},
			{
				test: /\.(scss|css)$/,
				use: ['style-loader','css-loader','sass-loader']
			}
		]
	},
	entry: [
		path.resolve(__dirname, 'src/index.ts')
	],
	output: {
		filename: 'bundle.js'
	},
	resolve: {
		extensions: ['.ts', '.js', '.scss'],
	},
	mode: 'production',
	devtool: "source-map",
	devServer: {
		contentBase: path.join(__dirname, 'dist'),
		inline: true,
		host: "0.0.0.0"
	}
};
