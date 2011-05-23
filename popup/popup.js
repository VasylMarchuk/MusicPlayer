(function(app){

	var PlayerWidget = app.classes.PlayerWidget;
	var TrackListWidget = app.classes.TrackListWidget;

	//Constructor
	$(function(){

		var bgPage = chrome.extension.getBackgroundPage();
		var player = bgPage.player;

		if(bgPage.popup) {
			player.unbind('.trackWidget');
			player.unbind('.trackListWidget');
			player.unbind('.playerWidget');
		}

		bgPage.popup = window;

		var trackListWidget = new TrackListWidget(player);
		var playerWidget = new PlayerWidget(player, trackListWidget);

		$('#player-container').append(playerWidget.$element);
		playerWidget.$element.trigger('addedToDom');

		$('#track-list-container').append(trackListWidget.$element);
		trackListWidget.$element.trigger('addedToDom');

	});

})(ChromePlayer);