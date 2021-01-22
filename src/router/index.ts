import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
// const workCorrection: any = () => import('../views/myMark/workCorrection.vue');
import myclassroom from '../views/myMark/myclassroom.vue';
import HomeWorkIndex from '../views/myHomeWork/homeWorkIndex.vue';
import workCorrection from '../views/myMark/workCorrection.vue';
import HomeWorkDetail from '../views/myHomeWork/homeWorkDetail.vue';
import markIndex from '../views/myMark/markIndex.vue';
import main from '../views/index.vue';
console.log(workCorrection);
console.log(HomeWorkDetail);

Vue.use(VueRouter);

const routes: RouteConfig[] = [
	{
		path: '/',
		redirect: '/main',
	},
	{
		path: '/main',
		name: 'main',
		redirect: '/homeWorkIndex',
		component: main,
		children: [
			{
				path: '/markIndex',
				name: 'markIndex',
				component: markIndex,
				meta: {
					keepAlive: true,
				},
			},
			{
				path: '/myclassroom',
				name: 'myclassroom',
				component: myclassroom,
			},
			{
				path: '/homeWorkIndex',
				name: 'homeWorkIndex',
				component: HomeWorkIndex,
				meta: {
					keepAlive: true,
				},
			},
			{
				path: '/homeWorkDetail',
				name: 'homeWorkDetail',
				component: HomeWorkDetail,
			},
			{
				path: '/markCorrection',
				name: 'workCorrection',
				component: workCorrection,
			},
		],
	},
];

const router = new VueRouter({
	mode: 'history',
	base: process.env.BASE_URL,
	routes,
});

export default router;
