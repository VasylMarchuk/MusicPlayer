(function(){

	function TrackListParser(block){
		this.__proto__.__proto__.constructor.call(this); //call superconstructor
		this.block = block;
	}
	TrackListParser.prototype.__proto__ = Parser.prototype;


	TrackListParser.prototype.parse = function() {
		var parser = this;

		$(this.block).find('tr').each(function(){
			var $row = $(this);
			var $links = $row.find('td.smallmultibuttonCell a, td.multibuttonCell a'); //td.subjectCell

			$links.each(function(){
				var href = $(this).attr('href');
				try {
					var artist;
					var title;
					if(expressions.isUnderscore.test(href)) {
						var res = expressions.artistUnderscoreTitle.exec(href);
						artist = res[1];
						title = res[2];
					} else {
						res = href.split(expressions.artistAlbumTitle).slice(-3);
						artist = res[0];
						title = res[2];
					}
					if(res) {
						var track = new Track($row.data('trackId'), decodeTitle(artist), decodeTitle(title), parser, this);
						parser.addTrack(track);
						var $tgt = $row.find('td.playbuttonCell div').size()>0 ? $row.find('td.playbuttonCell div') : $row.find('td.playbuttonCell');
						$tgt.append(parser.generateLink(track));
					} else {
						console.error('Could not parse song: ', href);
					}
				} catch(e) {
					console.error('Could not parse song: ', e);
				}
			});

		});
	};

	$('table.tracklist, table.chart').each(function(){
		parsersManager.addParser(new TrackListParser(this));
	});
})();