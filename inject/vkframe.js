//var ohref = location.href;
//console.log(Object.getOwnPropertyDescriptor(window,'location'));
//Object.defineProperty(window,'location',{
//	get:function(){return {};},
//	set:function(){alert();}
//});
////window.addEventListener('onload',function(){
//	$(window).ready(function(){
//		console.log('load');
//		alert();
//	});
////});

chrome.extension.sendRequest({cmd: "vkFrameReload" }, function(response) {});

//if(window.location.href.indexOf('vkontakte')!==-1) {
//
//}
//
//parent = false;
//
//document.onreadystatechange = function(){
//	parent = false;
//	document.scripts = [];
//	document.getElementsByTagName('script')[0] = null;
//	document.getElementsByTagName('script')[1] = null;
//	document.getElementsByTagName('script')[2] = null;
//	//$('script','head').remove();
//	var s = document.createElement('script'); s.type = 'text/javascript'; s.async=true;
//	s.innerHTML = 'window.parent=false;console.log(parent,window);';
//	var h = document.getElementsByTagName('script')[0]; h.parentNode.insertBefore(s, h);
//	//delete document.scripts[1];
//	//document.write(document.readyState);
////	if(document.readyState=='complete') {
////	}
////	else {
////	}
//};