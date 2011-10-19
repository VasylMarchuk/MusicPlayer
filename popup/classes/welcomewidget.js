(function(app){

	var i18n = chrome.i18n;

	function clickable(el, onclick) {
		$(el).bind({
			click : onclick,
			mousedown : function(){ $(this).addClass('down'); },
			mouseup : function(){ $(this).removeClass('down'); }
		});
	}

	function WelcomeWidget(player, $mainContent) {
		var me = this;
		me.player = player;

        $mainContent = $($mainContent);

		var $el = me.$element = $('<div />', {
			id:'welcome-widget'
		});

		var ctrl = me.controls = {
            title : $('<div/>', { 'class':'title', text:i18n.getMessage('extName') }),
            vkStepContainer : $('<div/>', { 'id':'vk-step-container', 'class':'step' }).append(
                $('<span />', { 'class' : 'number', text:'1. ' }),
                i18n.getMessage('loginToVk')
            ),
            vkLoginButton : $('<span/>', {'class':'button', text : i18n.getMessage('welcomeAuthButton') }),

            lastFmStepContainer : $('<div/>', { 'id':'lastfm-step-container', 'class':'step' }).append(
                $('<span />', { 'class' : 'number', text:'2. ' }),
                i18n.getMessage('loginToLastFm')
            ),
            lastFmLoginButton : $('<span/>', {'class':'button', text : i18n.getMessage('welcomeAuthButton') }),

            vkAuthFrame : $('<iframe/>', { id:'vk-auth-frame', src:'authframe.html' }),
            lastFmAuthFrame : $('<iframe/>', { id:'lastfm-auth-frame', src:'authframe.html' })
		};

		clickable(ctrl.vkLoginButton, function(){
            if(ctrl.vkStepContainer.hasClass('success')) {
                return;
            }

			app.analytics.vkAuthBegin();

            ctrl.vkStepContainer.hide();
            ctrl.lastFmStepContainer.hide();
            $mainContent.addClass('auth');
            ctrl.vkAuthFrame.one('webkitAnimationStart', function(){
                ctrl.vkAuthFrame.css('opacity', 0);
            });
            ctrl.vkAuthFrame.one('webkitAnimationEnd', function(){
                ctrl.vkAuthFrame.css('opacity', 1);
            });
            $el.append(ctrl.vkAuthFrame);

            function vkAuthResponder(err){
                ctrl.vkAuthFrame.remove();
                ctrl.vkAuthFrame = $('<iframe/>', { id:'vk-auth-frame', src:'authframe.html' });

                if(err && err.message=='Need reload') {
                    $el.append(ctrl.vkAuthFrame.css('opacity', 1));
                    player.vkAuth(ctrl.vkAuthFrame, vkAuthResponder);
                    return;
                }

                $mainContent.removeClass('auth');
                if(!err) {
					app.analytics.vkAuthComplete();
                    ctrl.vkLoginButton.text(i18n.getMessage('welcomeAuthDoneButton'));
                    ctrl.vkStepContainer.addClass('success');
                }
                ctrl.vkStepContainer.show();
                ctrl.lastFmStepContainer.show();
                if(player.lastFm) {
					app.analytics.authComplete();
					$(window).unbind('unload.popupCloseMonitor');
                    window.location.reload();
                }
            }

            player.vkAuth(ctrl.vkAuthFrame, vkAuthResponder);
        });

		clickable(ctrl.lastFmLoginButton, function(){
            if(ctrl.lastFmStepContainer.hasClass('success')) {
                return;
            }

			app.analytics.lastFmAuthBegin();

            ctrl.vkStepContainer.hide();
            ctrl.lastFmStepContainer.hide();
            $mainContent.addClass('auth-huge');
            ctrl.lastFmAuthFrame.one('webkitAnimationStart', function(){
                ctrl.lastFmAuthFrame.css('opacity', 0);
            });
            ctrl.lastFmAuthFrame.one('webkitAnimationEnd', function(){
                ctrl.lastFmAuthFrame.css('opacity', 1);
            });
            $el.append(ctrl.lastFmAuthFrame);

            player.lastFmAuth(ctrl.lastFmAuthFrame, function(err){
                ctrl.lastFmAuthFrame.remove();
                ctrl.lastFmAuthFrame = $('<iframe/>', { id:'lastfm-auth-frame', src:'authframe.html' });
                $mainContent.removeClass('auth-huge');
                if(!err) {
					app.analytics.lastFmAuthComplete();
                    ctrl.lastFmLoginButton.text(i18n.getMessage('welcomeAuthDoneButton'));
                    ctrl.lastFmStepContainer.addClass('success');
                }
                ctrl.vkStepContainer.show();
                ctrl.lastFmStepContainer.show();
                if(player.vk) {
					app.analytics.authComplete();
					$(window).unbind('unload.popupCloseMonitor');
                    window.location.reload();
                }
            });
        });

        if(player.vk) {
            ctrl.vkStepContainer.addClass('success');
            ctrl.vkLoginButton.text(i18n.getMessage('welcomeAuthDoneButton'));
        }

        if(player.lastFm) {
            ctrl.lastFmStepContainer.addClass('success');
            ctrl.lastFmLoginButton.text(i18n.getMessage('welcomeAuthDoneButton'));
        }

		$el.append(ctrl.title, ctrl.vkStepContainer.append(ctrl.vkLoginButton), ctrl.lastFmStepContainer.append(ctrl.lastFmLoginButton));
	}

	app.classes.WelcomeWidget = WelcomeWidget;

})(ChromePlayer);