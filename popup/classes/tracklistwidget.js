(function(app){

	function TrackListWidget(player, playerWidget) {
		var me = this;
		me.player = player;
		me.playerWidget = playerWidget;
		
		var $el = me.$element = $('<div />', {
			id:'track-list'
		});
		$el.trackListWidget = me;

		var ctrl = me.controls = {
			scrollBar : $('<div/>', {'class':'scrollbar'}),
			scrollBarTrack : $('<div/>', {'class':'track'}),
			scrollBarThumb : $('<div/>', {'class':'thumb'}),
			scrollBarEnd : $('<div/>', {'class':'end'}),
			viewPort : $('<div/>', {'class':'viewport'}),
			overView : $('<div/>', {'class':'overview'})
		};

		ctrl.scrollBarThumb.append(ctrl.scrollBarEnd);
		ctrl.scrollBarTrack.append(ctrl.scrollBarThumb);
		ctrl.scrollBar.append(ctrl.scrollBarTrack);
		ctrl.viewPort.append(ctrl.overView);

		$el.append(ctrl.scrollBar,  ctrl.viewPort);

		$el.bind('addedToDom', function addedToDom(){
			me.initScroll();

			if(player.playList) {
				me.loadPlayList(player.playList);
			}
		});

		player.bind('play.trackListWidget', function(ev, track, isNext){
			console.log('Player is playing track #%s', track.id);

			if(isNext) {
				me.scrollToCurrent();
			}
		});

		player.bind('playList.trackListWidget', function(ev) {
			me.loadPlayList(player.playList);
		});
	}

	TrackListWidget.prototype.loadPlayList = function loadPlayList(playList) {
		var me = this;

		var TrackWidget = app.classes.TrackWidget;

		me.controls.overView.empty();
		me.controls.viewPort.removeClass('wide');

		if(playList) {
			if(playList.length<12) {
				me.controls.viewPort.addClass('wide');
			}
			playList.forEach(function(track, index) {
				var tw = new TrackWidget(me.player, index, track);
				me.controls.overView.append(tw.$element);
				tw.$element.trigger('addedToDom');
			});
		}

        //dirty :(
		setTimeout(function(){
            me.initScroll();
        }, 200);
	};

	TrackListWidget.prototype.initScroll = function initScroll() {
		var me = this;
		me.$element.tinyscrollbar();

		if(me.controls.scrollBar.hasClass('disable')) {
			setTimeout(function(){ me.scrollToCurrent(); }, 100);
		} else if(me.player.currentTrackId) {
			me.scrollToCurrent();
		}
	};

	TrackListWidget.prototype.updateScroll = function updateScroll(to) {
		var me = this;
		me.$element.update(to);
	};

	TrackListWidget.prototype.scrollToCurrent = function scrollToCurrent() {
		var me = this;
		if(me.player.currentTrackId) {
			var $scrollTo = me.$element.find('#track-widget-' + me.player.currentTrackId);

			if(!$scrollTo.size()) {
				return;
			}

			var toPos = ($scrollTo.offset().top - me.controls.overView.position().top) - me.$element.offset().top - 12;
			if(toPos > me.controls.overView.height() - me.controls.viewPort.height()) {
				toPos = 'bottom';
			}

			me.updateScroll(toPos);
		} else {
			me.updateScroll();
		}
	};


	//	TrackListWidget.prototype.setPaused = function() {
	//		this.$element.addClass('paused');
	//	};

	app.classes.TrackListWidget = TrackListWidget;

})(ChromePlayer);