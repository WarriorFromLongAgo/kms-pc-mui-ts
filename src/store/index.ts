import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const state = {
	userInfo: {}, // 用户信息
};

const mutations = {
	setUserInfo(userInfo: object) {
		state.userInfo = userInfo;
	},
};

export default new Vuex.Store({
	state,
	mutations,
});
