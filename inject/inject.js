var ChromePlayer = {
	classes : {}
};

function Parser(){
	this.tracks = [];
}
Parser.prototype.parse = function(){};
Parser.prototype.addTrack = function(track){
	this.tracks.push(track);
};
Parser.prototype.generateLink = function(track){
	var parser = this;

	var $button = $('<img />', {
		'class' : 'lastplayer button play',
		src:chrome.extension.getURL('inject/play.png'),
		align:'absmiddle',
		title:chrome.i18n.getMessage("playInPlayer")
	}).hide();

	$button.click(function(){
		console.log('Clicked', track, 'from', parser);
		track.play();
	});

	return $button;
};

function ParsersManager() {
	this.parsers = [];
}
ParsersManager.prototype.addParser = function(parser){
	if(!parser instanceof Parser) {
		throw new Error("parser argument should inherit from Parser");
	}
	this.parsers.push(parser);
	parser.parse();
};

function Track(id, artist, title, playlist, row) {
	this.id = id;
	this.artist = artist;
	this.title = title;
	this.playList = playlist;
	this.row = row;
}
Track.prototype.toObject = function(){
	return {
		artist:this.artist,
		title:this.title,
		scrobbled:false,
		id:this.id
	};
};
Track.prototype.play = function(){
	var me = this;

	var plTracks = [];
	for(var ti=0; ti<this.playList.tracks.length; ti++) {
		plTracks.push(this.playList.tracks[ti].toObject());
	}

	chrome.extension.sendRequest({cmd: "loadPlayList", playList:plTracks, trackId:this.id}, function(response) {
		if(response && response.err && response.err.code === 156) {
			var welcomeMessage = new WelcomeMessage(response.vkLoginText, response.vkInfoMessageText, function(err){
				if(!err) {

					me.play();

				}
			});

			$('body').append(welcomeMessage.$element);
			welcomeMessage.$element.trigger('addedToDom');
		}
	});
};

function decodeTitle(title) {
	return decodeURIComponent(decodeURIComponent(title).replace(/\+/g, '%20'));
}

var expressions = {
	isUnderscore : /\/_\//i,
	artistUnderscoreTitle : /([^\/]*?)(?:\/_\/)(.*)$/i,
	artistAlbumTitle : /\//i
};
var hrefArtistRegex = /([^\/]*?)(?:\/_\/)(.*)$/i;
var parsersManager = new ParsersManager();