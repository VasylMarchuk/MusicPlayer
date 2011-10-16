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
            title : $('<div/>', { 'class':'title', text:i18n.getMessage('extName') }),
            vkStepContainer : $('<div/>', { 'id':'vk-step-container', 'class':'step' }).append(
                $('<span />', { 'class' : 'number', text:'1. ' }),
                i18n.getMessage('loginToVk')
            ),
            vkLoginButton : $('<span/>', {'class':'button', text : i18n.getMessage('welcomeLoginButton') }),

            lastFmStepContainer : $('<div/>', { 'id':'lastfm-step-container', 'class':'step' }).append(
                $('<span />', { 'class' : 'number', text:'2. ' }),
                i18n.getMessage('loginToLastFm')
            ),
            lastFmLoginButton : $('<span/>', {'class':'button', text : i18n.getMessage('welcomeLoginButton') }),

//			vkInfoMessage : $('<div/>', {'class':'vk-info-message', text : i18n.getMessage('vkInfoMessage') }),
//			lastFmInfoMessage : $('<div/>', {'class':'lastfm-info-message', text : i18n.getMessage('vkInfoMessage') }),
//			lastFmLogin : $('<div/>', {'class':'lastfm-login-button', text : i18n.getMessage('loginToVk'), title:i18n.getMessage('loginToVk') }),
		};

		clickable(ctrl.vkLoginButton, function(){
//            ctrl.vkInfoMessage.hide();
//            ctrl.vkLogin.hide();
//            ctrl.vkWaitingAuth.show();
//
            player.vkAuth(function(err, sess){
                if(err) {
//                    ctrl.vkWaitingAuth.hide();
//                    ctrl.vkInfoMessage.show();
//                    ctrl.vkLogin.show();
                } else {
                    window.location.reload();
                }
            });
        });

		$el.append(ctrl.title, ctrl.vkStepContainer.append(ctrl.vkLoginButton), ctrl.lastFmStepContainer.append(ctrl.lastFmLoginButton));
	}

	app.classes.WelcomeWidget = WelcomeWidget;

})(ChromePlayer);