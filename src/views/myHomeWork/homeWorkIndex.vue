<template>
	<div class="main" :style="{ padding: initHomeworkList.length === 0 ? '0px' : '' }">
		<div v-if="initHomeworkList.length !== 0">
			<!-- 头部 -->
			<div class="header clearfix">
				<h2 class="title fl">我的作业</h2>
				<el-radio-group v-model="radio" class="fr" text-color="#333" fill="#1678ff" @change="chooseHomeWork">
					<el-radio :label="1">全部</el-radio>
					<el-radio :label="2">未开始</el-radio>
					<el-radio :label="3">进行中</el-radio>
					<el-radio :label="4">已结束</el-radio>
				</el-radio-group>
			</div>
			<el-divider></el-divider>

			<!-- 列表展示 -->
			<div class="wrapper" v-for="(item, index) in currentPageList" :key="index">
				<img :src="icons[item.status]" alt="" />
				<div class="homeArr clearfix">
					<span class="sort">{{ (currentPage - 1) * pageNum + index + 1 }}</span>
					<h3
						@click="
							skipToDetail({
								homeworkName: item.title,
								homeWorkId: item.id,
								currentTime: item.currentTime,
								sourceType: 3,
								sourceId: item.activityId,
								beginDateUnix: item.beginDateUnix,
							})
						"
					>
						{{ item.title }}
					</h3>
					<span class="fl sourceStyle">来源：{{ item.sourceName }}</span>
					<span class="fr"
						>起止时间：{{ item.beginDate | format('yyyy-MM-dd') }} 至
						{{ item.endDate | format('yyyy-MM-dd') }}</span
					>
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
				:page-size="pageNum"
				layout="total, sizes, prev, pager, next, jumper"
				:total="totalSize"
				:pager-count="7"
			>
			</el-pagination>
		</div>
		<div class="without" v-else>
			您暂时没有需要完成的作业!
		</div>
	</div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { reactive, toRefs } from '@vue/composition-api';
import { component } from 'vue/types/umd';
@Component({
	props: {},
	setup(props: object, context: any) {
		// 声明一个that，指向vue原型，取代vue2中的this
		const that = context.parent;
		const state: any = reactive({
			homeWorkStatus: [0, 1, 2, 3, 4, 5], // 0:待完成（没有做的）1:草稿 2:待批改 3:通过 4:不通过 5:过期
			icons: [
				'',
				'',
				require('../../assets/imgs/waitMarked.png'),
				require('../../assets/imgs/passed.png'),
				require('../../assets/imgs/fail.png'),
				require('../../assets/imgs/overdue.png'),
			], // 徽章图标: 待批改,已通过,未通过,已过期
			radio: 3, // 默认选中3（1全部2未开始3进行中4已结束）
			pageNum: 10, // 每页默认显示的条数
			currentPage: 1, // 当前页码值
			totalSize: 0, // 总作业条数
			currentPageList: [], // 当前页展示的作业列表
			initHomeworkList: [], // 初始化时的作业列表
		});

		// 获取作业列表
		const getHomeworkData = async (): Promise<object> => {
			// 请求参数type:1web2app , status:1全部2未开始3进行中4已结束, startPage:起始页从0开始
			const params: object = {
				type: 1,
				pageSize: state.pageNum,
				status: state.radio,
				startPage: state.currentPage - 1,
			};
			const { data: res }: any = await that.$http.get('mystudy/job', {
				params,
			});
			state.totalSize = res.totalSize;
			state.currentPageList = res.data;
			return res.data;
		};

		// 切换每页显示条数时触发
		const handleSizeChange = (val: number): void => {
			state.pageNum = val;
			getHomeworkData();
		};

		// 页码改变时触发
		const handleCurrentChange = (val: number): void => {
			state.currentPage = val;
			getHomeworkData();
		};

		// radio绑定值发生变化时触发
		const chooseHomeWork = (val: number): void => {
			state.radio = val;
			state.currentPage = 1;
			getHomeworkData();
		};

		// 跳转到作业详情
		const skipToDetail = async (query: any): Promise<void> => {
			const { homeworkName, homeWorkId, currentTime, sourceType, sourceId, beginDateUnix } = query;
			const oQuery = { homeworkName, homeWorkId, sourceType, sourceId };

			// 作业开始时间与当前时间对比判断是否能跳转到作业详情

			if (beginDateUnix > currentTime) {
				that.$message.info('作业未开始');
			} else {
				// 将传递的参数存储到sessionStorage中
				sessionStorage.setItem('homeworkParams', JSON.stringify(oQuery));
				that.$router.push({ path: '/homeWorkDetail' });
			}
		};

		getHomeworkData().then((res: object) => (state.initHomeworkList = res));

		return {
			...toRefs(state),
			chooseHomeWork,
			handleSizeChange,
			handleCurrentChange,
			skipToDetail,
		};
	},
})
export default class HomeWorkIndex extends Vue {}
</script>

<style lang="less" scoped>
.main {
	padding-bottom: 90px;
	padding-top: 40px;
	position: relative;
	width: 940px;
	min-height: 80px;
	background-color: #fff;
	border-radius: 8px;
	.without {
		padding: 50px 0;
		height: 350px;
		line-height: 620px;
		font-size: 18px;
		text-align: center;
		background: url('../../assets/imgs/without.png') no-repeat center;
		background-size: 250px;
	}
	.wrapper {
		position: relative;
		padding-top: 30px;
		&:hover {
			background-color: #e8f2ff;
			cursor: pointer;
		}
		.sort {
			position: absolute;
			top: 2px;
			left: 46px;
			font-size: 14px;
			color: #333;
			margin-bottom: 0;
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
				vertical-align: 0px;
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
	.homeArr {
		position: relative;
		padding: 0 140px 0 70px;
		font-size: 12px;
		color: #999;
		z-index: 100;
		.sourceStyle {
			overflow: hidden;
			white-space: nowrap;
			// text-overflow: ellipsis;
			max-width: 528px;
		}
		span {
			margin-bottom: 15px;
		}
		h3 {
			font-size: 14px;
			font-weight: 600;
			color: #333;
			margin-bottom: 15px;
			line-height: 1.5;
			&:hover {
				font-weight: 600;
				color: #1678ff;
			}
		}
	}
	.title {
		position: relative;
		padding-left: 16px;
		font-size: 16px;
		font-weight: 600;
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
		font-size: 12px;
		color: #666;
	}
	button {
		font-size: 12px;
		color: #666;
	}
	.el-pagination__sizes {
		.el-input {
			.el-input__inner {
				font-size: 12px;
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
				font-size: 12px;
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
