import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import axios from 'axios';
import Preview from 'vue-photo-preview';
import VueQuillEditor from 'vue-quill-editor';
import global from './assets/js/global';
import 'vue-photo-preview/dist/skin.css';
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';
import 'quill/dist/quill.bubble.css';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);

import { message } from './assets/js/resetMessage';

const options: object = {
	fullscreenEl: false,
	clickToCloseNonZoomable: true,
	tapToClose: true,
};
Vue.use(Preview, options);
Vue.use(Preview);

// 引入官方提供的vue-composition-api库
import VueCompositionApi from '@vue/composition-api';

Vue.use(VueCompositionApi);

Vue.config.productionTip = false;

Vue.prototype.$global = global;

Vue.prototype.$msgbox = ElementUI.MessageBox;
Vue.prototype.$alert = ElementUI.MessageBox.alert;
Vue.prototype.$confirm = ElementUI.MessageBox.confirm;
Vue.prototype.$prompt = ElementUI.MessageBox.prompt;
Vue.prototype.$message = ElementUI.Message;
Vue.prototype.$message = message; // //重写message提示框

axios.defaults.baseURL = process.env.VUE_APP_BASE_URL;
Vue.prototype.$http = axios;

Vue.use(VueQuillEditor);

Vue.filter('format', (value: any, arg: string) => {
	const dateFormat = (date: any, format: string) => {
		if (typeof date === 'string') {
			const mts = date.match(/(\/Date\((\d+)\)\/)/);
			if (mts && mts.length >= 3) {
				date = parseInt(mts[2], 10);
			}
		}
		date = new Date(date);
		if (!date || date.toUTCString() === 'Invalid Date') {
			return '';
		}
		const map: any = {
			M: date.getMonth() + 1, // 月份
			d: date.getDate(), // 日
			h: date.getHours(), // 小时
			m: date.getMinutes(), // 分
			s: date.getSeconds(), // 秒
			q: Math.floor((date.getMonth() + 3) / 3), // 季度
			S: date.getMilliseconds(), // 毫秒
		};
		format = format.replace(/([yMdhmsqS])+/g, (all: string, t: string) => {
			let v = map[t];
			if (v !== undefined) {
				if (all.length > 1) {
					v = '0' + v;
					v = v.substr(v.length - 2);
				}
				return v;
			} else if (t === 'y') {
				return (date.getFullYear() + '').substr(4 - all.length);
			}
			return all;
		});
		return format;
	};
	return dateFormat(value, arg);
});

/* 埋点 start */
import sfTrack from './assets/js/sfTrack.plugin';
function initTrack() {
	let url;
	if (process.env.NODE_ENV === 'testing') {
		// 远程测试外网无法访问sit地址的，暂用生产环境
		url = 'http://218.17.248.243:40021/json_data';
	} else {
		console.log('当前环境: ' + process.env.NODE_ENV);
		url = 'https://inc-ubas-sfyun.sf-express.com/json_data';
	}
	const option = {
		trackType: 'SfGather',
		sourceUrl: './js/SfGather-1.0.7.min.js',
		config: {
			app_id: 'sfedu_pc', // 测试生产的appId要单独申请
			url,
			log: true,
			product: true, // 生产需要修改成true
			customerUser: '123456',
			// uid: window.account || '0' // 用户id
		},
	};
	sfTrack()
		.init(option)
		.then((fn) => {
			Vue.prototype.$SfTrackEvent = fn;
			// console.log(fn, '埋点')
			// fn('kms_mapp_faceLogin', { userNo: window.workId }) // 保证埋点已加载好,此埋点事件有效
		})
		.catch((e) => {
			console.log(e);
		});
}

function initApp() {
	initTrack();
	new Vue({
		router,
		store,
		render: (h) => h(App),
	}).$mount('#app');
}
/* 埋点 end */

// 添加请求拦截器
axios.interceptors.request.use((config) => {
	if (config.url!.indexOf('?') > -1) {
		config.url = config.url + `&timestemp=${new Date().getTime()}`;
	} else {
		config.url = config.url + `?timestemp=${new Date().getTime()}`;
	}
	return config;
});

initApp();
