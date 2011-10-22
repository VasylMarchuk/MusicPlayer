(function(app){

    var i18n = chrome.i18n;
    var SpinnerWidget = app.classes.SpinnerWidget;

    var lastTrackId = 0;

    function clickable(el, onclick) {
        $(el).bind({
            click : onclick,
            mousedown : function(){ $(this).addClass('down'); },
            mouseup : function(){ $(this).removeClass('down'); }
        });
    }

    function createTrack(artist, track, playList, player){
        var trackObject = {
            artist:artist,
            title:track,
            scrobbled:false,
            id:'search-' + (lastTrackId++) + '-' + Date.now().toString()
        };

        playList.push(trackObject);

        var $trackElem = $('<div/>', {'class':'trackitem'});
        $trackElem.append($('<div />', { 'class':'triangle' }), trackObject.artist + ' - ' + trackObject.title);
        $trackElem.click(function(){
            player.loadPlayList(playList, function(err){
                if(err) {
                    console.error(err);
                } else {
                    player.play(trackObject.id, function(err){
                        if(err) {
                            console.error(err);
                        }
                    });
                }
            })
        });

        return $trackElem;
    }

    function SearchWidget(player, playerAndPlayListContainer, trackList) {
        var me = this;

        me.player = player;

        playerAndPlayListContainer = $(playerAndPlayListContainer);

        var $el = me.$element = $('<div />', {
            id:'search-widget'
        });

        var ctrl = me.controls = {
            omniBox : $('<input />', {'class':'omnibox', text : '', placeholder : i18n.getMessage('searchBoxPlaceholder') }),
            clearButton : $('<div />', { 'class' : 'omnibox-clear' }),
            results : $('<div />', {'class':'results'}),

            viewPort : $('<div/>', {'class':'viewport'}),
            overView : $('<div/>', {'class':'overview'}),
            scrollBar : $('<div/>', {'class':'scrollbar'}),
            scrollBarTrack : $('<div/>', {'class':'track'}),
            scrollBarThumb : $('<div/>', {'class':'thumb'}),
            scrollBarEnd : $('<div/>', {'class':'end'})
        };

        var spinnerWidget;

        ctrl.scrollBarThumb.append(ctrl.scrollBarEnd);
        ctrl.scrollBarTrack.append(ctrl.scrollBarThumb);
        ctrl.scrollBar.append(ctrl.scrollBarTrack);
        ctrl.viewPort.append(ctrl.overView);

        ctrl.results.append(ctrl.scrollBar,  ctrl.viewPort);

        ctrl.results.tinyscrollbar({sizethumb: 15});

        ctrl.clearButton.click(function(){
            ctrl.omniBox.val('');
            ctrl.omniBox.keyup();
        });

        var searchTimeout;
        var delay = true;

        ctrl.omniBox.keydown(function(ev){
            if(ev.keyCode == 40 || ev.keyCode == 38) {
                var down = ev.keyCode == 40;
                if(ctrl.overView.children().size()>0) {
                    ev.preventDefault();

                    var $current = ctrl.overView.children('.focus');

                    var $next;
                    if($current.size()>0) {
                        $next = down ? $current.next() : $current.prev();
                        if($next.size()>0) {
                            $current.removeClass('focus');
                        }
                    } else {
                        if(down) {
                            $next = ctrl.overView.children().first();
                        } else {
                            $next = ctrl.overView.children().last();
                        }
                    }

                    if($next.size()>0) {
                        $next.addClass('focus');
                        if($next.position().top + ($next.outerHeight()*2) < ctrl.overView.height()) {
                            var scr = $next.position().top;

                            if(down) {
                                if($current.size() && (ctrl.overView.position().top < ($next.position().top + $next.outerHeight())) && $next.next().size()>0) {
                                    scr -= $next.outerHeight();
                                }
                            } else {
                                if($current.size() && (ctrl.overView.position().top < ($next.position().top + $next.outerHeight())) && $next.prev().size()>0) {
                                    scr -= $next.outerHeight();
                                }
                            }
                            ctrl.results.tinyscrollbar_update(scr);
                        }
                    }
                }
            }
        });

        ctrl.omniBox.keyup(function(ev){

            if(ev.keyCode == 13 && ctrl.overView.children('.focus').size()>0) {
                ctrl.overView.children('.focus').click();
                return;
            }

            var txt = ctrl.omniBox.val();

            ctrl.clearButton.toggle(txt!='');

            if(txt == ctrl.omniBox.prevValue && ev.keyCode != 13) { //also let the "enter" key get through to allow immediate search
                return;
            }

            ctrl.results.children('.focus').removeClass('focus');

            if(searchTimeout!==undefined) {
                clearTimeout(searchTimeout);
                //cancel ajax request?
            }
            if(spinnerWidget) {
                spinnerWidget.$element.remove();
            }
            ctrl.omniBox.prevValue = txt;

            var searchQuery = (function(txt){
                return function (){
                    spinnerWidget = new SpinnerWidget(delay);
                    delay = false;

                    if(!playerAndPlayListContainer.hasClass('collapsed')) {
                        trackList.controls.scrollBar.hide();
                    }

                    ctrl.overView.empty();
                    ctrl.results.append(spinnerWidget.$element).show().parent().addClass('open');

                    playerAndPlayListContainer.one('webkitTransitionEnd', function(){
                        trackList.scrollToCurrent();
                        if(trackList.playList && trackList.playList.length) {
                            if(!trackList.controls.scrollBar.hasClass('disable')) {
                                trackList.controls.viewPort.removeClass('wide');
                                trackList.controls.scrollBar.show();
                            }
                        }
                    });
                    playerAndPlayListContainer.addClass('collapsed');

                    app.analytics.search();

                    var playList = [];

                    if(txt.indexOf('-') === -1) { //artist
                        player.lastFm.getArtistTopTracks(txt.trim(), false, function(err, tracks){
                            ctrl.overView.empty();
                            ctrl.scrollBar.hide();
                            spinnerWidget.$element.remove();
                            var $m = $('<div/>', { 'class' : 'message' });

                            if(err) {
                                ctrl.overView.empty().append($m);
                                if(err.message && err.message.indexOf('code=6;')!==-1) {
                                    $m.text(i18n.getMessage('searchNoResults'));
                                } else {
                                    $m.text(i18n.getMessage('searchUnknownError'));
                                }
                            } else {
                                var realArtistName = $('toptracks', tracks).attr('artist');
                                $('track', tracks).each(function(index, track){
                                    ctrl.overView.append(createTrack(realArtistName, track.getElementsByTagName('name')[0].textContent, playList, player));
                                });
                                if(ctrl.overView.children().size()==0) {
                                    ctrl.overView.empty().append($m);
                                    $m.text(i18n.getMessage('searchNoResults'));
                                }
                                if(ctrl.overView.children().size()>4) {
                                    ctrl.scrollBar.show();
                                }
                            }
                            setTimeout(function(){ ctrl.results.tinyscrollbar_update(); }, 100);
                        })
                    } else { //track
                        var txtParts = txt.split(' - ', 2);
                        if(txtParts[0].trim() && txtParts[1].trim()) {
                            player.lastFm.findTrack(txtParts[0], txtParts[1], function(err, tracks){
                                spinnerWidget.$element.remove();
                                ctrl.overView.empty();
                                ctrl.scrollBar.hide();
                                var $m = $('<div/>', { 'class' : 'message' });

                                if(err) {
                                    ctrl.overView.empty().append($m);
                                    if(err.message && err.message.indexOf('code=6;')!==-1) {
                                        $m.text(i18n.getMessage('searchNoResults'));
                                    } else {
                                        $m.text(i18n.getMessage('searchUnknownError'));
                                    }
                                } else {
                                    $('track', tracks).each(function(index, track){
                                        ctrl.overView.append(createTrack(track.getElementsByTagName('artist')[0].textContent, track.getElementsByTagName('name')[0].textContent, playList, player));
                                    });
                                    if(ctrl.overView.children().size()==0) {
                                        ctrl.overView.empty().append($m);
                                        $m.text(i18n.getMessage('searchNoResults'));
                                    }
                                    if(ctrl.overView.children().size()>4) {
                                        ctrl.scrollBar.show();
                                    }
                                }
                                setTimeout(function(){ ctrl.results.tinyscrollbar_update(); }, 100);
                            });
                        }
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
                    if(!trackList.controls.scrollBar.hasClass('disable')) {
                        if(trackList.playList && trackList.playList.length) {
                            trackList.controls.scrollBar.show();
                        }
                    } else {
                        trackList.controls.viewPort.addClass('wide');
                    }
                });
                playerAndPlayListContainer.removeClass('collapsed');

            }
        });


        $el.append(ctrl.omniBox, ctrl.clearButton.hide(), ctrl.results.hide());
    }

//	SearchWidget.prototype.setVkStatus = function(username) {
//	};

    app.classes.SearchWidget = SearchWidget;

})(ChromePlayer);