const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');

module.exports = {
	entry: './src/static/index.js',
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'dist'),
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env'],
					},
				},
			},
			{
				test: /\.css$/,
				use: [MiniCssExtractPlugin.loader, 'css-loader'],
				include: path.resolve(__dirname, 'src/static'),
				resolve: {
					alias: {
						'css-loader': require.resolve('css-loader'),
					},
				},
			},
		],
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: 'styles.css',
		}),
		new HtmlWebpackPlugin({
			template: './src/index.html',
			filename: 'index.html',
			minify: {
				removeStyleLinkTypeAttributes: true,
				removeScriptTypeAttributes: true,
				removeRedundantAttributes: true,
				collapseWhitespace: true,
				useShortDoctype: true,
				removeComments: true,
			},
		}),
		new FaviconsWebpackPlugin({
			logo: './src/static/DankG.png',
			favicons: {
				appName: 'Vanity Tester',
				appDescription: 'Try colors, paints and badges on your Twitch user',
				developerName: 'ZonianMidian',
				start_url: '/',
				icons: {
					appleStartup: false,
				},
			},
		}),
	],
	optimization: {
		minimize: true,
		minimizer: [
			new TerserPlugin({
				terserOptions: {
					format: {
						comments: false,
					},
				},
				extractComments: false,
			}),
			new CssMinimizerPlugin(),
		],
	},
};
