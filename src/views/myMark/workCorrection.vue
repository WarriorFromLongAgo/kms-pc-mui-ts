<template>
	<div class="homepage">
		<div class="main">
			<!-- 面包屑导航 -->
			<div class="crumbs">
				<el-breadcrumb separator="/">
					<el-breadcrumb-item :to="{ path: '/markIndex' }">我的批改</el-breadcrumb-item>
					<el-breadcrumb-item>作业批改</el-breadcrumb-item>
				</el-breadcrumb>
				<el-divider></el-divider>
			</div>
			<div class="header">
				<div class="work">
					<div class="work_top">
						<span class="source" style="font-size:14px"> 作业来源:{{ correctionDetails.source }} </span>
						<span class="time" style="font-size:12px">
							起止时间: {{ correctionDetails.beginDate }} 至 {{ correctionDetails.endDate }}
						</span>
					</div>
					<div class="work_title">
						<h3 class="">{{ correctionDetails.homeWorkName }}</h3>
						<!-- <p>{{ homeWorkDescribe }}</p> -->
						<pre v-html="homeWorkDescribe" class="preText"></pre>
					</div>
					<!--  v-if="correctionDetails.homeworkFileList.length !== 0" -->
					<div class="enclosure" v-if="isShowDom1">
						<p>附件:</p>
						<ul>
							<li v-for="(item, index) in correctionDetails.homeworkFileList" :key="index">
								<i class="el-icon-paperclip"></i>
								<a class="name" :href="$global().imgHost + item.filePath" :download="item.fileName">{{
									item.fileName
								}}</a>
							</li>
						</ul>
					</div>
				</div>
			</div>
			<div class="studentAnswers">
				<h2>学员回答</h2>
				<div class="portrait">
					<div class="portrait_left">
						<div><el-avatar shape="circle" :src="circleUrl" :size="40"></el-avatar></div>
						<span class="name">{{ correctionDetails.userName }}</span>
						<span class="name">{{ userId }}</span>
					</div>
					<div class="portrait_right">
						{{ correctionDetails.answerTime }}
					</div>
				</div>
				<!-- 回答富文本 -->
				<div class="fatherRcih" style="padding-bottom:20px">
					<div
						ref="textInfo"
						:class="
							'fatherHeight ' +
								(isHomeworkInfoOverFlow ? (showHomeworkAll ? 'showAll' : 'ellipsis-3') : '')
						"
					>
						<pre
							v-html="answerContent"
							class="text-are"
							ref="textCont"
							style="font-family: 'Microsoft YaHei Regular', 'Microsoft YaHei';"
						></pre>
					</div>
					<div @click="showHomeworkInfoAll" v-if="isHomeworkInfoOverFlow">
						<p class="open" v-if="!showHomeworkAll">展开</p>
						<p class="close" v-if="showHomeworkAll">收起</p>
					</div>
				</div>
				<!-- 如果图片列表没有图就把展示图片的dom结构隐藏 -->
				<div class="tuList" v-if="imgList.length !== 0">
					<div class="tuListK" v-for="(item, index) in imgList" :key="index">
						<img :src="$global().imgHost + item.src" alt="" preview="0" />
					</div>
				</div>
				<!--isShowDom2判断    本来用correctionDetails.answerFileList.length 来判断附件dom显示隐藏，但是有length报错  -->
				<div class="enclosure" v-if="isShowDom2">
					<p>附件:</p>
					<ul>
						<li v-for="(item, index) in correctionDetails.answerFileList" :key="index">
							<i class="el-icon-paperclip"></i>
							<a :href="$global().imgHost + item.filePath" :download="item.fileName" class="name">{{
								item.fileName
							}}</a>
						</li>
					</ul>
				</div>
			</div>
		</div>
		<div class="comment">
			<div class="mycomment" v-if="show">
				<p>我的评语</p>
				<div class="status">
					<span>状态: {{ this.statusWord }}</span>
					<span class="btnEdior" v-show="showBtnEdior" @click="changeEdior">编辑</span>
					<div class="imghistory" v-show="showImg">
						<img src="../../assets/imgs/history.png" />
					</div>
				</div>
				<!-- v-if="correctionDetails.correctContent !== null" -->
				<div class="content1">
					<pre
						class="preText"
						v-html="correctionDetails.correctContent"
						style="font-family: 'Microsoft YaHei Regular', 'Microsoft YaHei';font-size:14px"
					></pre>
				</div>
				<div class="time">
					{{ correctionDetails.correctTime }}
				</div>
			</div>

			<div v-else class="mycomment">
				<p>我的评语</p>
				<div class="radioGroup">
					<el-radio-group v-model="radio" text-color="#333" fill="#1678ff">
						<el-radio :label="3">通过</el-radio>
						<el-radio :label="4">未通过</el-radio>
					</el-radio-group>
				</div>
				<div class="textBorder">
					<textarea
						name=""
						id=""
						placeholder="评语无草稿实时保存功能，请注意做好备份"
						maxlength="10000"
						v-model="desc"
						ref="textValue"
					></textarea>
					<div class="word">{{ remnant }}/10000</div>
				</div>
				<div class="btn">
					<el-button class="send comm" :plain="true" @click="sendInfo">提交</el-button>
					<!-- <div class="trips">评语提交后无法修改，请慎重检查。</div> -->
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import sfTrackEventMap from '@/assets/js/SfTrackEventMap';
import textOverFlow from '@/assets/js/textOverFlow';
import { ref, reactive, toRefs, watch } from '@vue/composition-api';
import Qs from 'qs';
import { cellCallbackParams } from 'element-ui/types/table';
let that: any;

export default {
	setup(props: any, { root }: any) {
		that = root;
		const state: any = reactive({
			circleUrl: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png', // 学员头像
			show: true, // 显示评语 还是显示textarea
			radio: '', // 单选选中
			remnant: 0, // 当前输入的字数
			desc: '', // textarea的初始值
			correctionDetails: {}, // 初始批改作业数据
			answerContent: '', // 回答的内容
			imgList: [], // 图片列表a
			homeWorkDescribe: '', // 作业问题描述
			status: '', // 初始化审批状态  2:待审批 3:通过 4:不通过
			statusWord: '', // 显示是通过还是不通过状态文字
			showBtnEdior: false, // 编辑按钮显示隐藏
			showImg: false, // 历史图标
			userId: '', // 用户id
			answer_id: '', // 答案id
			supervisorId: '', // 导师id
			isHomeworkInfoOverFlow: false, // 作业详情是否需要显示展开按钮
			showHomeworkAll: false, //  作业详情是否显示所有
			commentValue: '', // 评语是否存在
			isShowDom1: true, //  判断 作业附件的长度是否为0
			isShowDom2: true, //  判断 回答附件的长度是否为0
		});

		// 监听textarea的值变化
		watch(
			() => state.desc,
			(desc, prevDesc) => {
				if (prevDesc !== '') {
					state.remnant = state.desc.trim().length;
				}
			},
		);

		// 获取批改详情页的数据
		const getCorrectionDetails = async (): Promise<void> => {
			const { data: res } = await root.$http.get('/correctDetail', {
				params: {
					// userIdForLogin: '01394298',
					userId: state.userId,
					sourceId: state.sourceId,
					homeWorkId: state.homeWorkId,
					supervisorId: state.supervisorId,
				},
			});
			if (res.status === 100) {
				root.$confirm(res.errorMessage, '提示', {
					confirmButtonText: '确定',
					// cancelButtonText: '取消',
					type: 'warning',
					showCancelButton: false,
					showClose: false,
				})
					.then(() => {
						root.$router.push('/markIndex');
					})
					.catch();
			}
			state.correctionDetails = res.data;
			// 回答问题的id
			state.answer_id = state.correctionDetails.answerId;
			// 学院头像
			state.circleUrl = root.$global().sfAvatar + state.correctionDetails.userImage + '.jpg';
			// 判断附件是否存在 不存在就隐藏dom
			root.$nextTick(() => {
				if (Number(state.correctionDetails.answerFileList.length) === 0) {
					state.isShowDom2 = false;
				}
				if (Number(state.correctionDetails.homeworkFileList.length) === 0) {
					state.isShowDom1 = false;
				}
			});
			// 从富文本里筛选出图片，图片存到imgList,文本存到answerContent3
			if (res.data.contentRichText !== null) {
				res.data.contentRichText.map((item: { type: string; text: string }, index: number) => {
					if (item.type === 'image') {
						state.imgList.push(item);
						root.$nextTick(() => {
							root.$previewRefresh(); // 异步事件处理图片点击预览问题
						});
					} else {
						state.answerContent += item.text;
					}
					root.$nextTick(() => {
						const neetHid = textOverFlow(root.$refs.textInfo, root.$refs.textCont);
						state.isShowbtn = neetHid;
						state.isHomeworkInfoOverFlow = neetHid;
					});
				});
			}
			// 从富文本homeWorkDescribeRichText 里找到作业描述
			if (res.data.homeWorkDescribeRichText !== null) {
				res.data.homeWorkDescribeRichText.map((item: { type: string; text: string }, index: number) => {
					if (item.type === 'text') {
						state.homeWorkDescribe += item.text;
					}
				});
			}
			// 判断是不是历史批改 1是 把图标显示，编辑按钮隐藏。 2反之
			if (state.correctionDetails.isHistoryCorrect === '1') {
				state.showImg = true;
				state.showBtnEdior = false;
			} else if (state.correctionDetails.isHistoryCorrect === '0') {
				state.showBtnEdior = true;
			}
			// 根据接口字段 3是 通过。 4是不通过。 当status为2是待审批，这里有两种情况，1.评语为空，则显示输入评语框。反之就是进入待审批那个界面
			if (state.correctionDetails.status === '3') {
				state.statusWord = '通过';
				state.showBtnEdior = false;
			} else if (state.correctionDetails.status === '4') {
				state.statusWord = ' 不通过';
				state.showBtnEdior = false;
			} else if (
				state.correctionDetails.status === '2' &&
				(state.correctionDetails.correctContent === '' || state.correctionDetails.correctContent == null)
			) {
				state.show = false;
			} else if (state.correctionDetails.status === '2' && state.correctionDetails.correctContent !== '') {
				state.statusWord = '待批改';
				state.showBtnEdior = true;
				// this.show = false
			}
		};

		// 提交评语
		const submitComments = async (): Promise<void> => {
			const params = {
				supervisorId: state.supervisorId,
				id: state.answer_id,
				status: state.radio,
				// 去除首尾空格
				correctContent: state.desc.replace(/(^\s*)|(\s*$)/g, ''),
			};
			const { data: res } = await root.$http.post('correct/submit', Qs.stringify(params), {
				headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
			});

			if (res.status === 0) {
				root.$message.error(res.errorMessage);
			} else if (res.status === 1) {
				// 评语提交埋点
				const { homeworkName } = JSON.parse(sessionStorage.getItem('queryValue')!);
				root.$SfTrackEvent(sfTrackEventMap.submitRemark, { homeworkName });
				root.$message({
					type: 'success',
					message: '提交成功!',
				});
				// 成功的时候会再次调用此接口，更新页面数据
				state.show = true;
				state.correctionDetails = [];
				state.imgList = [];
				state.isHomeworkInfoOverFlow = false; // 初始化弹框
				state.showHomeworkAll = false; // 初始化 展开显示
				getCorrectionDetails();
			}
		};

		// 点击确认是否提交
		const sendInfo = (): void => {
			if (state.desc !== '' && (state.radio === 3 || state.radio === 4)) {
				root.$confirm('提交后不可修改，是否继续提交？', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning',
				})
					.then(() => {
						submitComments();
					})
					.catch(() => {
						root.$message({
							type: 'info',
							message: '已取消提交',
						});
					});
			} else if (state.desc === '') {
				root.$message({
					message: '您没有填写评语！',
					type: 'error',
				});
			} else if (state.radio !== 3 || state.radio !== 4) {
				root.$message({
					message: '您没有设置是否通过！',
					type: 'error',
				});
			}
		};

		// 点击编辑  如果textarea里面有输入内容，那么下次就要把textarea赋值进去
		const changeEdior = (): void => {
			state.show = false;
			state.desc = state.correctionDetails.correctContent;
		};

		// 点击展开收起
		const showHomeworkInfoAll = (): void => {
			state.showHomeworkAll = !state.showHomeworkAll;
		};

		// 获取到路由元参数 homeWorkId，userId，sourceId，supervisorId
		const queryValue = JSON.parse(sessionStorage.getItem('queryValue')!);
		state.homeWorkId = queryValue.homeWorkId;
		state.userId = queryValue.userId;
		state.sourceId = queryValue.sourceId;
		state.supervisorId = queryValue.supervisorId;

		// 获取批改作业数据
		getCorrectionDetails();

		return {
			...toRefs(state),
			watch,
			getCorrectionDetails,
			submitComments,
			sendInfo,
			changeEdior,
			showHomeworkInfoAll,
		};
	},
	// 墙提醒  如果文本框里没有内容，也没有勾选，就不拦截。反之
	beforeRouteLeave(to: object, from: {path: string}, next: CallableFunction) {
		if (!that.show) {
			if (that.desc !== '' || that.radio) {
				that.$confirm('内容将不会保存, 是否继续?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning',
					closeOnHashChange: false,
				})
					.then(() => {
						next();
					})
					.catch(() => {
						next();
						that.$message({
							type: 'info',
							message: '已取消返回',
						});
					});
			} else {
				next();
			}
		} else {
			next();
		}
	},
	beforeRouteEnter(to: object, from: {path: string}, next: CallableFunction) {
		next((vm: object) => {
			if (from.path === '/') return false;
			// 访问批改详情的埋点信息
			const { homeworkName } = JSON.parse(sessionStorage.getItem('queryValue')!);
			that.$SfTrackEvent(sfTrackEventMap.correctDetailNav, {
				page_ref: that.$global().host + from.path.slice(1),
				homeworkName,
			});
		});
	},
};
</script>

<style lang="less" scoped>
.homepage {
	.main {
		margin: 0 auto 0;
		position: relative;
		width: 940px;
		padding-bottom: 40px;
		background-color: #fff;
		/deep/ .el-breadcrumb__inner.is-link {
			font-weight: normal !important;
		}
		/deep/ .el-breadcrumb {
			font-size: 12px !important;
		}
		/deep/ .crumbs .is-link {
			color: #1678ff !important;
		}
		/deep/ .el-breadcrumb__inner.is-link :hover {
			font-weight: normal !important;
		}
		.crumbs {
			padding: 50px 0 0px 0;
			line-height: 20px;
			font-size: 14px;
			.crumbs_mytitle {
				color: #999;
				padding-right: 12px;
				cursor: pointer;
			}
			/deep/ .el-breadcrumb {
				padding-left: 70px;
			}
			/deep/ .is-link {
				font-weight: bold;
			}
		}
		.header {
			padding: 0 138px 0 70px;
			border-bottom: 1px solid #eee;
			.work {
				margin-top: 20px;
				.work_top {
					color: #999;
					display: flex;
					justify-content: space-between;
					source {
						font-size: 14px !important;
					}
					time {
						font-size: 12px !important;
					}
				}
				.work_title {
					h3 {
						color: #333;
						font-size: 14px;
						font-weight: bold;
						padding: 30px 0 15px 0;
					}
					.preText {
						font-size: 14px;
						white-space: pre-wrap; /* css-3 */
						white-space: -moz-pre-wrap; /* Mozilla, since 1999 */
						white-space: -pre-wrap; /* Opera 4-6 */
						white-space: -o-pre-wrap; /* Opera 7 */
						word-wrap: break-word;
						color: #666;
						font-family: 'Microsoft YaHei Regular', 'Microsoft YaHei';
						padding-bottom: 15px;
					}
				}
			}
		}
		.enclosure {
			margin: 15px 0 0 0;
			p {
				font-size: 14px;
				margin-top: 15px;
				color: #333;
			}
			ul {
				overflow: hidden;
				margin-top: 15px;
				margin-bottom: 30px;
				font-size: 16px;
				li {
					cursor: pointer;
					color: #1678ff;
					float: left;
					margin-right: 30px;

					i {
						font-weight: bold;
						padding-right: 4px;
					}
					.name {
						font-size: 14px;
					}
				}
			}
		}
		.studentAnswers {
			padding: 0 138px 0 70px;
			h2 {
				font-size: 16px;
				margin-top: 30px;
				color: #333;
			}
			.portrait {
				margin-top: 20px;
				margin-bottom: 20px;
				overflow: hidden;
				font-size: 14px;
				display: flex;
				align-items: center;
				justify-content: space-between;
				.portrait_left {
					display: flex;
					align-items: center;
					float: left;
					color: #333;
					font-size: 16px;
					.name {
						padding-left: 20px;
					}
					img {
						width: 4px;
						height: 40px;
						border-radius: 50%;
						background: red;
					}
				}
				.portrait_right {
					float: right;
					font-size: 12px;
					color: #999;
				}
			}
			.ellipsis-3 {
				overflow: hidden;
				text-overflow: ellipsis;
				-webkit-box-orient: vertical;
				display: -webkit-box;
				-webkit-line-clamp: 8;
				word-wrap: break-word;
				word-break: break-all;
				white-space: normal !important;
			}
			.showAll {
				max-height: unset !important;
			}
			// 折叠展开
			.fatherHeight {
				max-height: 199px;
				position: relative;
				.text-are {
					font-size: 14px;
					color: #333;
					line-height: 2;
					white-space: pre-wrap; /* css-3 */
					white-space: -moz-pre-wrap; /* Mozilla, since 1999 */
					white-space: -pre-wrap; /* Opera 4-6 */
					white-space: -o-pre-wrap; /* Opera 7 */
					word-wrap: break-word;
				}
			}
			.open {
				background: #fff;
				width: 100%;
				margin-top: 2px;
				font-size: 12px;
				color: #1678ff;
				cursor: pointer;
				box-sizing: border-box;
			}
			.close {
				cursor: pointer;
				color: #1678ff;
				font-size: 12px;
			}
			// 折叠展开
			.tuList {
				margin: 7px 0;
				overflow: hidden;
				.tuListK {
					justify-content: space-around;
					display: flex;
					align-items: center;
					box-sizing: border-box;
					width: 68px;
					height: 68px;
					border-radius: 5px;
					border: 1px solid #eee;
					margin-right: 7px;
					float: left;
					img {
						width: 100%;
						height: auto;
						flex: 1;
					}
				}
				:last-child {
					margin-right: 0;
				}
			}
		}
	}
	.comment {
		background: #fff;
		width: 940px;
		margin: 20px auto 0;
		position: relative;
		padding-bottom: 20px;
		.mycomment {
			overflow: hidden;
			p {
				font-size: 16px;
				color: #333;
				font-weight: bold;
				border-bottom: 1px solid #eee;
				padding: 50px 138px 30px 70px;
			}
			.status {
				position: relative;
				color: #999;
				font-size: 14px;
				padding: 30px 138px 0px 70px;
				display: flex;
				justify-content: space-between;
				align-items: center;
				.btnEdior {
					color: #fff;
					background: #1678ff;
					width: 72px;
					height: 30px;
					border-radius: 30px;
					text-align: center;
					line-height: 30px;
					cursor: pointer;
				}
				.imghistory {
					position: absolute;
					right: 138px;
					top: 12px;
					width: 81px;
					height: 54px;
					img {
						width: 100%;
						height: 100%;
					}
				}
			}
			.content1 {
				font-size: 14px;
				padding: 30px 138px 10px 70px;
				line-height: 24px;
				.preText {
					white-space: pre-wrap; /* css-3 */
					white-space: -moz-pre-wrap; /* Mozilla, since 1999 */
					white-space: -pre-wrap; /* Opera 4-6 */
					white-space: -o-pre-wrap; /* Opera 7 */
					word-wrap: break-word;
				}
			}
			.time {
				float: right;
				padding: 0px 138px 10px 70px;
				color: #999;
				font-size: 12px;
			}

			.radioGroup {
				padding: 30px 138px 30px 70px;
				/deep/.el-radio {
					.el-radio__input.is-checked + .el-radio__label {
						font-weight: bold;
					}
					&:hover {
						.el-radio__label {
							color: #1678ff !important;
						}
						.el-radio__inner {
							border-color: #1678ff;
						}
					}
					.el-radio__label {
						font-size: 14px !important;
					}
					.el-radio__input {
						margin-bottom: px(5);
						&.is-checked {
							.el-radio__inner {
								background-color: #fff;
								border-color: #1678ff;
								&:after {
									width: 8px;
									height: 8px;
									background-color: #1678ff;
								}
								.el-radio__label {
									color: #1678ff !important;
								}
							}
						}
					}
				}
			}
			.textBorder {
				margin: 0px 138px 30px 70px;
				border: 1px solid #ccc;
				border-radius: 5px;
				height: 230px;
				textarea {
					height: 206px;
					width: 99%;
					margin-left: 0.5%;
					border: none;
					font-size: 14px;
					color: #666;
					outline: none;
					line-height: 28px;
					padding: 10px;
					box-sizing: border-box;
				}
				.word {
					text-align: right;
					color: #ccc;
					font-size: 14px;
					margin-right: 10px;
				}
			}
			.btn {
				margin: 30px 138px 30px 70px;
				overflow: hidden;
				.comm {
					width: 90px;
					height: 40px;
					border-radius: 20px;
					background: #fff;
					text-align: center;
					line-height: #ef984e;
					border: 1px solid #1678ff;
					color: #1678ff;
					float: left;
					margin-right: 30px;
					cursor: pointer;
					&:hover {
						background: #1678ff;
						color: #fff;
					}
				}
				.trips {
					font-size: 12px;
					line-height: 40px;
					color: #999;
				}
			}
		}
	}
	a {
		color: #1678ff;
	}
	a:hover {
		color: #1678ff;
	}
	/deep/ .el-radio__input.is-checked + .el-radio__label {
		color: #1678ff !important;
	}
}
</style>
