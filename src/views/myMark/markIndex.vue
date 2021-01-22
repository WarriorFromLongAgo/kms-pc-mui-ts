<template>
	<div class="main" :style="{ padding: correctionList.length === 0 ? '0px' : '' }">
		<!-- 头部 -->
		<div v-if="correctionList.length == 0">
			<p class="noContent without">您暂时没有需要批改的作业</p>
		</div>
		<div class="" v-else>
			<div class="header clearfix">
				<h2 class="title fl">我的批改</h2>
				<el-radio-group v-model="radio" class="fr" text-color="#333" fill="#f0994e" @change="chooseHomeWork">
					<el-radio :label="1">全部</el-radio>
					<el-radio :label="2">待批改</el-radio>
					<el-radio :label="3">已批改</el-radio>
				</el-radio-group>
			</div>
			<el-divider></el-divider>

			<!-- 列表展示 -->
			<div class="wrapper" v-for="(item, index) in currentPageList" :key="index">
				<div class="homeArr clearfix">
					<div class="toptitle">
						<span class="sort">{{ (currentPage - 1) * pageSize + index + 1 }}</span>
						<!-- <h3 @click="skipToDetail(item.id, item.userId, item.sourceId, item.supervisorId)">{{ item.title }}</h3> -->
						<h3
							@click="
								skipToDetail({
									homeworkName: item.title,
									homeWorkId: item.id,
									userId: item.userId,
									sourceId: item.sourceId,
									supervisorId: item.supervisorId,
								})
							"
						>
							{{ item.title }}
						</h3>
						<p class="replyname">回答人：{{ item.userName }} {{ item.userId }}</p>
					</div>
					<span class="fl sourceStyle">来源：{{ item.sourceName }}</span>
					<span class="fr word">提交时间：{{ item.answerTime }}</span>
					<!-- {{ item.beginDate | format('yyyy-MM-dd') }} 至 {{ item.endDate | format('yyyy-MM-dd') }} -->
				</div>
				<el-divider></el-divider>
			</div>

			<!-- 分页 -->
			<el-pagination
				background
				@size-change="handleSizeChange"
				@current-change="handleCurrentChange"
				:current-page="currentPage"
				:page-sizes="[10, 20, 50, 100]"
				:page-size="pageSize"
				layout="total, sizes, prev, pager, next, jumper"
				:total="totalSize"
			>
			</el-pagination>
		</div>
	</div>
</template>

<script lang="ts">
import { ref, reactive, toRefs } from '@vue/composition-api';
export default {
	setup(props: any, { root }: any) {
		const state = reactive({
			radio: 1, // 默认选中
			homeWorkId: '', // 作业id，
			userId: '', // 学员id，
			sourceId: '', // 班级阶段 id
			supervisorId: '', // 导师id
			pageSize: 10, // 每页显示数
			startPage: 0, // 起始页
			type: 2, // 1是app 2是pc端
			currentPage: 1, // 当前页码值
			currentPageList: [], // 当前页展示的作业列表
			correctionList: [], // 初始化批改作业列表
			totalSize: 0, // 总页数
		});
		// 请求批改作业列表
		const getCorrectionList = async (): Promise<void> => {
			state.userId = root.$store.state.userId;
			const { data: res } = await root.$http.get('mystudy/correct', {
				params: {
					status: state.radio,
					pageSize: state.pageSize,
					startPage: state.startPage,
					type: 2,
				},
			});
			// 根据
			// this.correctionList = res.data
			state.currentPageList = res.data;
			state.totalSize = res.totalSize;
		};

		// 切换每页显示条数时触发
		const handleSizeChange = (val: number): void => {
			state.pageSize = val;
			getCorrectionList();
		};

		// 页码改变时触发
		const handleCurrentChange = (val: number): void => {
			// 后台接口返回的页面数是从零开始计算的，所以前端需要减1.
			state.currentPage = val;
			state.startPage = val - 1;
			getCorrectionList();
			state.startPage = 0;
		};

		// radio绑定值发生变化时触发
		const chooseHomeWork = (val: number): void => {
			state.radio = val;
			state.currentPage = 1;
			state.startPage = 0;
			getCorrectionList();
		};

		// 跳转到作业详情页
		const skipToDetail = (query: object): void => {
			sessionStorage.setItem('queryValue', JSON.stringify(query));

			root.$router.push({
				path: '/markCorrection',
				// query: oQuery
			});
		};

		// 初始化数据
		const getCorrectionList1 = async (): Promise<void> => {
			state.userId = root.$store.state.userId;
			const { data: res } = await root.$http.get('mystudy/correct', {
				params: {
					// userIdForLogin: 636611,
					status: state.radio,
					pageSize: state.pageSize,
					startPage: state.startPage,
					type: 2,
				},
			});
			state.correctionList = res.data;
		};

		getCorrectionList1();
		getCorrectionList();

		return {
			...toRefs(state),
			getCorrectionList,
			handleSizeChange,
			handleCurrentChange,
			chooseHomeWork,
			skipToDetail,
			getCorrectionList1,
		};
	},
};
</script>

<style lang="less" scoped>
.main {
	margin: 0 auto;
	padding-bottom: 90px;
	padding-top: 40px;
	position: relative;
	width: 940px;
	min-height: 80px;
	background-color: #fff;
	.without {
		background: url('../../assets/imgs/without.png') no-repeat center;
		background-size: 250px;
		padding: 50px 0;
		height: 350px;
		line-height: 620px;
		font-size: 18px;
		text-align: center;
	}
	.wrapper {
		position: relative;
		padding-top: 30px;
		&:hover {
			background-color: #ebf4ff;
			cursor: pointer;
		}
		img {
			position: absolute;
			top: 50px;
			right: 100px;
		}
	}
	.el-divider {
		background-color: #eee;
		margin: 15px 0 0 0;
	}
	.header {
		padding: 0 140px 0 50px;
		margin-bottom: 30px;
		/deep/.el-radio {
			margin-right: 0;
			margin-left: 75px;
			.el-radio__input.is-checked + .el-radio__label {
				color: #333 !important;
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
				color: #666 !important;
				font-size: 12px !important;
				// vertical-align: -3px;
			}

			.el-radio__input {
				margin-bottom: px(5);
				.el-radio__inner {
					width: 12px;
					height: 12px;
				}
				&.is-checked {
					.el-radio__inner {
						background-color: #fff;
						border-color: #1678ff;
						&:after {
							width: 6px;
							height: 6px;
							background-color: #1678ff;
						}
					}
				}
			}
		}
	}

	.el-radio-group {
		margin-top: 6px;
		display: inline-block;
		line-height: 1;
		vertical-align: middle;
		font-size: 0;
	}
	.homeArr {
		position: relative;
		padding: 0 140px 0 70px;
		// font-size: 16px;
		color: #999;
		.sort {
			position: absolute;
			top: 0;
			left: 46px;
			font-size: 14px;
			color: #333;
			margin-bottom: 0;
		}
		.sourceStyle {
			overflow: hidden;
			white-space: nowrap;
			font-size: 12px;
			max-width: 520px;
			overflow: hidden;
			text-overflow: ellipsis;
		}
		span {
			margin-bottom: 15px;
			font-size: 12px;
		}
		.toptitle {
			overflow: hidden;
			.replyname {
				font-size: 12px;
				color: #999;
				float: right;
				line-height: 2;
			}
			h3 {
				font-weight: bold;
				float: left;
				font-size: 14px;
				color: #333;
				margin-bottom: 15px;
				width: 520px;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				&:hover {
					font-weight: 700;
					color: #1678ff;
				}
			}
		}
	}
	.title {
		position: relative;
		padding-left: 16px;
		font-size: 16px;
		font-weight: bold;
		&:after {
			content: '';
			position: absolute;
			bottom: 1px;
			left: 0;
			display: block;
			width: 6px;
			height: 16px;
			background-color: #1678ff;
			border-radius: 3px;
		}
	}
}
/deep/.el-pagination {
	position: absolute;
	bottom: 30px;
	right: 65px;
	span:not([class*='suffix']) {
		font-size: 14px;
		color: #666;
	}
	button {
		font-size: 14px;
		color: #666;
	}
	.el-pagination__sizes {
		.el-input {
			.el-input__inner {
				font-size: 14px;
				color: #333;
			}
		}
	}
	&.is-background {
		.btn-next {
			background-color: #fff;
			border: 1px solid #ddd;
			color: #666;
		}
		.btn-prev {
			background-color: #fff;
			border: 1px solid #ddd;
			color: #666;
		}
		.el-pager {
			li {
				color: #666;
				font-size: 14px;
				background-color: #fff;
				border: 1px solid #ddd;
				&:not(.disabled).active {
					background-color: #1678ff;
				}
				&:not(.disabled):hover {
					background-color: #ddd;
					color: #666;
				}
			}
		}
	}
}
</style>
