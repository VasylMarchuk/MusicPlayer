(function(app){

    function SpinnerWidget(delay) {
        var me = this;

        var $el = me.$element = $('<div/>', { 'class' : 'spinner-widget' });

        var ctrl = me.controls = {
            outer : $('<div/>', { 'class' : 'outer' }),
            middle : $('<div/>', { 'class' : 'middle' }),
            inner : $('<div/>', { 'class' : 'inner' })
        };

        if(delay) {
            ctrl.inner.addClass('delayed');
        }

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

        $el.append(ctrl.outer.append(ctrl.middle.append(ctrl.inner)));
    }

    app.classes.SpinnerWidget = SpinnerWidget;

})(MusicPlayer);