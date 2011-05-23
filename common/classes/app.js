var ChromePlayer;

(function(){

	function Application() {
		this.classes = {};
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