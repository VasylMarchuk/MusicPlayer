(function(app){

	var PlayerWidget = app.classes.PlayerWidget;
	var TrackListWidget = app.classes.TrackListWidget;
	var StatusBarWidget = app.classes.StatusBarWidget;
	var WelcomeWidget = app.classes.WelcomeWidget;

	//Constructor
	$(function(){

		var bgPage = chrome.extension.getBackgroundPage();
		var player = bgPage.player;

		if(bgPage.popup) {
			player.unbind('.trackWidget');
			player.unbind('.trackListWidget');
			player.unbind('.playerWidget');
			player.unbind('.statusBarWidget');
		}

		bgPage.popup = window;

		if(!player.vk) {
			var welcomeWidget = new WelcomeWidget(player);
			$('#main-content').empty().append(welcomeWidget.$element);
			welcomeWidget.$element.trigger('addedToDom');
		} else {

			var ctrl = {
				playerContainer : $('<div />', { id:'player-container' }),
				statusBarContainer : $('<div />', { id:'status-bar-container' }),
				trackListContainer : $('<div />', { id:'track-list-container' })
			};

			var trackListWidget = new TrackListWidget(player);
			var playerWidget = new PlayerWidget(player, trackListWidget);
			var statusBarWidget = new StatusBarWidget(player, trackListWidget);

			ctrl.playerContainer.append(playerWidget.$element);
			ctrl.statusBarContainer.append(statusBarWidget.$element);
			ctrl.trackListContainer.append(trackListWidget.$element);

			$('#main-content').empty().append(ctrl.playerContainer, ctrl.statusBarContainer, ctrl.trackListContainer);
			
			playerWidget.$element.trigger('addedToDom');
			statusBarWidget.$element.trigger('addedToDom');
			trackListWidget.$element.trigger('addedToDom');
		}
	});

})(ChromePlayer);