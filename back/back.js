var player;
var popup;

(function(app){

	player = app.classes.Player;

	var i18n = chrome.i18n;

	chrome.extension.onRequest.addListener(function(request, sender, callback) {

		switch(request.cmd) {
			case 'loadPlayList':
				player.loadPlayList(request.playList, function(err){
					if(err) {
						console.error(err);
						callback({err:err});
					} else {
						player.play(request.trackId, function(err){
							if(err) {
								console.error(err);

								if(err.code == 156) {
									callback({err:err, vkLoginText:i18n.getMessage('loginToVk'), vkInfoMessageText:i18n.getMessage('vkInfoMessage')});
								} else {
									callback({err:err});
								}

							} else {
								callback({});
							}
						});
					}
				});
				break;
			case 'doVkAuth':
					chrome.tabs.getSelected(null, function(currTab){
						player.vkAuth(function(err){
							if(err) {
								console.error(err);
								callback({err:err});
							} else {
								if(currTab) {
									chrome.tabs.update(currTab.id, {selected:true});
								}
								callback({});
							}
						});
					});
			break;
			default:
				callback({err:new Error('Unknown command: ' + request.cmd)});
				break;
		}
	});

})(ChromePlayer);