(function(app){

	var i18n = chrome.i18n;
    var SpinnerWidget = app.classes.SpinnerWidget;

	function clickable(el, onclick) {
		$(el).bind({
			click : onclick,
			mousedown : function(){ $(this).addClass('down'); },
			mouseup : function(){ $(this).removeClass('down'); }
		});
	}

	function SearchWidget(player, playerAndPlayListContainer, trackList) {
		var me = this;
        
        me.player = player;

        playerAndPlayListContainer = $(playerAndPlayListContainer);

		var $el = me.$element = $('<div />', {
			id:'search-widget'
		});

		var ctrl = me.controls = {
			omniBox : $('<input />', {'class':'omnibox', text : '', placeholder : 'Search for Artist or Artist - Title' }),
            clearButton : $('<div />', { 'class' : 'omnibox-clear' }),
            results : $('<div />', {'class':'results'})
		};

        ctrl.clearButton.click(function(){
            ctrl.omniBox.val('');
            ctrl.omniBox.keyup();
        });

        var searchTimeout;
        var delay = true;
        ctrl.omniBox.keyup(function(ev){
            var txt = ctrl.omniBox.val();

            ctrl.clearButton.toggle(txt!='');

            if(txt == ctrl.omniBox.prevValue && ev.keyCode != 13) { //also let the "enter" key get through to allow immediate search
                return;
            }
            if(searchTimeout!==undefined) {
                clearTimeout(searchTimeout);
                //cancel ajax request?
            }
            ctrl.omniBox.prevValue = txt;

            var searchQuery = (function(txt){
                return function (){
//                    ctrl.results.html('Searching…').show().parent().addClass('open');

                    var sw = new SpinnerWidget(delay);
                    delay = false;

                    trackList.controls.scrollBar.hide();
                    ctrl.results.empty().append(sw.$element).show().parent().addClass('open');
                    playerAndPlayListContainer.one('webkitTransitionEnd', function(){
                        trackList.scrollToCurrent();
                        trackList.controls.scrollBar.show();
                    });
                    playerAndPlayListContainer.addClass('collapsed');


                    if(txt.indexOf('-') === -1) { //artist
                        player.lastFm.getArtistTopTracks(txt, true, function(err, tracks){
                            console.log('LFM ANSWER');
                            ctrl.results.empty();
                            if(err) {
                                //TODO: SHOW ERRROR
                            } else {
                                var realArtistName = $('toptracks', tracks).attr('artist');
                                $('track', tracks).each(function(index, track){
                                    ctrl.results.append($('<div/>').html(realArtistName + ' - ' + track.getElementsByTagName('name')[0].textContent));
                                });
                            }
                        })
                    } else { //track
                        var txtParts = txt.split(' - ', 2);
                        player.lastFm.findTrack(txtParts[0], txtParts[1], function(err, tracks){
                            ctrl.results.empty();
                            console.log('LFM ANSWER FOR TRACKS');
                            if(err) {
                                //TODO: SHOW ERRROR
                            } else {
                                $('track', tracks).each(function(index, track){
                                    ctrl.results.append($('<div/>').html(track.getElementsByTagName('artist')[0].textContent + ' - ' + track.getElementsByTagName('name')[0].textContent));
                                });
                            }
                        });
                    }
                };
            })(txt);

            if(txt) {
                searchTimeout = setTimeout(searchQuery, ev.keyCode == 13 ? 0 : 500);
            } else {
                delay = true;

                trackList.controls.scrollBar.hide();
                ctrl.results.hide().parent().removeClass('open');
                playerAndPlayListContainer.one('webkitTransitionEnd', function(){
                    trackList.scrollToCurrent();
                    trackList.controls.scrollBar.show();
                });
                playerAndPlayListContainer.removeClass('collapsed');

            }
        });


        $el.append(ctrl.omniBox, ctrl.clearButton.hide(), ctrl.results.hide());

//		$el.bind('addedToDom', function addedToDom(){
//        });
	}

//	SearchWidget.prototype.setVkStatus = function(username) {
//	};

	app.classes.SearchWidget = SearchWidget;

})(ChromePlayer);