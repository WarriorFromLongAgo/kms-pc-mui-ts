<template>
	<div class="content" ref="homeworkRef" :style="{ 'padding-bottom': homeworkAnswerList.length === 0 ? '1px' : '' }">
		<!-- 面包屑导航 -->
		<el-breadcrumb separator="/">
			<el-breadcrumb-item :to="{ path: '/homeWorkIndex' }">我的作业</el-breadcrumb-item>
			<el-breadcrumb-item>作业详情</el-breadcrumb-item>
		</el-breadcrumb>
		<el-divider></el-divider>

		<!-- 作业内容 -->
		<div class="info">
			<div class="clearfix upper">
				<h3 class="fl">{{ homeworkContent.homeWorkName }}</h3>
				<span class="fr time"
					>起止时间：{{ homeworkContent.beginDate | format('yyyy-MM-dd') }} 至
					{{ homeworkContent.endDate | format('yyyy-MM-dd') }}</span
				>
			</div>

			<!-- 作业内容富文本 -->
			<pre v-html="homeworkContent.homeWorkDescribe"></pre>

			<div class="fj" v-if="homeworkContent.homeWorkFileList">
				<p>附件:</p>
				<a
					:href="$global().imgHost + item.filePath"
					:download="item.fileName"
					v-for="(item, index) in homeworkContent.homeWorkFileList"
					:key="index"
				>
					<i class="el-icon-paperclip"></i>{{ item.fileName }}
				</a>
			</div>
		</div>
		<el-divider
			v-if="homeworkAnswerList.length !== 0 || (homeworkContent.isStudent === 1 && (isAnswer || isEdit))"
		></el-divider>

		<!-- 编辑我的回答 -->
		<div v-if="homeworkContent.isStudent === 1 && (isAnswer || isEdit)">
			<div class="answer">
				<div class="clearfix">
					<h3 class="fl">回答</h3>
					<!-- 查看 -->
					<span v-if="isAnswer" class="fr time">{{
						myAnswer.submitTime | format('yyyy-MM-dd hh:mm:ss')
					}}</span>
				</div>

				<!-- 富文本编辑回答 -->
				<div class="text" v-if="!isAnswer">
					<Editor @content="editorChange" :editorContent="editorContent" />
					<span>{{ contextNum }}/10000</span>
				</div>

				<!-- 查看 -->
				<!-- 我的回答内容富文本 -->
				<div
					:class="
						'text-info ' + (isMyAnserInfoOverFlow ? (answerInfoShowAll ? 'showAll' : 'ellipsis-3') : '')
					"
					ref="myAnswerInfoBox"
					v-if="isAnswer"
				>
					<pre v-html="myAnswer.content" ref="myAnswerInfoChild"></pre>
				</div>
				<p
					class="reviews-show-all fl"
					@click="openOrClose('answerInfo')"
					v-if="isMyAnserInfoOverFlow && !ismodify"
				>
					{{ answerInfoShowAll ? '收起' : '展开' }}
				</p>
			</div>
			<el-divider v-if="!isAnswer"></el-divider>

			<!-- 图片上传 -->
			<div class="pics">
				<div class="pho" v-if="!isAnswer">
					<h3>图片</h3>
					<span>最多上传9张图片,每个图片≤10MB,支持格式: jpg、png、bmp</span>
				</div>
				<!--  -->
				<el-upload
					v-if="!isAnswer"
					ref="imgRef"
					accept=".jpg,.jpeg,.png,.bmp"
					:limit="9"
					:action="$global().host + 'file/upload'"
					:on-preview="handlePictureCardPreview"
					:on-remove="handleRemove"
					:on-exceed="exceed"
					:file-list="imgList"
					list-type="picture-card"
					:before-upload="beforeUpload"
					:on-success="uploadSuccess"
					:on-error="uploadError"
				>
					<i class="el-icon-plus"></i> <span>上传图片</span>
				</el-upload>
				<!-- 查看 -->
				<div class="imgCont" v-if="isAnswer && myAnswerImages.length !== 0">
					<ul>
						<li v-for="(item, index) in myAnswerImages" :key="index">
							<img :src="item.url" preview="0" alt="" />
						</li>
					</ul>
				</div>
				<el-dialog :visible.sync="dialogVisible">
					<img width="100%" :src="dialogImageUrl" alt="" />
				</el-dialog>
			</div>
			<el-divider v-if="!isAnswer"></el-divider>

			<!-- 附件上传 -->
			<div class="accessory">
				<div class="folder" v-if="!isAnswer">
					<h3>附件</h3>
					<span
						>最多上传5个附件,每个附件≤10MB,支持格式:
						doc、docx、ppt、pptx、xls、xlsx、txt、pdf、rar、zip</span
					>
				</div>
				<el-upload
					class="upload-demo"
					:action="$global().host + 'file/upload'"
					:file-list="fileList"
					accept=".doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.pdf,.rar,.zip"
					:limit="5"
					:on-remove="removeFile"
					:before-upload="beforeUploadFile"
					:on-exceed="exceedFile"
					:on-success="fileUploadSuccess"
					:on-error="fileUploadError"
					v-if="!isAnswer"
				>
					<div class="text">
						<img src="../../assets/imgs/upload.png" />
						<span>上传文件</span>
					</div>
				</el-upload>
				<!-- 查看 -->
				<div class="fj" v-if="isAnswer && myAnswer.fileVOList">
					<p>附件:</p>
					<a
						:href="$global().imgHost + item.filePath"
						:download="item.fileName"
						v-for="(item, index) in myAnswer.fileVOList"
						:key="index"
					>
						<i class="el-icon-paperclip"></i>{{ item.fileName }}
					</a>
				</div>
			</div>
			<el-divider v-if="!isAnswer"></el-divider>

			<!-- 导师评语 -->
			<div class="listBox" v-if="myAnswer.correctContent">
				<div class="remark">
					<div class="clearfix">
						<h3 class="fl">
							导师：{{ myAnswer.supervisorName
							}}<span style="margin-left:10px">{{ myAnswer.supervisorId }}</span>
						</h3>
						<span class="fr">{{ myAnswer.correctTime | format('yyyy-MM-dd hh:mm:ss') }}</span>
					</div>
					<div
						:class="
							'text-info ' +
								(isMyReviewsInfoOverFlow ? (myReviewsInfoShowAll ? 'showAll' : 'ellipsis-3') : '')
						"
						ref="myReviewsInfoBox"
					>
						<pre v-html="myAnswer.correctContent" class="text-are" ref="myReviewsInfoChild"></pre>
					</div>
					<p class="reviews-show-all" @click="openOrClose('myReviewsInfo')" v-if="isMyReviewsInfoOverFlow">
						{{ myReviewsInfoShowAll ? '收起' : '展开' }}
					</p>
				</div>
			</div>
			<el-divider v-if="isAnswer"></el-divider>

			<div class="file" v-if="!isAnswer">
				<button type="submit" class="sumb" @click="onSubmit()">提交</button>
			</div>
			<!-- 查看 -->
			<div class="check clearfix" v-if="isAnswer">
				<div class="fl">
					<span>状态：</span>
					<img v-if="myAnswer.status === 4" src="../../assets/imgs/fail.png" alt="" />
					<img v-if="myAnswer.status === 3" src="../../assets/imgs/passed.png" alt="" />
					<img v-if="myAnswer.status === 2" src="../../assets/imgs/waitMarked.png" alt="" />
				</div>
				<!-- v-if="homeworkContent.isEdit === 1" -->
				<button v-if="isEdit" class="modify fr" @click="onModify()">编辑</button>
			</div>

			<el-divider v-if="!isAnswer && homeworkAnswerList.length !== 0"></el-divider>

			<div class="empty" v-if="isAnswer && homeworkAnswerList.length !== 0"></div>
		</div>

		<!-- 全部回答 -->
		<div v-if="homeworkAnswerList.length !== 0">
			<div class="allAnswer">
				<h2>全部回答</h2>
			</div>

			<div v-for="(item, index) in currentAnswerList" :key="index">
				<el-divider></el-divider>
				<div class="listBox">
					<div class="hed clearfix">
						<div class="fl">
							<div class="imgWrap">
								<img :src="$global().sfAvatar + item.userImage + '.jpg'" alt="" />
							</div>
							<span style="margin-right:10px">{{ item.userName }}</span
							><span>{{ item.userId }}</span>
						</div>
						<span class="fr time">{{ item.submitTime | format('yyyy-MM-dd hh:mm:ss') }}</span>
					</div>

					<!-- 全部回答内容富文本 -->
					<div
						:class="
							'text-info ' +
								(otherAnswerOverFlowList[index]
									? otherAnswerShowAllList[index]
										? 'showAll'
										: 'ellipsis-3'
									: '')
						"
						:ref="'otherAnswerInfoBox' + index"
						v-if="item.content"
					>
						<pre v-html="item.content" :ref="'otherAnswerInfoChild' + index"></pre>
					</div>
					<p class="reviews-show-all" @click="openOrCloseOtherAnswer('answer', index)">
						{{ otherAnswerOverFlowList[index] ? (otherAnswerShowAllList[index] ? '收起' : '展开') : ' ' }}
					</p>

					<!-- 图片列表 -->
					<div class="imgCont" v-if="answerImages[item.userId].length !== 0">
						<ul>
							<li v-for="(url, index) in answerImages[item.userId]" :key="index">
								<img :src="url" :preview="item.userId" alt="" />
							</li>
						</ul>
					</div>

					<!-- 附件列表 -->
					<div class="fj" v-if="item.fileVOList">
						<p>附件:</p>
						<a
							:href="$global().imgHost + file.filePath"
							:download="file.fileName"
							v-for="(file, index) in item.fileVOList"
							:key="index"
							><i class="el-icon-paperclip"></i>{{ file.fileName }}</a
						>
					</div>

					<!-- 导师评语 -->
					<div class="remark" v-if="item.correctContent">
						<div class="clearfix">
							<h3 class="fl">
								导师：{{ item.supervisorName
								}}<span style="margin-left:10px">{{ item.supervisorId }}</span>
							</h3>
							<span class="fr">{{ item.correctTime | format('yyyy-MM-dd hh:mm:ss') }}</span>
						</div>

						<!-- 评语处理 -->
						<div
							:class="
								'text-info ' +
									(otherReviewsOverFlowList[index]
										? otherReviewsShowAllList[index]
											? 'showAll'
											: 'ellipsis-3'
										: '')
							"
							:ref="'otherReviewsInfoBox' + index"
						>
							<pre
								class="text-are"
								v-html="item.correctContent"
								:ref="'otherReviewsInfoChild' + index"
							></pre>
						</div>
						<p class="reviews-show-all" @click="openOrCloseOtherAnswer('reviews', index)">
							{{
								otherReviewsOverFlowList[index]
									? otherReviewsShowAllList[index]
										? '收起'
										: '展开'
									: ''
							}}
						</p>
					</div>
				</div>
			</div>

			<!-- 分页 -->
			<el-pagination
				background
				@size-change="handleSizeChange"
				@current-change="handleCurrentChange"
				:current-page="currentPage"
				:page-sizes="[10]"
				:page-size="pageNum"
				layout="total, prev, pager, next, jumper"
				:total="totalSize"
				:pager-count="7"
			>
			</el-pagination>
		</div>
	</div>
</template>

<script lang="ts">
import sfTrackEventMap from '@/assets/js/SfTrackEventMap';
import Editor from '@/components/quillEditor.vue';
import textOverFlow from '@/assets/js/textOverFlow';
import Qs from 'qs';
import { Component, Vue } from 'vue-property-decorator';
import { ref, reactive, toRefs } from '@vue/composition-api';
import { Loading } from 'element-ui';
let state: any;
let that: any;
@Component({
	props: {},
	setup(props: any, { root }: any) {
		that = root;
		state = reactive({
			imgList: [], // 上传图片列表
			fileList: [], // 上传文件列表
			dialogImageUrl: '', // 预览图片地址
			dialogVisible: false, // 控制预览框显示
			contextNum: 0, // 富文本编辑器字数统计
			RichTextEdit: '', // 富文本编辑器内容
			editorContent: '', // 回答的富文本内容
			homeworkContent: {}, // 作业详细信息
			myAnswer: {}, // 我的回答内容
			myAnswerImages: [], // 我的回答图片
			homeworkAnswerList: [], // 全部回答列表
			answerImages: {}, // 全部回答图片
			isAnswer: false, // 是否已提交回答
			ismodify: false, // 是否是编辑状态
			isEdit: false, // 是否显示编辑按钮
			currentPage: 1, // 当前页码值
			pageNum: 10, // 每页显示条数
			totalSize: 0, // 总回答条数
			currentTime: 0, // 当前时间戳
			currentAnswerList: [], // 当前显示的回答列表
			isMyAnserInfoOverFlow: false, //  是否溢出隐藏我的回答的内容
			isMyReviewsInfoOverFlow: false, //  是否溢出隐藏导师回复的内容
			otherAnswerOverFlowList: [], //  其他人回答是否溢出隐藏管理列表
			otherReviewsOverFlowList: [], //  其他人回答中导师评语是否溢出隐藏管理列表
			otherAnswerShowAllList: [], //  其他人回答溢出展开关闭管理列表
			otherReviewsShowAllList: [], //  其他人回答中导师评语溢出展开关闭管理列表
		});

		const myReviewsInfoShowAll: { value: boolean } = ref(false); //  显示我的导师回复内容全文
		const answerInfoShowAll: { value: boolean } = ref(false); //  显示我的回答内容全文
		//  控制是否显示我的回答,评语详情的开关
		const openOrClose = (box: string): void => {
			if (box === 'myReviewsInfo') {
				myReviewsInfoShowAll.value = !myReviewsInfoShowAll.value;
			} else {
				answerInfoShowAll.value = !answerInfoShowAll.value;
			}
		};

		//  控制是否显示他人回答,评语对应的全文
		const openOrCloseOtherAnswer = (box: string, index: number): void => {
			if (box === 'reviews') {
				state.otherReviewsShowAllList[index] = !state.otherReviewsShowAllList[index];
			} else {
				state.otherAnswerShowAllList[index] = !state.otherAnswerShowAllList[index];
			}
		};

		// 获取作业详情数据
		const getHomewordDetail = async (): Promise<boolean> => {
			that.$previewRefresh(); // 异步事件处理图片点击预览问题
			// 获取作业列表传递的参数
			const { homeWorkId, sourceType, sourceId } = JSON.parse(sessionStorage.getItem('homeworkParams')!);
			// 请求参数
			const params = {
				homeWorkId,
				sourceType,
				sourceId,
				currentTime: state.currentTime,
				pageNo: state.currentPage,
				pageSize: state.pageNum,
			};
			const { data: res }: any = await that.$http.post('homeWorkDetail/param', Qs.stringify(params), {
				headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
			});

			// 如果返回数据为空阻止程序向下执行
			if (!res.data) {
				return false;
			}
			state.currentTime = res.data.currentTime;
			state.pageNum = res.data.pageSize;
			state.currentPage = res.data.pageNo;

			// 作业内容富文本处理
			if (res.data.homeWorkDescribeRichText) {
				// 如果富文本不为空
				res.data.homeWorkDescribeRichText.map((contentText: { type: string; src: string; text: string }) => {
					if (contentText.type === 'image') {
						res.data.homeWorkDescribe += `<img src='${that.$global().imgHost}${
							contentText.src
						}' width="100%"/>`;
					} else {
						res.data.homeWorkDescribe += contentText.text;
					}
				});
			}

			// 判断是否显示编辑按钮
			if (res.data.pageNo === 1) {
				if (res.data.isEdit === 1) {
					state.isEdit = true;
				} else {
					state.isEdit = false;
				}
			}
			state.homeworkContent = res.data;

			// 提取我的回答内容
			// 用户id与作业回答列表中第一个回答的用户id做判断,如果相同则表示已经提交过作业
			// this.$store.state.userInfo.userId === res.data.homeWorkAnswerVOList[0].userId
			if (res.data.homeWorkAnswerVOList.length !== 0 && res.data.pageNo === 1) {
				if (that.$store.state.userInfo.userId === res.data.homeWorkAnswerVOList[0].userId) {
					state.isAnswer = true;
					state.ismodify = false;
					state.myAnswer = res.data.homeWorkAnswerVOList.splice(0, 1)[0];
					// 我的回答内容富文本处理
					if (state.myAnswer.contentRichText) {
						state.myAnswer.contentRichText.map(
							(contentText: { type: string; src: string; text: string }) => {
								if (contentText.type === 'image') {
									state.myAnswerImages.push({
										// name: 'default' + this.myAnswerImages.length,
										url: that.$global().imgHost + contentText.src,
									});
								} else {
									state.myAnswer.content += contentText.text;
								}
							},
						);
					}
				} else {
					state.isAnswer = false;
					state.ismodify = true;
				}
			}

			// 全部回答内容富文本处理
			if (res.data.homeWorkAnswerVOList.length !== 0) {
				res.data.homeWorkAnswerVOList.map((item: any) => {
					state.answerImages[item.userId] = [];
					if (item.contentRichText) {
						item.contentRichText.map((contentText: { type: string; src: string; text: string }) => {
							if (contentText.type === 'image') {
								state.answerImages[item.userId].push(`${that.$global().imgHost}${contentText.src}`);
							} else {
								item.content += contentText.text;
							}
						});
					}
				});
			}

			// 全部回答列表
			state.homeworkAnswerList = res.data.homeWorkAnswerVOList;
			state.currentAnswerList = state.homeworkAnswerList;
			state.totalSize = res.data.totalNum;

			//  判断我的回答与导师评语富文本是否溢出以控制展开按钮是否显示
			that.$nextTick(() => {
				if (that.$refs.myAnswerInfoBox && that.$refs.myAnswerInfoChild) {
					state.isMyAnserInfoOverFlow = textOverFlow(
						that.$refs.myAnswerInfoBox,
						that.$refs.myAnswerInfoChild,
					);
				}
				if (that.$refs.myReviewsInfoBox && that.$refs.myReviewsInfoChild) {
					state.isMyReviewsInfoOverFlow = textOverFlow(
						that.$refs.myReviewsInfoBox,
						that.$refs.myReviewsInfoChild,
					);
				}
			});

			//  循环将回答列表,评语列表中的展开收起等状态装起来
			for (const answerListIndex in state.homeworkAnswerList) {
				if (answerListIndex) {
					that.$nextTick(() => {
						// 其他人全部回答
						if (
							that.$refs['otherAnswerInfoBox' + answerListIndex] &&
							that.$refs['otherAnswerInfoBox' + answerListIndex].length !== 0 &&
							that.$refs['otherAnswerInfoChild' + answerListIndex] &&
							that.$refs['otherAnswerInfoChild' + answerListIndex].length !== 0
						) {
							state.otherAnswerOverFlowList.push(
								textOverFlow(
									that.$refs['otherAnswerInfoBox' + answerListIndex][0],
									that.$refs['otherAnswerInfoChild' + answerListIndex][0],
								),
							);
						} else {
							state.otherAnswerOverFlowList.push(false);
						}

						// 其他人全部评语
						if (
							that.$refs['otherReviewsInfoBox' + answerListIndex] &&
							that.$refs['otherReviewsInfoBox' + answerListIndex].length !== 0 &&
							that.$refs['otherReviewsInfoChild' + answerListIndex] &&
							that.$refs['otherReviewsInfoChild' + answerListIndex].length !== 0
						) {
							state.otherReviewsOverFlowList.push(
								textOverFlow(
									that.$refs['otherReviewsInfoBox' + answerListIndex][0],
									that.$refs['otherReviewsInfoChild' + answerListIndex][0],
								),
							);
						} else {
							state.otherReviewsOverFlowList.push(false);
						}

						state.otherAnswerShowAllList.push(false);
						state.otherReviewsShowAllList.push(false);
					});
				}
			}
			return true;
		};

		// 初始化展开折叠的相关数据
		const initContentData = (): void => {
			state.isMyAnserInfoOverFlow = false;
			state.answerInfoShowAll = false;
			state.isMyReviewsInfoOverFlow = false;
			state.myReviewsInfoShowAll = false;
			state.otherAnswerOverFlowList = [];
			state.otherReviewsOverFlowList = [];
			state.otherAnswerShowAllList = [];
			state.otherReviewsShowAllList = [];
		};

		// 切换每页显示条数时触发
		const handleSizeChange = (val: number): void => {
			state.pageNum = val;
			initContentData(); // 请求数据前初始化展开折叠的相关数据
			getHomewordDetail(); // 重新请求数据
		};

		// 页码改变时触发
		const handleCurrentChange = (val: number): void => {
			state.currentPage = val;
			initContentData(); // 分页请求数据前初始化展开折叠的相关数据
			getHomewordDetail(); // 重新请求数据
		};

		// 富文本内容
		const editorChange = (editor: string): void => {
			state.contextNum = editor.replace(/<[^>]+>/g, '').length;
			state.RichTextEdit = editor;
		};

		// 图片上传前
		const beforeUpload = (file: { size: number }) => {
			const isLt10M = file.size / 1024 / 1024 < 10;
			if (!isLt10M) {
				that.$message.error('上传图片大小不能超过 10MB!');
			}
			return isLt10M;
		};

		// 图片上传成功
		const uploadSuccess = (
			res: { status: number; data: Array<{ fullPath: string }> },
			file: { url: string; uid: number; name: string },
			fileList: number,
		): void => {
			if (res.status !== 1) {
				that.$message.error(file.name + '上传失败');
				return;
			}

			// 上传图片埋点
			const { homeworkName } = JSON.parse(sessionStorage.getItem('homeworkParams')!);
			that.$SfTrackEvent(sfTrackEventMap.uploadImg, { homeworkName });

			file.url = that.$global().imgHost + res.data[0].fullPath;
			state.imgList.push({ url: file.url, uid: file.uid });
			if (state.imgList.length >= 9) {
				const elUpload = document.querySelector('.el-upload--picture-card') as HTMLElement;
				elUpload.style.display = 'none';
			}
		};

		// 图片上传失败
		const uploadError = (): void => {
			that.$message.error('上传失败');
		};

		// 图片删除
		const handleRemove = (file: object, fileList: object[]): void => {
			// file是点击删除的文件，fileList是删除后剩下的文件列表
			state.imgList = fileList;
			if (state.imgList.length < 9) {
				const elUpload = document.querySelector('.el-upload--picture-card') as HTMLElement;
				elUpload.style.display = 'inline-block';
			}
		};

		// 图片预览
		const handlePictureCardPreview = (file: { url: string }): void => {
			state.dialogImageUrl = file.url;
			state.dialogVisible = true;
		};

		// 图片数量超出
		const exceed = (): void => {
			that.$message.error('最多上传9张图片,请重新选择!');
		};

		// 附件上传前
		const beforeUploadFile = (file: { size: number; name: string }): boolean => {
			const isLt10M = file.size / 1024 / 1024 < 10 && file.size !== 0;
			const isLt0M = file.size === 0;
			const isIncludeCom = /，|,/.test(file.name);
			if (!isLt10M) {
				that.$message.error('上传文件大小不能超过 10MB!');
			}
			if (isLt0M) {
				that.$message.error('上传文件不能为空!');
			}
			if (isIncludeCom) {
				that.$message.error('文件名不能包含逗号,请重新命名后上传!');
			}
			return isLt10M && !isLt0M && !isIncludeCom;
		};

		// 附件上传成功
		const fileUploadSuccess = (
			res: { data: Array<{ fileName: string; fullPath: string }>; status: number },
			file: { name: string; url: string; uid: number },
			fileList: object,
		): void => {
			if (res.status !== 1) return that.$message.error(file.name + '上传失败');

			// 上传附件埋点
			const { homeworkName } = JSON.parse(sessionStorage.getItem('homeworkParams')!);
			that.$SfTrackEvent(sfTrackEventMap.uploadFile, { homeworkName });

			file.name = res.data[0].fileName;
			file.url = res.data[0].fullPath;
			state.fileList.push({ name: file.name, url: file.url, uid: file.uid });
			if (state.fileList.length >= 5) {
				const elUpload = document.querySelector('.el-upload.el-upload--text') as HTMLElement;
				elUpload.style.display = 'none';
			}
		};

		// 附件上传失败
		const fileUploadError = (): void => {
			that.$message.error('上传失败');
		};

		// 附件数量超出
		const exceedFile = (): void => {
			that.$message.error('最多上传5个附件,请重新选择!');
		};

		// 文件删除
		const removeFile = (file: object, fileList: any[]): void => {
			state.fileList = fileList;
			if (state.fileList.length < 5) {
				const elUpload = document.querySelector('.el-upload.el-upload--text') as HTMLElement;
				elUpload.style.display = 'inline-block';
			}
		};

		// 点击编辑修改
		const onModify = (): void => {
			const contentTop = that.$refs.homeworkRef.offsetTop; // 作业详情容器距离页面顶部的距离
			// 点击编辑时滚动到对应位置
			window.scrollTo({
				top: contentTop,
				behavior: 'smooth',
			});
			state.editorContent = state.myAnswer.content;
			if (state.myAnswer.content) {
				state.contextNum = state.myAnswer.content.replace(/<[^>]+>/g, '').length;
			}

			state.imgList = state.myAnswerImages;
			state.fileList = [];
			if (state.myAnswer.fileVOList) {
				state.myAnswer.fileVOList.map((item: { fileName: string; filePath: string }) => {
					state.fileList.push({ name: item.fileName, url: item.filePath });
				});
			}
			state.isAnswer = false;
			state.ismodify = true;
		};

		// 点击提交
		const onSubmit = (): void => {
			// 处理图片提交格式(url,url,url)
			let imgStr = '';
			const imgArr: any[] = [];
			if (state.imgList.length !== 0) {
				state.imgList.map((item: { url: string }) => {
					item.url = item.url.split(that.$global().imgHost)[1];
					imgArr.push(item.url);
				});
				imgStr = imgArr.join(',');
			}

			// 处理文件提交格式(name|url,name|url,name|url)
			let fileStr = '';
			const fileArr: any[] = [];
			let isAnomaly = false; // 判断是否存在异常文件地址为undefined的情况
			if (state.fileList.length !== 0) {
				state.fileList.map((item: { url: undefined | string; name: string }) => {
					if (item.url === undefined || item.url === 'undefined') {
						that.$message.error(item.name + '该附件路径错误无法提交,请重新上传');
						isAnomaly = true;
					} else {
						fileArr.push(item.name + '|' + item.url);
					}
				});
				fileStr = fileArr.join(',');
			}
			if (isAnomaly) return; // 如果有异常阻止程序向下执行
			// 提交的参数
			const { homeWorkId, sourceType, sourceId } = JSON.parse(sessionStorage.getItem('homeworkParams')!);

			const params = {
				sourceId,
				homeworkId: homeWorkId,
				sourceType,
				content: state.RichTextEdit || state.editorContent,
				filePath: fileStr,
				imagesPath: imgStr,
			};

			if (!params.content && !params.filePath && !params.imagesPath)
				return that.$message.error('您没有提交任何内容!');

			that.$confirm('提交后不可修改, 是否继续提交?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning',
			})
				.then(() => {
					that.$http
						.post('homework/saveResult', Qs.stringify(params), {
							headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
						})
						.then((res: { data: { status: number; errorMessage: string } }) => {
							if (res.data.status === 1) {
								that.$message.success('提交成功!');

								// 作业提交埋点
								const { homeworkName } = JSON.parse(sessionStorage.getItem('homeworkParams')!);
								that.$SfTrackEvent(sfTrackEventMap.submitHomework, { homeworkName });

								// 重新请求渲染前初始化数据
								state.myAnswerImages = []; // 清空图片列表
								state.myAnswer.fileVOList = []; // 清空附件列表
								state.RichTextEdit = ''; // 清空富文本内容
								initContentData(); // 请求前初始化展开折叠的相关数据
								getHomewordDetail(); // 重新请求数据
							} else {
								that.$message.error(res.data.errorMessage);
							}
						})
						.catch();
				})
				.catch(() => {
					that.$message({
						type: 'info',
						message: '已取消提交',
					});
				});
		};

		getHomewordDetail();

		return {
			...toRefs(state),
			myReviewsInfoShowAll,
			answerInfoShowAll,
			getHomewordDetail,
			openOrCloseOtherAnswer,
			openOrClose,
			initContentData,
			handleSizeChange,
			handleCurrentChange,
			editorChange,
			beforeUpload,
			uploadSuccess,
			uploadError,
			handleRemove,
			handlePictureCardPreview,
			exceed,
			beforeUploadFile,
			fileUploadSuccess,
			fileUploadError,
			exceedFile,
			removeFile,
			onModify,
			onSubmit,
		};
	},

	components: {
		Editor,
	},

	beforeRouteLeave(to, from, next) {
		if (
			state.RichTextEdit !== '' ||
			state.editorContent ||
			state.imgList.length !== 0 ||
			state.fileList.length !== 0
		) {
			if (!state.isAnswer) {
				state
					.$confirm('内容将不会保存, 是否继续?', '提示', {
						confirmButtonText: '确定',
						cancelButtonText: '取消',
						type: 'warning',
						closeOnHashChange: false,
					})
					.then(() => {
						next();
					})
					.catch(() => {
						this.$message({
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
	beforeRouteEnter(to, from, next) {
		next((vm) => {
			if (from.path === '/') return false;
			// 访问作业详情的埋点信息
			const { homeworkName } = JSON.parse(sessionStorage.getItem('homeworkParams')!);
			if (that.$SfTrackEvent) {
				that.$SfTrackEvent(sfTrackEventMap.homeworkDetailNav, {
					page_ref: that.$global().host + from.path.slice(1),
					homeworkName,
				});
			}
		});
	},
})
export default class HomeWorkDetail extends Vue {}
</script>

<style lang="less" scoped>
.content {
	position: relative;
	margin: 0 auto;
	padding: 40px 0 90px 0;
	min-height: 100%;
	width: 940px;
	background-color: #fff;
	border-radius: 8px;

	pre {
		font-size: 14px;
		color: #666;
		line-height: 2;
		white-space: pre-wrap; /* css-3 */
		white-space: -moz-pre-wrap; /* Mozilla, since 1999 */
		white-space: -pre-wrap; /* Opera 4-6 */
		white-space: -o-pre-wrap; /* Opera 7 */
		word-wrap: break-word;
		font-family: 'Microsoft YaHei';
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

	// 折叠展开
	.text-info {
		max-height: 14 * 2 * 8px;
		color: #666;
		pre {
			height: auto;
		}
	}
	.showAll {
		max-height: inherit;
	}
	.reviews-show-all {
		color: #1678ff;
		font-size: 14px;
		cursor: pointer;
	}

	// 附件
	.fj {
		margin-top: 20px;
		p {
			font-size: 14px;
			color: #666;
			margin-bottom: 10px;
		}
		a {
			font-size: 14px;
			color: #1678ff;
			margin-right: 20px;
		}
	}
	.imgCont {
		margin-top: 20px;
		margin-bottom: 15px;
		ul {
			display: flex;
			flex-wrap: wrap;
			li {
				width: 68px;
				height: 68px;
				background-color: #fff;
				border: 1px solid #ccc;
				text-align: center;
				line-height: 68px;
				margin-right: 7px;
			}
		}
		img {
			flex: 1;
			width: 100%;
			height: 100%;
			vertical-align: middle;
		}
	}
	/deep/ .el-breadcrumb {
		padding: 0 138px 0 70px;
		font-size: 12px;
		.el-breadcrumb__inner a,
		.el-breadcrumb__inner.is-link {
			color: #1678ff;
			font-weight: 400;
		}
	}
	.el-divider {
		background-color: #eee;
		margin: 30px 0 30px 0;
	}
	.info {
		padding: 0 138px 0 70px;
		.fj {
			p {
				margin-bottom: 5px;
				margin-top: 10px;
			}
		}

		.upper {
			margin-bottom: 15px;
			h3 {
				font-size: 14px;
				color: #333;
				font-weight: 600;
				line-height: 1.5;
			}
			span {
				font-size: 12px;
				color: #666;
				line-height: 30px;
			}
		}
	}
	.answer {
		padding: 0 138px 0 70px;
		h3 {
			font-size: 14px;
			color: #333;
			margin-bottom: 15px;
			font-weight: 700;
		}
		.text {
			position: relative;
			span {
				position: absolute;
				bottom: 10px;
				right: 20px;
				font-size: 12px;
				color: #ccc;
			}
		}
	}
	.pics {
		padding: 0 138px 0 70px;
		/deep/.el-upload--picture-card {
			position: relative;
			width: 75px;
			height: 75px;
			line-height: 70px;
			span {
				position: absolute;
				bottom: -20px;
				left: 12px;
				font-size: 12px;
				color: #999;
			}
		}
		/deep/ .el-upload-list--picture-card .el-upload-list__item {
			width: 75px;
			height: 75px;
			margin: 0 6px 0 0;
		}
		.pho {
			margin-bottom: 30px;
			span {
				font-size: 14px;
				color: #999;
			}
		}
		h3 {
			display: inline-block;
			font-size: 14px;
			color: #333;
			margin-right: 15px;
		}
	}
	.accessory {
		padding: 0 138px 0 70px;
		/deep/ .el-upload-list__item {
			width: 60%;
			font-size: 14px;
		}
		.text {
			width: 120px;
			height: 32px;
			color: 14px;
			font-size: 12px;
			line-height: 32px;
			text-align: center;
			border: 1px solid #ccc;
			background-color: #fff;
			border-radius: 5px;
			cursor: pointer;
			img {
				width: 20px;
				height: 20px;
				vertical-align: middle;
				margin-right: 5px;
			}
		}
		.folder {
			margin-bottom: 30px;
			// white-space: nowrap;
			h3 {
				display: inline-block;
				font-size: 14px;
				color: #333;
				margin-right: 15px;
			}
			span {
				font-size: 12px;
				color: #999;
			}
		}
	}
	.file {
		padding: 0 138px 0 70px;
		margin-top: 45px;
		margin-bottom: 45px;
		button {
			width: 90px;
			height: 40px;
			border-radius: 20px;
			text-align: center;
			line-height: 40px;
			color: #1678ff;
			border: 1px solid #1678ff;
			background-color: #fff;
			font-size: 14px;
			cursor: pointer;
		}
		.sumb {
			color: #fff;
			background-color: #1678ff;
			margin-right: 15px;
		}
	}
	.allAnswer {
		padding: 0 138px 0 70px;
		margin-top: 30px;
		h2 {
			font-size: 16px;
			color: #333;
			font-weight: 600;
		}
	}
	.listBox {
		padding: 0 138px 0 70px;
	}
	.hed {
		margin-bottom: 15px;
		.imgWrap {
			display: inline-block;
			width: 45px;
			height: 45px;
			margin-right: 15px;
			vertical-align: middle;
			border-radius: 50%;
			overflow: hidden;
			img {
				width: 100%;
				height: 100%;
				vertical-align: middle;
			}
		}

		span {
			font-size: 14px;
			color: #666;
		}
		.time {
			font-size: 12px;
			color: #999;
			margin-top: 10px;
		}
	}
	.time {
		font-size: 12px;
		color: #999;
		margin-top: -2px;
	}
	.remark {
		padding: 20px;
		width: 100%;
		height: 100%;
		margin-top: 30px;
		color: #999;
		font-size: 12px;
		background-color: #eee;
		border-left: 6px solid #aaa;
		box-sizing: border-box;

		h3 {
			color: #999;
			font-size: 14px;
		}
		.text-are {
			margin-top: 5px;
			color: #666;
			font-size: 14px;
			line-height: 2;
		}
	}
	/deep/.el-pagination {
		position: absolute;
		bottom: 30px;
		right: 138px;
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
						color: #fff;
					}
					&:not(.disabled):hover {
						background-color: #ddd;
						color: #666;
					}
				}
			}
		}
	}
	.check {
		padding: 0 138px 0 70px;
		margin-bottom: 20px;
		font-size: 14px;
		color: #333;
		.modify {
			width: 90px;
			height: 40px;
			border-radius: 20px;
			text-align: center;
			line-height: 40px;
			color: #fff;
			border: 1px solid #1678ff;
			background-color: #1678ff;
			font-size: 14px;
			cursor: pointer;
		}
		img {
			vertical-align: middle;
			margin-left: 8px;
		}
	}
	.empty {
		width: 100%;
		height: 20px;
		background-color: #f5f5f5;
	}
}
</style>
