// SfMonitor 当前不支持自定义事件，(虽然文档里有)。建议使用 SfGather
const sftrackFn = () => {
	const sftrack = {
		// 初始化方法，异步加载的，返回埋点自定义方法(可使用vue.prototype挂实例方法，方便使用)
		/*
        @params
        *@trackType  [SfMonitor/SfGather] 注意大小写
        *@sourceUrl  [埋点文件资源的url：绝对路劲或者相对此文件的相对路劲]
        *@config     [埋点本身init初始化方法的配置]
        *    eg.SfMonitor :http://confluence.sf-express.com/pages/viewpage.action?pageId=40106283
                    {   appId: appId, //测试生产的appId要单独申请
                        log: logFlag,
                        product: !logFlag, //生产需要修改成true
                        customerUser: '123456'
                    }
                SfGather: http://confluence.sf-express.com/pages/viewpage.action?pageId=21551572
                    { debug = false; //是否开启调试模式
                        url = "http://218.17.248.243:40021/json_data"//埋点的发送地址
                        app_id = "hrss_clock"; //注册应用时生成的appId,必传字段
                        platform = "mobile"; //平台类型
                        uid =  //用户id
                        device_id =  "sf"
                    }
        @return 返回自定义方法 使用:fn({eventId:自定义eventId,userData:自定义数据对象})
        */
		init({ trackType, sourceUrl, config }: any) {
			return new Promise((resolve, reject) => {
				if (trackType !== 'SfMonitor' && trackType !== 'SfGather') {
					console.warn('暂不支持此埋点');
					reject(new Error('暂不支持此埋点'));
				} else if (trackType === 'SfMonitor') {
					/* global SfMonitor */
					// @ts-ignore
					window.SfMonitor = window.SfMonitor || {};
					/* global SfMonitor */
				} else if (trackType === 'SfGather') {
					/* global SfGather */
					// @ts-ignore
					window.SfGather = window.SfGather || {};
					/* global SfGather */
				}
				sftrack
					.loadScript(sourceUrl)
					.then(() => {
						try {
							if (trackType === 'SfMonitor') {
								/* global SfMonitor */
								// @ts-ignore  :忽略未声明报错
								SfMonitor.init(config);
							} else if (trackType === 'SfGather') {
								/* global SfGather */
								// @ts-ignore
								console.log('SfGather加载成功', SfGather);
								// @ts-ignore
								SfGather.init(config);
							}
							const fn = sftrack.initFun(trackType);
							resolve(fn);
						} catch (e) {
							console.log(e);
							reject(e);
						}
					})
					.catch((e) => {
						console.log(e);
						reject(e);
					});
			});
		},
		loadScript(src: string) {
			return new Promise((resolve, reject) => {
				const script = document.createElement('script');
				const head = document.getElementsByTagName('head')[0];
				script.type = 'text/javascript';
				script.charset = 'UTF-8';
				script.src = src;
				if (script.addEventListener) {
					script.addEventListener(
						'load',
						() => {
							resolve();
						},
						false,
					);
					script.addEventListener('error', (e) => {
						reject(e);
					});
					// @ts-ignore  :忽略未声明报错
				} else if (script.attachEvent) {
					// @ts-ignore  :忽略未声明报错
					script.attachEvent('onreadystatechange', () => {
						// @ts-ignore  :忽略未声明报错
						const target = window.event.srcElement;
						// @ts-ignore  :忽略未声明报错
						if (target.readyState === 'loaded') {
							resolve();
						}
					});
					// @ts-ignore  :忽略未声明报错
					script.attachEvent('onerror', (e) => {
						reject(e);
					});
				}
				head.appendChild(script);
			});
		},

		initFun(trackType: string) {
			if (trackType === 'SfGather') {
				return (eventId: string, eventObject: object) => {
					// SfGather通用自定义事件上报  event_id为单次点击的id  segmentation为自定义字段
					const obj = {
						event_id: eventId || 'default event',
					};
					const segments = eventObject ? Object.assign(obj, eventObject) : obj;
					try {
						// @ts-ignore  :忽略未声明报错
						SfGather.add_event(segments);
					} catch (e) {
						console.log('SfGather 加载失败');
					}
				};
			} else if (trackType === 'SfMonitor') {
				return (eventId: string, eventObject: object) => {
					// event_id为单次点击的id  eventObject为自定义字段//eventObject 不为空对象
					try {
						// @ts-ignore  :忽略未声明报错
						SfMonitor.trackEvent({
							eventId,
							eventObject,
						});
					} catch (e) {
						console.log('sfmonitor 加载失败');
					}
				};
			}
		},
	};
	return sftrack;
};
export default sftrackFn;
