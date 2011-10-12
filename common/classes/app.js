var ChromePlayer;

(function(){

	function Application() {
		this.classes = {};
        this.LASTFM_API_KEY = 'b6ee0c125425b77a1d35c95e1ac7647c';
        this.LASTFM_API_SECRET = 'bc88fab51c9bc69376bfaece2566dada';
        this.VK_APP_ID = "2387324";
	}

	Application.prototype.md5 = function() {
		throw new Error('MD5 module has not been loaded');	
	};

	Application.prototype.cbk = function(callback, args) {
		if(callback) {
			var argsa = Array.prototype.slice.apply(arguments, [1]);
			if(argsa.length>0 && !(argsa[0] instanceof Error)) {
				argsa.unshift(undefined);
			}
			callback.apply(undefined, argsa);
		}
	};

	ChromePlayer = new Application();
	
})();