(function(app){

	var i18n = chrome.i18n;

	function clickable(el, onclick) {
		$(el).bind({
			click : onclick,
			mousedown : function(){ $(this).addClass('down'); },
			mouseup : function(){ $(this).removeClass('down'); }
		});
	}

	function WelcomeWidget(player) {
		var me = this;
		me.player = player;

		var $el = me.$element = $('<div />', {
			id:'welcome-widget'
		});

		var ctrl = me.controls = {
			vkInfoMessage : $('<div/>', {'class':'vk-info-message', text : i18n.getMessage('vkInfoMessage') }),
			vkLogin : $('<div/>', {'class':'vk-login-button', text : i18n.getMessage('loginToVk'), title:i18n.getMessage('loginToVk') })
		};

		clickable(ctrl.vkLogin, function(){ me.player.vkAuth(); });

		player.bind( {
			'vkAuthChanged.welcomeWidget' : function onVKAuthChanged() {
				if(player.vk) {
					window.location.reload();
				}
			}
		});

		$el.append(ctrl.vkLogin, ctrl.vkInfoMessage);
	}

	app.classes.WelcomeWidget = WelcomeWidget;

})(ChromePlayer);