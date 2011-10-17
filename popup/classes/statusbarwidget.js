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
			lastFmStatus : $('<div/>', {'class':'status-bar-item lastfm-status', text : 'Last.fm: unlogged' }),
			vkStatus : $('<div/>', {'class':'status-bar-item vk-status', text : i18n.getMessage('vkontakte') + ': unlogged' }),
			scrobblingStatus : $('<div/>', {'class':'status-bar-item scrobbling-status', text : i18n.getMessage('scrobblingStatusOff'), title:i18n.getMessage('toggleScrobbling') }),
			playListPosition : $('<div/>', {'class':'status-bar-item playlist-position', text : '0/0', title:i18n.getMessage('revealCurrentTrackInPlayList') })
		};

		clickable(ctrl.playListPosition, function(){ me.trackListWidget.scrollToCurrent(); });
		clickable(ctrl.scrobblingStatus, function(){ me.player.toggleScrobbling(!me.player.scrobblingEnabled); });

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

		$el.append(ctrl.lastFmStatus, ctrl.vkStatus, ctrl.playListPosition, ctrl.scrobblingStatus);
		
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