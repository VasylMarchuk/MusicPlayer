(function(app){
    var SearchWidget = app.classes.SearchWidget;
    var PlayerWidget = app.classes.PlayerWidget;
    var TrackListWidget = app.classes.TrackListWidget;
    var StatusBarWidget = app.classes.StatusBarWidget;
    var WelcomeWidget = app.classes.WelcomeWidget;

    var i18n = chrome.i18n;

    function initReloader(bgPage){
        var metaPressed;
        var shiftPressed;
        $(document).bind( {
            keydown : function(e){
                if(e.originalEvent && e.originalEvent.keyIdentifier == 'Meta') {
                    metaPressed = true;
                } else if(e.originalEvent && e.originalEvent.keyIdentifier == 'Shift'){
                    shiftPressed=true;
                } else if (e.keyCode == 82) {// 'r' key
                    if(metaPressed) {
                        e.preventDefault();
                        console.log('Reloading player and pop-up');
                        if(shiftPressed) {
                            bgPage.location.reload(true);
                        }
                        setTimeout(function(){
                            $('#main-content').css('visibility', 'hidden');
                            $(window).unbind('unload.popupCloseMonitor');
                            window.location.reload(true);
                        }, shiftPressed ? 300 : 0);
                    }
                }
            },
            keyup : function(e) {
                if(e.originalEvent && e.originalEvent.keyIdentifier == 'Meta') {
                    metaPressed = false;
                } else if(e.originalEvent && e.originalEvent.keyIdentifier == 'Shift') {
                    shiftPressed = false;
                }
            }
        });
    }

    //Constructor
    $(function(){
        var openTime = Date.now();
        var bgPage = chrome.extension.getBackgroundPage();
        var player = bgPage.player;

        if(bgPage.popup) {
            player.unbind('.searchWidget');
            player.unbind('.trackWidget');
            player.unbind('.trackListWidget');
            player.unbind('.playerWidget');
            player.unbind('.statusBarWidget');
            player.unbind('.mainWindow');
        }

        bgPage.popup = window;
        var isAuthorized = (Boolean)(player.vk && player.lastFm);

        app.analytics.popUpShown(app.isFirstRun);

        $(window).bind('unload.popupCloseMonitor', (function(){
            app.analytics.popUpHidden(isAuthorized, Date.now() - openTime);
        }));

        initReloader(bgPage);

        var $mainContent = $('#main-content');

        if(!isAuthorized) {
            var welcomeWidget = new WelcomeWidget(app.classes.Player);
            $mainContent.empty().addClass('welcome').append(welcomeWidget.$element);
            welcomeWidget.$element.trigger('addedToDom');
        } else {

            if(app.currentAuthTab) {
                chrome.extension.sendRequest({cmd: "authTabShouldClose"});
            }

            player.bind('vkAuthChanged.mainWindow', function(){
                window.location.reload();
            });

            var ctrl = {
                searchContainer : $('<div />', { id:'search-container', 'class':'init-animation' }),
                playerAndTrackListContainer : $('<div/>', { id:'player-and-tracklist-container' }),
                playerContainer : $('<div />', { id:'player-container', 'class':'init-animation' }),
                statusBarContainer : $('<div />', { id:'status-bar-container', 'class':'init-animation' }),
                trackListContainer : $('<div />', { id:'track-list-container', 'class':'init-animation' })
            };

            var trackListWidget = new TrackListWidget(player);
            var searchWidget = new SearchWidget(player, ctrl.playerAndTrackListContainer, trackListWidget);
            var playerWidget = new PlayerWidget(player, trackListWidget);
            var statusBarWidget = new StatusBarWidget(player, trackListWidget, $mainContent);

            ctrl.searchContainer.append(searchWidget.$element);
            ctrl.playerContainer.append(playerWidget.$element);
            ctrl.statusBarContainer.append(statusBarWidget.$element);
            ctrl.trackListContainer.append(trackListWidget.$element);

            $mainContent.empty().append(ctrl.searchContainer, ctrl.playerAndTrackListContainer.append(ctrl.playerContainer, ctrl.trackListContainer) , ctrl.statusBarContainer);

            searchWidget.$element.trigger('addedToDom');
            playerWidget.$element.trigger('addedToDom');
            statusBarWidget.$element.trigger('addedToDom');
            trackListWidget.$element.trigger('addedToDom');

            setTimeout(function(){
                $('.init-animation').removeClass('init-animation');
            }, 300);
        }
    });

})(MusicPlayer);