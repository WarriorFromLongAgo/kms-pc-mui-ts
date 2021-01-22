module.exports = {
	devServer: {
		proxy: {
			'/KMS-MSERVER': {
				target: 'http://10.202.4.75:8180', // target为后台请求地址
				pathRewrite: {
					'^/KMS-MSERVER': '/KMS-MSERVER',
				},
			},
		},
	},
	publicPath: './',
	assetsDir: 'static',
	parallel: false,
	transpileDependencies: [],
};
