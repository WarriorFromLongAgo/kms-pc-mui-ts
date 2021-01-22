import { Message } from 'element-ui';
let messageInstance: any;
const resetMessage: any = (options: string) => {
	if (messageInstance) {
		messageInstance.close();
	}
	// options.offset = (document.documentElement.clientHeight || document.body.clientHeight) / 2
	messageInstance = Message(options);
};
['error', 'success', 'info', 'warning'].forEach((type: string) => {
	resetMessage[type] = (options: any) => {
		if (typeof options === 'string') {
			options = {
				message: options,
			};
		}
		options.type = type;
		return resetMessage(options);
	};
});
export const message = resetMessage;
