
var i18n = chrome.i18n;

function clickable(el, onclick) {
	$(el).bind({
		click : onclick,
		mousedown : function(){ $(this).addClass('down'); },
		mouseup : function(){ $(this).removeClass('down'); }
	});
}

function WelcomeMessage(vkLoginText, vkInfoMessageText, callback) {
	var me = this;

	var $el = me.$element = $('<div />', {
		id:'welcome-widget'
	});

	var ctrl = me.controls = {
		vkInfoMessage : $('<div/>', {'class':'vk-info-message', text : vkInfoMessageText }),
		vkLogin : $('<div/>', {'class':'vk-login-button', text : vkLoginText, title:vkLoginText })
	};

	clickable(ctrl.vkLogin, function(){
		chrome.extension.sendRequest({cmd: "doVkAuth" }, function(response) {
			$el.remove();
			if(callback) {
				callback(response.err, null);
			}

		});
	});

	//	player.bind( {
	//		'vkAuthChanged.welcomeWidget' : function onVKAuthChanged() {
	//			if(player.vk) {
	//				window.location.reload();
	//			}
	//		}
	//	});

	$el.append(ctrl.vkLogin, ctrl.vkInfoMessage);
}