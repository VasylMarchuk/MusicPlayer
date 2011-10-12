(function(app){

    var SearchWidget = app.classes.SearchWidget;
	var PlayerWidget = app.classes.PlayerWidget;
	var TrackListWidget = app.classes.TrackListWidget;
	var StatusBarWidget = app.classes.StatusBarWidget;
	var WelcomeWidget = app.classes.WelcomeWidget;

	//Constructor
	$(function(){
		var bgPage = chrome.extension.getBackgroundPage();
		var player = bgPage.player;

		if(bgPage.popup) {
            player.unbind('.searchWidget');
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
                searchContainer : $('<div />', { id:'search-container' }),
				playerContainer : $('<div />', { id:'player-container' }),
				statusBarContainer : $('<div />', { id:'status-bar-container' }),
				trackListContainer : $('<div />', { id:'track-list-container' })
			};

			var searchWidget = new SearchWidget();
			var trackListWidget = new TrackListWidget(player);
			var playerWidget = new PlayerWidget(player, trackListWidget);
			var statusBarWidget = new StatusBarWidget(player, trackListWidget);

            ctrl.searchContainer.append(searchWidget.$element);
			ctrl.playerContainer.append(playerWidget.$element);
			ctrl.statusBarContainer.append(statusBarWidget.$element);
			ctrl.trackListContainer.append(trackListWidget.$element);

			$('#main-content').empty().append(ctrl.searchContainer, ctrl.playerContainer, ctrl.statusBarContainer, ctrl.trackListContainer);
			
			searchWidget.$element.trigger('addedToDom');
			playerWidget.$element.trigger('addedToDom');
			statusBarWidget.$element.trigger('addedToDom');
			trackListWidget.$element.trigger('addedToDom');

            setTimeout(function(){
                ctrl.searchContainer.css( { '-webkit-transition' : 'all 0.2s linear', '-webkit-transform': 'translate(0,0)', opacity:1 });
                ctrl.playerContainer.css( { '-webkit-transition' : 'all 0.3s linear', '-webkit-transform': 'translate(0,0)', opacity:1 });
                ctrl.trackListContainer.css( { '-webkit-transition' : 'all 0.3s ease-in-out', '-webkit-transform': 'translate(0,0)', opacity:1 });
                ctrl.statusBarContainer.css( { '-webkit-transition' : 'all 0.3s ease-in-out', '-webkit-transform': 'translate(0,0)', opacity:1 });
            }, 300);
		}
	});

})(ChromePlayer);