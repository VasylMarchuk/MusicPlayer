(function(app){

    function SpinnerWidget() {
        var me = this;

        var $el = me.$element = $('<div/>', { 'class' : 'spinner-widget' });

        var ctrl = me.controls = {
            outer : $('<div/>', { 'class' : 'outer' }),
            middle : $('<div/>', { 'class' : 'middle' }),
            inner : $('<div/>', { 'class' : 'inner' })
        };

        var parts = [];

        var DEG2RAD = 3.14159/180;

        var radius = 14;
        for (var i=0; i < 360; i+=60)
        {
            var degInRad = i*DEG2RAD;
            var p = $('<div/>', { 'class':'part' }).css({ top:radius+Math.cos(degInRad)*radius, left:radius+Math.sin(degInRad)*radius });
            parts.push(p);
            ctrl.inner.append(p);
        }


//        for (var i=0; i<10; i++) {
//            var p = $('<div/>', { 'class':'part' });
//            parts.push(p);
//            ctrl.inner.append(p);
//        }

        $el.append(ctrl.outer.append(ctrl.middle.append(ctrl.inner)));

//		var ctrl = me.controls = {
//			play : $('<div/>', {'class':'button play', title:i18n.getMessage('playCurrentTrack')}),
//			pause : $('<div/>', {'class':'button pause', title:i18n.getMessage('pauseCurrentTrack')}),
//			innerBackground : $('<div/>', {'class':'inner-background'}),
//			title : $('<div/>', {'class':'title', text:i18n.getMessage('playbackStopped'), 'data-otext': i18n.getMessage('playbackStopped')}),
//			progress : $('<div/>', {'class':'progress'}),
//			progressBackground : $('<div>', { 'class':'progress-background' }),
//			progressHandle : $('<div>', { 'class':'progress-handle' }),
//			time : $('<div/>', {'class':'time'}),
//			duration : $('<div/>', {'class':'duration'}),
//			next : $('<div/>', {'class':'button next', title:i18n.getMessage('playNextTrack')}),
//			love : $('<div/>', {'class':'button love disabled', title:i18n.getMessage('loveTrack')})
//		};


//		ctrl.progress.append(ctrl.progressBackground, ctrl.progressHandle);
    }

    app.classes.SpinnerWidget = SpinnerWidget;

})(ChromePlayer);