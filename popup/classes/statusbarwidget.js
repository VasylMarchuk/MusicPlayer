(function(app){

    var i18n = chrome.i18n;

    function clickable(el, onclick) {
        $(el).bind({
            click : onclick,
            mousedown : function(){ $(this).addClass('down'); },
            mouseup : function(){ $(this).removeClass('down'); }
        });
    }

    function StatusBarWidget(player, trackListWidget) {
        var me = this;
        me.player = player;
        me.trackListWidget = trackListWidget;

        var $el = me.$element = $('<div />', {
            id:'status-bar-widget'
        });
        $el.statusBarWidget = me;

        var ctrl = me.controls = {
            scrobblingStatus : $('<div/>', {'class':'status-bar-item scrobbling-status', text : i18n.getMessage('scrobblingStatusOff'), title:i18n.getMessage('toggleScrobbling') }),
            playListPosition : $('<div/>', {'class':'status-bar-item playlist-position', text : '0/0', title:i18n.getMessage('revealCurrentTrackInPlayList') }),
            settingsButton : $('<div/>', {'class':'status-bar-item settings-button'}),
            settingsMenu : $('<div/>', { 'class':'settings-menu' }),

            lastFmStatus : $('<div />', {'class':'item disabled', text:'Last.fm: unlogged'}),
            vkStatus : $('<div />', {'class':'item disabled', text: i18n.getMessage('vkontakte') + ': unlogged'}),
            resetAuth: $('<div />', {'class':'item', text:i18n.getMessage('resetAuthorization')}),
            donate : $('<div />', {'class':'item', text:i18n.getMessage('donate') }).append($('<img/>', {'class':'smiley', src:'smiley.png'})),
            about : $('<div />', {'class':'item', text:i18n.getMessage('about') })
        };

        ctrl.settingsMenu.append(
            ctrl.vkStatus,
            ctrl.lastFmStatus,
            ctrl.resetAuth,
            $('<div />', {'class':'item separator' }),
            ctrl.donate,
            $('<div />', {'class':'item separator' }),
            ctrl.about
        );

        ctrl.settingsMenu.one('webkitAnimationStart', function(){
            ctrl.settingsMenu.css('opacity', 0);
        });
        ctrl.settingsMenu.one('webkitAnimationEnd', function(){
            ctrl.settingsMenu.css('opacity', 1);
        });

        clickable(ctrl.playListPosition, function(){ me.trackListWidget.scrollToCurrent(); });
        clickable(ctrl.scrobblingStatus, function(){ me.player.toggleScrobbling(!me.player.scrobblingEnabled); });
        clickable(ctrl.settingsButton, function(){
            if(ctrl.settingsMenu.is(':visible')) {
                ctrl.settingsMenu.hide();
            } else {
                ctrl.settingsMenu.show();
                function clickHandler(ev){
                    var $clicked = $(ev.srcElement);
                    if($clicked.parents('.settings-menu, .settings-button').size() == 0 && !$clicked.is('.settings-menu, .settings-button')) {
                        $(document).unbind('click', clickHandler);
                        ctrl.settingsMenu.hide();
                    }
                }
                $(document).click(clickHandler);
            }
        });

        ctrl.resetAuth.click(function(){
            me.player.clearAuthorization();
            var bgPage = chrome.extension.getBackgroundPage();
            var views = chrome.extension.getViews();

            bgPage.location.reload(true);
            setTimeout(function(){
                if(views) {
                    for(var vi=0; vi<views.length; vi++) {
                        if(views[vi]!==bgPage && views[vi] !== window) {
                            views[vi].location.reload(true);
                        }
                    }
                }
                window.location.reload(true);
            }, 300);
        });

        player.bind( {
            'playList.statusBarWidget' : function onPlayList(ev) {
                me.setPlayListPosition(undefined);
            },
            'play.statusBarWidget' : function onPlay(ev, track) {
                me.setPlayListPosition(track.id);
            },
            'scrobblingEnabled.statusBarWidget' : function onScrobblingEnabled() {
                me.setScrobblingStatus(true);
                me.setLastFmStatus(localStorage.getItem('lastFmSessionUserName'));
            },
            'scrobblingDisabled.statusBarWidget' : function onScrobblingDisabled() {
                me.setScrobblingStatus(false);
            }
        });

        if(player.currentTrackId !== undefined) {
            me.setPlayListPosition(player.currentTrackId);
        }

        me.setScrobblingStatus(me.player.scrobblingEnabled);
        me.setLastFmStatus(localStorage.getItem('lastFmSessionUserName'));

        if(player.vk) {
            player.vk.getUserName(function(err, name){
                if(!err) {
                    me.setVkStatus(name);
                }
            });
        }

        $el.append(ctrl.settingsButton, ctrl.playListPosition, ctrl.scrobblingStatus, ctrl.settingsMenu.hide());

//		$el.bind('addedToDom', function addedToDom(){});
    }

    StatusBarWidget.prototype.setPlayListPosition = function(trackId) {
        var me = this;
        me.controls.playListPosition.text((trackId===undefined ? 0 : (me.player.getTrackIndex(trackId) + 1)) + '/' + me.player.playList.length);
    };

    StatusBarWidget.prototype.setScrobblingStatus = function(on) {
        var me = this;
        me.controls.scrobblingStatus.text(i18n.getMessage(on ? 'scrobblingStatusOn' : 'scrobblingStatusOff'));
        me.controls.scrobblingStatus.toggleClass('on', on);
    };

    StatusBarWidget.prototype.setLastFmStatus = function(username) {
        var me = this;
        me.controls.lastFmStatus.text('Last.fm: ' + (username || 'unlogged'));
    };
    StatusBarWidget.prototype.setVkStatus = function(username) {
        var me = this;
        me.controls.vkStatus.text(i18n.getMessage('vkontakte') + ': ' + (username || 'unlogged'));
    };

    app.classes.StatusBarWidget = StatusBarWidget;

})(ChromePlayer);