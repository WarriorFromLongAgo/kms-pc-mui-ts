const aid: string = 'PC_learning_';

const SfTrackEventMap: any = {
	// 作业列表跳转到作业详情页
	homeworkDetailNav: `${aid}homeworkDetail_url`,
	// 批改列表跳转到批改详情页
	correctDetailNav: `${aid}correctDetail_url`,
	// 作业批改提交评语
	submitRemark: `${aid}submitRemark_url`,
	// 上传图片
	uploadImg: `${aid}uploadImg_url`,
	// 上传附件
	uploadFile: `${aid}uploadFile_url`,
	// 作业提交
	submitHomework: `${aid}submitHomework_url`,
};

export default SfTrackEventMap;
