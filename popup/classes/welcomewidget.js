(function(app){

    var i18n = chrome.i18n;

    function WelcomeWidget(player) {
        var me = this;
        me.player = player;

        var $el = me.$element = $('<div />', {
            id:'welcome-widget'
        });

        var ctrl = me.controls = {
            title : $('<div/>', { 'class':'title', text:i18n.getMessage('extName') }),
            setUpButton : $('<div/>', { 'class':'step', text:i18n.getMessage('weNeedSetUp', [i18n.getMessage('extName')]) })
        };

        ctrl.setUpButton.click(function(){
            if(app.currentAuthTab !== undefined) {
                chrome.tabs.update(app.currentAuthTab.id, { url:'inject/auth.html' });
            } else {
                chrome.tabs.create({ url:'inject/auth.html' }, function(tab) {
                    app.currentAuthTab = tab;
                });
            }
            window.close();
        });

        $el.append(ctrl.title, ctrl.setUpButton);
    }

    app.classes.WelcomeWidget = WelcomeWidget;

})(MusicPlayer);