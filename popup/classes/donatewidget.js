(function(app){

    var i18n = chrome.i18n;

    function DonateWidget() {
        var me = this;

        var $el = me.$element = $('<div/>', { 'id' : 'donate-widget' });

        var ctrl = me.controls = {
            donateItems : $('<div/>', {'class':'donate-list'}),
            ninja : $('<div/>', {'class': 'ninja', title:'Ninja!', html:'More&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;— better world!'})
        };

        [1,5,10].forEach(function(sum){
            ctrl.donateItems.append($('<div/>', { 'class' : 'item' }).append(
                $('<div/>', { 'class':'ninjas', width:(sum*24) }),
                $('<form/>', { action:'https://www.paypal.com/cgi-bin/webscr', method:'post', target:'_blank' }).append(
                    $('<input/>', { 'type':'hidden', name:'cmd', value:'_donations' }),
                    $('<input/>', { 'type':'hidden', name:'business', value:'Q38M53VCH5ES6' }),
                    $('<input/>', { 'type':'hidden', name:'lc', value:'US' }),
                    $('<input/>', { 'type':'hidden', name:'item_name', value:'Player for Google Chrome' }),
                    $('<input/>', { 'type':'hidden', name:'amount', value: sum.toFixed(2) }),
                    $('<input/>', { 'type':'hidden', name:'currency_code', value: 'USD' }),
                    $('<input/>', { 'type':'hidden', name:'bn', value: 'PP-DonationsBF:btn_donate_SM.gif:NonHosted' }),
                    $('<input/>', { 'type':'hidden', name:'no_note', value: '0' }),
                    $('<input/>', { 'type':'hidden', name:'cn', value: 'Write your message to the author' }),
                    $('<input/>', { 'type':'hidden', name:'no_shipping', value: 1 }),
                    $('<input/>', { 'type':'hidden', name:'rm', value: 1 }),
                    $('<input/>', { 'type':'hidden', name:'return', value:'http://hidev.it/thanks' }),
                    $('<input/>', { 'type':'image', name:'submit', border:0, src:'https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif', alt:'PayPal - The safer, easier way to pay online!' }),
                    $('<img/>', { border:0, src:'https://www.paypalobjects.com/en_US/i/scr/pixel.gif',  width:1, height:1, alt:'' })
                )
            ))
        });


        $el.append(ctrl.donateItems, ctrl.ninja);

        $el.bind('addedToDom', function(){
            $(document).bind('click.donateWidgetCloseHandler', function(ev){
                var $clicked = $(ev.srcElement);
                if($clicked.parents('#donate-widget').size() == 0 || $clicked.is('#donate-widget')) {
                    $el.unbind('addedToDom');
                    $(document).unbind('click.donateWidgetCloseHandler');
                    me.$element.remove();
                }
            });
        })
    }

    app.classes.DonateWidget = DonateWidget;

})(ChromePlayer);