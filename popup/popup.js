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

        var metaPressed;
        $(document).bind( {
            keydown : function(e){
                if(e.originalEvent.keyIdentifier == 'Meta') {
                    metaPressed = true;
                } else if (e.keyCode == 82) {// 'r' key
                    if(metaPressed) {
                        console.log('Reloading player and pop-up');
                        bgPage.location.reload(true);
                        window.location.reload(true);
                    }
                }
            },
            keyup : function(e) {
                if(e.originalEvent.keyIdentifier == 'Meta') {
                    metaPressed = false;
                }
            }
        });

        var $mainContent = $('#main-content');

        if(!player.vk) {
            var welcomeWidget = new WelcomeWidget(player);
            $mainContent.empty().append(welcomeWidget.$element);
            welcomeWidget.$element.trigger('addedToDom');
        } else {

            var ctrl = {
                searchContainer : $('<div />', { id:'search-container', 'class':'init-animation' }),
                playerContainer : $('<div />', { id:'player-container', 'class':'init-animation' }),
                statusBarContainer : $('<div />', { id:'status-bar-container', 'class':'init-animation' }),
                trackListContainer : $('<div />', { id:'track-list-container', 'class':'init-animation' })
            };

            var searchWidget = new SearchWidget(player);
            var trackListWidget = new TrackListWidget(player);
            var playerWidget = new PlayerWidget(player, trackListWidget);
            var statusBarWidget = new StatusBarWidget(player, trackListWidget);

            ctrl.searchContainer.append(searchWidget.$element);
            ctrl.playerContainer.append(playerWidget.$element);
            ctrl.statusBarContainer.append(statusBarWidget.$element);
            ctrl.trackListContainer.append(trackListWidget.$element);

            $mainContent.empty().append(ctrl.searchContainer, ctrl.playerContainer, ctrl.trackListContainer, ctrl.statusBarContainer);

            searchWidget.$element.trigger('addedToDom');
            playerWidget.$element.trigger('addedToDom');
            statusBarWidget.$element.trigger('addedToDom');
            trackListWidget.$element.trigger('addedToDom');

            setTimeout(function(){
                $('.init-animation').removeClass('init-animation');
            }, 300);
        }
    });

})(ChromePlayer);