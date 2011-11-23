(function(app){

    var i18n = chrome.i18n;

    function AboutWidget() {
        var me = this;

        var $el = me.$element = $('<div/>', { 'id' : 'about-widget' });

        var version = "?";

        //non-documented
        if(chrome.app && chrome.app.getDetails) {
            version = chrome.app.getDetails().version;
        }

        var ctrl = me.controls = {
            extensionName : $('<div/>', { 'class' : 'ext-name', text:i18n.getMessage('extName') }),
            extensionDescr : $('<div/>', { 'class' : 'ext-descr', text:i18n.getMessage('extDescription') }),
            extensionVersion : $('<div/>', { 'class' : 'ext-version', text:i18n.getMessage('aboutVersion', [version]) }),
            developedBy : $('<div/>', { 'class' : 'developed-by' }).append(i18n.getMessage('aboutDevelopedBy'), $('<a />', { text:'HyperDev', href:'http://hyperdev.it/musicplayer', target:'_blank' })),
            creditsLabel : $('<div/>', { 'class' : 'credits-label' }), //text: i18n.getMessage('aboutCreditsLabel')
            creditsList : $('<div />', {'class':'credits-list', html: i18n.getMessage('aboutCreditsList')}),
            ninja : $('<div/>', {'class': 'ninja', title:'Ninja!'})
        };


        $el.append(ctrl.extensionName, ctrl.extensionDescr, ctrl.developedBy, ctrl.extensionVersion, ctrl.creditsLabel, ctrl.creditsList, ctrl.ninja);
        
        $el.bind('addedToDom', function(){
            $(document).bind('click.aboutWidgetCloseHandler', function(ev){
                var $clicked = $(ev.srcElement);
                if($clicked.parents('#about-widget').size() == 0 || $clicked.is('#about-widget')) {
                    $el.unbind('addedToDom');
                    $(document).unbind('click.aboutWidgetCloseHandler');
                    me.$element.remove();
                }
            });
        })
    }

    app.classes.AboutWidget = AboutWidget;

})(MusicPlayer);