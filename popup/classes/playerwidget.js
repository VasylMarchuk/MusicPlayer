(function(app){

	var i18n = chrome.i18n;

	function millisecondsToTimeString(milliseconds) {
		var d = new Date(Math.round(milliseconds*1000));

		return (d.getUTCHours()>0 ? (d.getUTCHours()>9 ? d.getUTCHours().toString(10) : '0' + d.getUTCHours().toString(10)) + ':' : '') +
				(d.getUTCMinutes()>9 ? d.getUTCMinutes().toString(10) : '0' + d.getUTCMinutes().toString(10)) + ':' +
				(d.getUTCSeconds()>9 ? d.getUTCSeconds().toString(10) : '0' + d.getUTCSeconds().toString(10));
	}

	function PlayerWidget(player, trackListWidget) {
		var me = this;
		me.player = player;
		me.trackListWidget = trackListWidget;
		
		var $el = me.$element = $('<div/>', { 'id' : 'player-widget' });

		var ctrl = me.controls = {
			play : $('<div/>', {'class':'button play', title:i18n.getMessage('playCurrentTrack')}),
			pause : $('<div/>', {'class':'button pause', title:i18n.getMessage('pauseCurrentTrack')}),
			innerBackground : $('<div/>', {'class':'inner-background'}),
			title : $('<div/>', {'class':'title', text:i18n.getMessage('playbackStopped'), 'data-otext': i18n.getMessage('playbackStopped')}),
			progress : $('<div/>', {'class':'progress'}),
			progressBackground : $('<div>', { 'class':'progress-background' }),
			progressHandle : $('<div>', { 'class':'progress-handle' }),
			time : $('<div/>', {'class':'time'}),
			duration : $('<div/>', {'class':'duration'}),
			playListPosition : $('<div/>', {'class':'playlist-position', text : '0/0', title:i18n.getMessage('revealCurrentTrackInPlayList') }),
			next : $('<div/>', {'class':'button next', title:i18n.getMessage('playNextTrack')}),
			love : $('<div/>', {'class':'button love', title:i18n.getMessage('loveTrack')})
		};

		ctrl.progress.append(ctrl.progressBackground, ctrl.progressHandle);

		ctrl.play.bind({
			click : function(){
				player.resume(function(err){
					if(err) {
						ctrl.title.text(err.message);
						setTimeout(function() {
							ctrl.title.text(ctrl.title.data('otext'));
						}, 1000);
					}
				});
			},
			mousedown : function(){
				$(this).addClass('down');
				ctrl.pause.addClass('down');
			},
			mouseup : function(){
				$(this).removeClass('down');
				ctrl.pause.removeClass('down');
			}
		});

		ctrl.pause.bind({
			click : function(){ player.pause(); },
			mousedown : function(){
				$(this).addClass('down');
				ctrl.play.addClass('down');
			},
			mouseup : function(){
				$(this).removeClass('down');
				ctrl.play.removeClass('down');
			}
		});

		ctrl.next.bind({
			click :function(){ player.playNextAvailable(player.currentTrackId); },
			mousedown : function(){ $(this).addClass('down'); },
			mouseup : function(){ $(this).removeClass('down'); }
		});

		ctrl.playListPosition.bind({
			click :function(){ trackListWidget.scrollToCurrent(); },
			mousedown : function(){ $(this).addClass('down'); },
			mouseup : function(){ $(this).removeClass('down'); }
		});

		ctrl.love.bind({
			click :function(){
				ctrl.love.addClass('down');
				me.player.loveTrack(me.player.currentTrackId, function(){
					ctrl.love.removeClass('down');
				})
			},
			mousedown : function(){ $(this).addClass('down'); },
			mouseup : function(){ $(this).removeClass('down'); }
		});

		ctrl.progressBackground.click(function(ev){
			var total = player.currentDuration;
			var perc = ev.offsetX * 100 / me.controls.progressBackground.width();
			player.seek(total*perc/100);
		});

		ctrl.progressHandle.bind({
			mousedown : function(){
				if(player.currentState != 'stopped') {
					$(this).addClass('down');
				}
			},
			mouseup : function(){ $(this).removeClass('down'); }
		});

		$el.append(ctrl.play, ctrl.pause, ctrl.innerBackground, ctrl.title, ctrl.progress, ctrl.time, ctrl.duration, ctrl.playListPosition, ctrl.next, ctrl.love);

		$el.bind('addedToDom', function(){
			me.initSlider();
			me.updateProgress();
			me.updateTimeDuration();
		});

		player.bind( {
			'playList.playerWidget' : function onPlayList(ev) {
				ctrl.title.text(i18n.getMessage('playbackStopped'));
				ctrl.title.data('otext', i18n.getMessage('playbackStopped'));
				me.updateProgress();
				me.updateTimeDuration();
			},
			'play.playerWidget' : function onPlay(ev, track) {
				me.setPlaying(track.id);
			},
			'pause.playerWidget' : function onPause(ev, track) {
				me.setPaused();
			},
			'timeUpdate.playerWidget' : function onTimeUpdate() {
				me.updateTimeDuration();
			},
			'durationChange.playerWidget' : function onDurationChange() {
				me.updateTimeDuration();
			},
			'progress.playerWidget' : function onProgress() {
				me.updateProgress();
			}
		});

		if(player.currentTrackId !== undefined) {
			me.setPlaying(player.currentTrackId);
		}
	}
	PlayerWidget.prototype.setPlaying = function(trackId) {
		var me = this;
		var track = me.player.getTrack(trackId);
		if(me.player.currentState == 'playing') {
			me.$element.addClass('playing');
		}
		me.controls.title.text(track.artist + ' - ' + track.title);
		me.controls.title.data('otext', track.artist + ' - ' + track.title);
		me.controls.playListPosition.text((me.player.getTrackIndex(trackId) + 1) + '/' + me.player.playList.length);
		me.updateProgress();
	};
	PlayerWidget.prototype.setPaused = function() {
		var me = this;
		me.$element.removeClass('playing');
	};
	PlayerWidget.prototype.initSlider = function() {
		var me = this;

		var $ph = me.controls.progressHandle;
		var $pbg = me.controls.progressBackground;
		var $time = me.controls.time;

		$ph.draggable({
			axis:'x',
			containment:[$pbg.offset().left - $ph.width() / 2,0,$pbg.offset().left + $pbg.width() - $ph.width() / 2,0],
			disabled : me.player.currentState == 'stopped',
			drag : function() {
				var total = me.player.currentDuration;
				var perc = $ph.position().left * 100 / $pbg.width();
				$time.text(millisecondsToTimeString(total*perc/100));
			},
			start : function () {
				$ph.addClass('dragging');
			},
			stop : function(){
				var total = me.player.currentDuration;
				var perc = $ph.position().left * 100 / $pbg.width();
				me.player.seek(total*perc/100);
				$ph.removeClass('down dragging');
			}
		});
	};
	PlayerWidget.prototype.updateTimeDuration = function() {
		function format(num) {
			return num>9 ? num : '0' + num;
		}
		var me = this;

		if(!me.controls.progressHandle.hasClass('down')) {
			me.controls.time.text(millisecondsToTimeString(me.player.currentTime));
			var newleft = 0;
			if(me.player.currentDuration>0) {
				var maxw = me.controls.progressBackground.width();
				var perc = me.player.currentTime * 100 / me.player.currentDuration;
				newleft = Math.round(maxw * perc / 100);
			}
			me.controls.progressHandle.css('left', newleft + 'px');
		}
		me.controls.duration.text(millisecondsToTimeString(me.player.currentDuration));
	};
	PlayerWidget.prototype.updateProgress = function() {
		var me = this;

		var $ph = me.controls.progressHandle;
		var $pbg = me.controls.progressBackground;

		var newwidth = 0;
		if(me.player.currentDuration > 0) {
			var perc = me.player.currentProgress * 100 / me.player.currentDuration;
			newwidth = Math.round($pbg.width() * perc / 100);
		}
		var $ref = $('<div id="progress-shadow-reference"/>').appendTo('body');
		var ref = $ref.css('box-shadow');
		$ref.remove();
		$pbg.css('box-shadow', ref.replace('-200', newwidth));

		me.controls.progressHandle.draggable('option', 'containment', [$pbg.offset().left - $ph.width() / 2,0,$pbg.offset().left + newwidth - $ph.width() / 2,0])
		me.controls.progressHandle.draggable('option', 'disabled', me.player.currentState == 'stopped');
	};

	app.classes.PlayerWidget = PlayerWidget;

})(ChromePlayer);