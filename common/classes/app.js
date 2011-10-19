var ChromePlayer;

(function(window){

	function Application() {
		var me = this;
		
		me.classes = {};
		me.LASTFM_API_KEY = 'b6ee0c125425b77a1d35c95e1ac7647c';
		me.LASTFM_API_SECRET = 'bc88fab51c9bc69376bfaece2566dada';
		me.VK_APP_ID = "2387324";
		me.GA_ACCOUNT = 'UA-26418593-2';
		
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

	Object.defineProperty(Application.prototype, 'analytics', {
		get : function(){
			throw new Error('Analytics module has not been loaded');
		},
		configurable : true
	});

	ChromePlayer = new Application();

})(window);