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
			vkLogin : $('<div/>', {'class':'vk-login-button', text : i18n.getMessage('loginToVk'), title:i18n.getMessage('loginToVk') }),
            vkWaitingAuth : $('<div/>', {'class':'vk-waiting-auth', text : i18n.getMessage('vkWaitingAuth') })
		};

		clickable(ctrl.vkLogin, function(){

            ctrl.vkInfoMessage.hide();
            ctrl.vkLogin.hide();
            ctrl.vkWaitingAuth.show();

            player.vkAuth(function(err, sess){
                console.log('FINAL CALLBACK', err, sess);
                if(err) {
                    ctrl.vkWaitingAuth.hide();
                    ctrl.vkInfoMessage.show();
                    ctrl.vkLogin.show();
                } else {
                    window.location.reload();
                }
            });
        });

		$el.append(ctrl.vkLogin, ctrl.vkInfoMessage, ctrl.vkWaitingAuth.hide());
	}

	app.classes.WelcomeWidget = WelcomeWidget;

})(ChromePlayer);