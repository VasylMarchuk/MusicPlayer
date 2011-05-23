var player;
var popup;

(function(app){

	player = app.classes.Player;

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
								callback({err:err});
							} else {
								callback({});
							}
						});
					}
				});
				break;
			default:
				callback({err:new Error('Unknown command: ' + request.cmd)});
				break;
		}
	});

})(ChromePlayer);