(function(app){

    var i18n = chrome.i18n;

    function clickable(el, onclick) {
        $(el).bind({
            click : onclick,
            mousedown : function(){ $(this).addClass('down'); },
            mouseup : function(){ $(this).removeClass('down'); }
        });
    }

    function AuthWidget(player) {
        var me = this;
        me.player = player;

        var $el = me.$element = $('<div />', {
            id:'auth-widget'
        });

        var ctrl = me.controls = {
            title : $('<div/>', { 'class':'title', text:i18n.getMessage('setUp', [ i18n.getMessage('extName') ]) }),
            vkStepContainer : $('<div/>', { id:'vk-step-container', 'class':'step' }).append(
                $('<span />', { 'class' : 'number', text:'1. ' }),
                i18n.getMessage('loginToVk')
            ),
            vkLoginButton : $('<span/>', {'class':'button', text : i18n.getMessage('welcomeAuthButton') }),

            lastFmStepContainer : $('<div/>', { id:'lastfm-step-container', 'class':'step' }).append(
                $('<span />', { 'class' : 'number', text:'2. ' }),
                i18n.getMessage('loginToLastFm')
            ),
            lastFmLoginButton : $('<span/>', {'class':'button', text : i18n.getMessage('welcomeAuthButton') }),

            finalStep : $('<div/>', { id:'final-step', 'class':'step' }).append(
                i18n.getMessage('authFinalStep', [ i18n.getMessage('extName') ])
            )
        };

        clickable(ctrl.vkLoginButton, function(){
            if(ctrl.vkStepContainer.hasClass('success')) {
                return;
            }
            player.vkAuth(window, function(err){});
        });

        clickable(ctrl.lastFmLoginButton, function(){
            if(ctrl.lastFmStepContainer.hasClass('success')) {
                return;
            }
            player.lastFmAuth(window, function(){});
        });

        if(player.vk) {
            ctrl.vkStepContainer.addClass('success');
            ctrl.vkLoginButton.text(i18n.getMessage('welcomeAuthDoneButton'));
        }

        if(player.lastFm) {
            ctrl.lastFmStepContainer.addClass('success');
            ctrl.lastFmLoginButton.text(i18n.getMessage('welcomeAuthDoneButton'));
        }

        ctrl.finalStep.toggleClass('success', (player.lastFm && player.vk) ? true:false);

        $el.append(ctrl.title, ctrl.vkStepContainer.append(ctrl.vkLoginButton), ctrl.lastFmStepContainer.append(ctrl.lastFmLoginButton), ctrl.finalStep);
    }

    app.classes.AuthWidget = AuthWidget;

})(MusicPlayer);