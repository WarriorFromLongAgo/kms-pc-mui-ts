<template>
	<div id="main" :class="isKeepSideTop ? 'keepSide' : ''">
		<el-container>
			<el-header>
				<div class="header-main">
					<img src="../assets/imgs/logo.png" class="logo fl" alt="返回首页" />
					<div class="user_login fr clearfix">
						<div class="avatar-box fl">
							<img :src="$global().sfAvatar + userInfo.headPath + '.jpg'" />
						</div>
						<p class="fl">{{ userInfo.userName + '（' + userInfo.userId + '）' }}</p>
						<img src="../assets/imgs/putDown.png" class="fl user-more" />
						<div class="logoutCss" @click="logout">
							<p>退出</p>
						</div>
					</div>
				</div>
			</el-header>
			<el-container class="content">
				<div class="user-info clearfix">
					<div class="user-detail fl">
						<div class="big-avatar-box">
							<img :src="$global().sfAvatar + userInfo.headPath + '.jpg'" />
						</div>
						<h1>{{ userInfo.userName }}</h1>
						<p>{{ userInfo.userId }}</p>
					</div>
					<div class="learn-time-count fl">
						<div class="show-time-detail">
							<span class="time-number" v-if="parseInt(userInfo.studyTime / 3600) != 0">{{
								parseInt(userInfo.studyTime / 3600)
							}}</span>
							<span class="time-text" v-if="parseInt(userInfo.studyTime / 3600) != 0">小时</span>
							<span class="time-number">{{ Math.ceil((userInfo.studyTime % 3600) / 60) }}</span>
							<span class="time-text">分钟</span>
						</div>
						<div class="learn-label">学习时长</div>
					</div>
					<div class="my-class fl">
						<div class="show-class-detail">
							<span class="time-number">{{ userInfo.studyCourse }}</span>
						</div>
						<div class="class-label">我的课程</div>
					</div>
				</div>
				<div class="clearfix body-box">
					<div class="fl aside-box">
						<div
							class="aside-item"
							v-for="(item, index) in asideList"
							:key="index"
							:class="$route.path.match(item.path) ? 'active' : ''"
						>
							<router-link :to="item.routerPath" class="aside-item-route-box">
								<img :src="item.img" class="default-img" />
								<img :src="item.imgWhite" class="hover-img" />
								<p>{{ item.name }}</p>
								<em></em>
							</router-link>
						</div>
					</div>
					<div class="clearfix main-box fr">
						<keep-alive>
							<router-view v-if="$route.meta.keepAlive" />
						</keep-alive>
						<router-view v-if="!$route.meta.keepAlive" />
					</div>
				</div>
			</el-container>
		</el-container>
		<el-backtop class="toTop"></el-backtop>
	</div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { ref, reactive, toRefs } from '@vue/composition-api';

@Component({
	setup(props: any, context: any) {
		// 声明一个that，指向vue原型，取代vue2中的this
		const that = context.parent;
		// 注册变量为响应式，对应vue中data的内容
		// reactive接收一个普通对象然后返回该普通对象的响应式代理。等同于 2.x 的 Vue.observable()
		const state: any = reactive({
			mainTop: 220, //  main区域距离顶部的高度（由paddingtop：60和userDetail部分的高度加margin组成）
			isKeepSideTop: false, //  是否固定侧边栏
			userInfo: {}, //  用户信息
			myHomeworkItem: {
				name: '我的作业',
				img: require('../assets/imgs/myHomework.png'),
				imgWhite: require('../assets/imgs/myHomeworkSelect.png'),
				routerPath: '/homeWorkIndex',
				path: '/homeWork',
			},
			myReviseItem: {
				name: '我的批改',
				img: require('../assets/imgs/correction.png'),
				imgWhite: require('../assets/imgs/correctionSelect.png'),
				routerPath: '/markIndex',
				path: '/mark',
			},
			myClassItem: {
				name: '我的班级',
				img: require('../assets/imgs/myClass.png'),
				imgWhite: require('../assets/imgs/myClassSelect.png'),
				routerPath: '/myclassroom',
				path: '/myclassroom',
			},
			asideList: [
				//  侧边栏项目列表
			],
		});

		// 登录
		const login = async () => {
			const res = await that.$http.get('user/loginUrl');
			// 返回401即是未登录，重定向去登录界面
			if (res.data.data === 401) {
				document.location.href = that.$global().host + 'user/redirect';
			}
		};

		// 登出
		const logout = () => {
			window.location.href = that.host + 'user/logout';
		};

		// 获取用户信息并且存到vuex里的userInfo中，其他页面可以通过this.$store.state.userInfo获取
		const getUserInfo = async () => {
			const { data: res } = await that.$http.get('index/train/userinfo');
			//  判断是否获取成功
			if (res.status === 1) {
				that.$store.commit('setUserInfo', res.data);
				state.userInfo = res.data;
				//  根据是否有导师身份决定侧边栏是否含有批改选项
				//  根据接口文档，返回的身份信息将会装在roleStr里，用,隔开的一个字符串，学员权限1班主任权限2导师权限3
				if (/3/.test(res.data.roleStr)) {
					state.asideList.push(state.myHomeworkItem, state.myReviseItem, state.myClassItem);
				} else {
					state.asideList.push(state.myHomeworkItem, state.myClassItem);
				}
			} else {
				alert('获取用户信息失败');
			}
		};

		//  调用登录方法
		login();

		//  调用获取用户信息方法
		getUserInfo();

		return {
			...toRefs(state),
			logout,
		};
	},
})

export default class Main extends Vue {}
</script>
<style lang="less" scope>
@titleColor: #1678ff;
@boxShadow: 0 2px 2px rgba(22, 120, 255, 0.1);
@borderRadius: 8px;
@selectBackground: #ebf4ff;
.el-header {
	width: 100%;
	background: white;
	padding: 0;
	position: fixed;
	top: 0;
	left: 0;
	z-index: 1000;
	.header-main {
		width: 1180px;
		height: 100%;
		margin-left: calc(~'(100% - 1180px) / 2');
		.logo {
			float: left;
			height: 36px;
			margin-top: 12px;
		}
		.user_login:hover {
			.logoutCss {
				opacity: 1;
				pointer-events: auto;
				bottom: -30px;
			}
		}
		.user_login {
			height: 100%;
			position: relative;
			.logoutCss:before {
				position: absolute;
				content: '';
				width: 10px;
				height: 10px;
				border-radius: 3px;
				transform: rotate(135deg);
				box-shadow: 0 0px 10px rgba(199, 199, 199, 0.3);
				right: 13px;
				z-index: 10;
				top: -5px;
				background: white;
			}
			.logoutCss {
				position: absolute;
				right: 0;
				height: 30px;
				width: 100px;
				background: white;
				text-align: center;
				color: @titleColor;
				//background: #fbfbfb;
				font-size: 15px;
				bottom: -40px;
				box-shadow: 0 0px 10px rgba(199, 199, 199, 0.3);
				border-radius: 3px;
				cursor: pointer;
				opacity: 0;
				pointer-events: none;
				transition: all 0.5s;
				z-index: 20;
				p {
					width: 100%;
					height: 100%;
					position: relative;
					z-index: 20;
					background: white;
					line-height: 30px;
				}
			}
			.avatar-box {
				width: 30px;
				height: 30px;
				border-radius: 15px;
				margin-top: 15px;
				overflow: hidden;
				img {
					width: 100%;
					-height: 100%;
				}
			}
			p {
				height: 60px;
				line-height: 70px;
				color: @titleColor;
				font-size: 14px;
				margin-left: 5px;
			}
			.user-more {
				width: 20px;
				margin-top: 24px;
				cursor: pointer;
			}
		}
	}
}
.content {
	width: 1180px;
	margin-left: calc(~'(100% - 1180px) / 2');
	padding-top: 60px;
	flex-wrap: wrap;
	.user-info {
		width: 1180px;
		height: 240px;
		.user-detail {
			width: 220px;
			height: 200px;
			margin-top: 20px;
			border-radius: @borderRadius;
			overflow: hidden;
			background: white;
			box-shadow: @boxShadow;
			.big-avatar-box {
				width: 80px;
				height: 80px;
				margin-top: 30px;
				margin-left: 70px;
				border-radius: 50%;
				overflow: hidden;
				img {
					width: 100%;
					height: 100%;
				}
			}
			h1 {
				width: 100%;
				height: 20px;
				line-height: 20px;
				font-size: 16px;
				margin-top: 8px;
				font-weight: 500;
				color: #1678ff;
				text-align: center;
			}
			p {
				width: 100%;
				color: #666;
				text-align: center;
				font-size: 16px;
				height: 20px;
				line-height: 20px;
				margin-top: 6px;
			}
		}
		.learn-time-count,
		.my-class {
			width: 460px;
			height: 200px;
			margin-top: 20px;
			margin-left: 20px;
			border-radius: @borderRadius;
			overflow: hidden;
			background: white;
			box-shadow: @boxShadow;
			.show-class-detail,
			.show-time-detail {
				width: 100%;
				height: 50px;
				text-align: center;
				margin-top: 60px;
				span {
					display: inline-block;
					height: 50px;
					padding: 0 4px;
				}
				.time-number {
					line-height: 50px;
					font-size: 22px;
					font-weight: bold;
					color: @titleColor;
				}
				.time-text {
					font-size: 16px;
					color: #333;
					line-height: 50px;
				}
			}
			.learn-label,
			.class-label {
				width: 100%;
				height: 20px;
				line-height: 20px;
				font-size: 16px;
				margin-top: 30px;
				text-align: center;
			}
		}
	}
	.body-box {
		width: 100%;
		height: auto;
	}
	.aside-box {
		width: 220px;
		background: white;
		border-radius: @borderRadius;
		padding-top: 30px;
		height: calc(~'100% - 130px');
		box-shadow: @boxShadow;
		min-height: calc(~'100% - 210px');
		.aside-item {
			width: 100%;
			height: 60px;
			border: 1px solid #fbfbfb;
			box-sizing: border-box;
			.aside-item-route-box {
				display: block;
				width: 100%;
				height: 100%;
				line-height: 60px;
				text-align: center;
				position: relative;
				img,
				p {
					display: inline-block;
					height: 20px;
					line-height: 20px;
					font-size: 16px;
				}
				p {
					margin-left: 15px;
					color: #333;
				}
				img {
					margin-bottom: -4px;
				}
				img.hover-img {
					display: none;
				}
				em {
					position: absolute;
					width: 0;
					height: 0;
					top: 0;
					bottom: 0;
					right: -3px;
					margin: auto;
				}
			}
		}
		.aside-item:hover {
			background: @selectBackground;
			.aside-item-route-box {
				p {
					color: @titleColor;
					font-weight: bold;
				}
				img.default-img {
					display: none;
				}
				img.hover-img {
					display: inline-block;
				}
				em {
					height: 100%;
					width: 4px;
					background: @titleColor;
				}
			}
		}
		.active {
			background: @selectBackground;
			.aside-item-route-box {
				p {
					color: @titleColor;
					font-weight: bold;
				}
				em {
					height: 100%;
					width: 4px;
					background: @titleColor;
				}
				img.default-img {
					display: none;
				}
				img.hover-img {
					display: inline-block;
				}
			}
		}
	}
	.main-box {
		padding: 0;
		width: 940px;
		margin-top: 0;
		margin-left: 20px;
		height: auto;
		border-radius: @borderRadius;
		// background: white;
		box-shadow: @boxShadow;
		margin-bottom: 100px;
		display: block;
		min-height: calc(~'100% - 210px');
	}
}
#main.keepSide .el-header {
	border-bottom: 20px solid #f5f5f5;
	box-sizing: content-box;
}
#main.keepSide .aside-box {
	position: fixed;
	margin-top: 0;
	top: 80px;
	height: calc(~'100% - 210px');
}
.toTop:hover {
	background-image: url('../assets/imgs/toTopHover.png') !important;
}
.toTop:active {
	background-image: url('../assets/imgs/toTopClick.png') !important;
}
.el-backtop {
	box-shadow: none;
	border-radius: 0;
	background: none;
}
.toTop {
	width: 30px !important;
	height: 30px !important;
	position: fixed;
	right: 50px;
	bottom: 50px;
	z-index: 1000;
	background-image: url('../assets/imgs/toTopGray.png') !important;
	background-repeat: no-repeat;
	background-size: 100%;
	cursor: pointer;
	.el-icon-caret-top {
		display: none;
	}
}
</style>
