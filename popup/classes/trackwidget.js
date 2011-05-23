(function(app){

	function TrackWidget(player, index, track) {
		var me = this;
		me.player = player;
		var $el = me.$element = $('<div />', {
			id:'track-widget-' + track.id,
			'class' : 'track-widget ' + (index%2===0?'odd':'even'),
			title : track.artist + ' - ' + track.title
		}).append(
				$('<span/>', {'class':'number', text:(index + 1) + '. '}),
				track.artist + ' - ' + track.title,
				$('<span/>', {'class':'on', text:'ON'})
				);
		$el.trackWidget = me;

		$el.bind({
			click : function(){
				player.play(track.id);
			},
			addedToDom : function(ev) {
				ev.stopPropagation();
			},
			mousedown : function(){ $(this).addClass('down'); },
			mouseup : function(){ $(this).removeClass('down'); }
		});


		player.bind('play.trackWidget', function onPlay(ev, ptrack) {
			me.setPlaying(track.id == ptrack.id);
		});
		player.bind('pause.trackWidget', function onPlay(ev, trackId) {
			if(track.id == trackId) {
				me.setPaused(false);
			}
		});
		player.bind('trackError.trackWidget', function onTrackError(ev, trackId, err) {
			if(track.id == trackId) {
				me.setError(err);
			}
		});

		me.setPlaying(track.id==player.currentTrackId);
		me.setError(player.trackErrors[track.id]);
	}
	TrackWidget.prototype.setPaused = function() {
		this.$element.addClass('paused');
	};
	TrackWidget.prototype.setPlaying = function(isPlaying) {
		this.$element.removeClass('paused').toggleClass('playing', isPlaying);
	};
	TrackWidget.prototype.setError = function(err) {
		var me = this;
		me.$element.toggleClass('error', err ? true : false).prop('title', err ? err.message : me.$element.attr('title'));
	};

	app.classes.TrackWidget = TrackWidget;

})(ChromePlayer);