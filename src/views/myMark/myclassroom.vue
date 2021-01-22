<template>
	<div class="main">
		<div class="pic">
			<div class="portrait">
				<img src="../../assets/imgs/feng.png" alt="" srcset="" />
			</div>
			<p>扫码前往手机端查看吧</p>
			<div id="qrcode" class="code"></div>
		</div>
	</div>
</template>

<script lang="ts">
import { onMounted } from '@vue/composition-api';
import QRCode from 'qrcodejs2';
export default {
	setup() {
		const qrcode = () => {
			const Qrcode = new QRCode('qrcode', {
				// eslint-disable-line no-unused-vars
				width: 195, //
				height: 195, //
				text: 'sfim://service/learning:index.html#/college/collegeMyIndex', // 二维码地址
			});
		};
		onMounted(() => {
			qrcode();
		});
		return {
			qrcode,
		};
	},
};
</script>

<style lang="less" scoped>
.main {
	margin: 0 auto 0;
	position: relative;
	width: 940px;
	background: #fff;
	.pic {
		display: flex;
		align-items: center;
		align-content: center;
		flex-direction: column;
		.portrait {
			width: 265px;
			height: 265px;
			margin: 0 auto;
			img {
				width: 100%;
				height: 100%;
			}
		}
		p {
			color: #333;
			font-size: 16px;
			margin: 10px 0 20px 0;
		}
	}
	.code {
		padding-bottom: 20px;
	}
}
</style>
