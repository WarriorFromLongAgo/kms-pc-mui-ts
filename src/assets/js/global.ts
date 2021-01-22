const global = (): any => {
	if (process.env.NODE_ENV === 'development') {
		return {
			imgHost: 'http://10.202.32.116:8080/KMS/',
			host: 'KMS-MSERVER/',
			sfAvatar: 'http://srs.sf-express.com/fileimage/',
		};
	} else if (process.env.NODE_ENV === 'testing') {
		return {
			imgHost: 'http://10.202.32.116:8080/KMS/',
			// host: 'http://10.203.196.91/KMS-MSERVER/',s
			host: 'http://10.202.32.116:8080/KMS-MSERVER/',
			sfAvatar: 'http://srs.sit.sf-express.com/fileimage/',
		};
	} else {
		return {
			imgHost: 'http://kms.sf-express.com/KMS/',
			host: 'http://sfedu.sf-express.com/KMS-MSERVER/',
			sfAvatar: 'http://srs.sf-express.com/fileimage/',
		};
	}
};
export default global;
