(function(app){

	var i18n = chrome.i18n;

	function StatusBarWidget(player, trackListWidget) {
		var me = this;
		me.player = player;
		me.trackListWidget = trackListWidget;

		var $el = me.$element = $('<div />', {
			id:'status-bar-widget'
		});
		$el.trackListWidget = me;

		var ctrl = me.controls = {
			lastFmStatus : $('<div/>', {'class':'status-bar-item lastfm-status', text : 'LastFm: unlogged', title:i18n.getMessage('loginToLastFm') }),
			vkStatus : $('<div/>', {'class':'status-bar-item vk-status', text : 'ВКонтакте: unlogged', title:i18n.getMessage('loginToVk') }),
			scrobblingStatus : $('<div/>', {'class':'status-bar-item scrobbling-status', text : i18n.getMessage('scrobblingStatusOff'), title:i18n.getMessage('toggleScrobbling') }),
			playListPosition : $('<div/>', {'class':'status-bar-item playlist-position', text : '0/0', title:i18n.getMessage('revealCurrentTrackInPlayList') })
		};

		ctrl.playListPosition.bind({
			click :function(){ me.trackListWidget.scrollToCurrent(); },
			mousedown : function(){ $(this).addClass('down'); },
			mouseup : function(){ $(this).removeClass('down'); }
		});

		ctrl.scrobblingStatus.bind({
			click :function(){ me.player.toggleScrobbling(!me.player.scrobblingEnabled); },
			mousedown : function(){ $(this).addClass('down'); },
			mouseup : function(){ $(this).removeClass('down'); }
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
			},
			'scrobblingDisabled.statusBarWidget' : function onScrobblingDisabled() {
				me.setScrobblingStatus(false);
			}
		});

		if(player.currentTrackId !== undefined) {
			me.setPlayListPosition(player.currentTrackId);
		}

		me.setScrobblingStatus(me.player.scrobblingEnabled);

		$el.append(ctrl.lastFmStatus, ctrl.vkStatus, ctrl.scrobblingStatus, ctrl.playListPosition);
		
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

	app.classes.StatusBarWidget = StatusBarWidget;

})(ChromePlayer);