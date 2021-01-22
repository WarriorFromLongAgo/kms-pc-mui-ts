const textOverFlow = (domElement: any, childDomElement: any) => {
	const childrenList = domElement;
	// console.log('1111111111111111', childDomElement, childrenList)
	if (childDomElement.clientHeight > childrenList.clientHeight) {
		return true;
	} else {
		return false;
	}
};
export default textOverFlow;
