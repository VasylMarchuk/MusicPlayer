(function(app){

	function Analytics() {
		var me = this;
		window._gaq = window._gaq || [];

		me.setAccount(app.GA_ACCOUNT);
		me.trackPageView();

		(function() {
			var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
			ga.src = 'https://ssl.google-analytics.com/ga.js';
			var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
		})();
	}

	Object.defineProperty(Analytics.prototype, 'ga', {
		get : function(){
			return window._gaq;
		}
	});

	Analytics.prototype.setAccount = function(acc){
		return this.ga.push(['_setAccount', acc]);
	};
	Analytics.prototype.trackPageView = function(){
		return this.ga.push(['_trackPageview']);
	};

	Analytics.prototype.popUpShown = function(firstRun){
		return this.ga.push(['_trackEvent', 'App', 'Popup opened' + (firstRun ? ' - first run' : '')]);
	};
	Analytics.prototype.popUpHidden = function(wasAuthorized, timeSpent){
		return this.ga.push(['_trackEvent', 'App', 'Popup closed - '+ (wasAuthorized?'authorized':'unauthorized'), undefined, timeSpent]);
	};

	Analytics.prototype.vkAuthBegin = function() {
		return this.ga.push(['_trackEvent', 'App', 'VK auth began']);
	};
	Analytics.prototype.vkAuthComplete = function() {
		return this.ga.push(['_trackEvent', 'App', 'VK auth complete']);
	};
	Analytics.prototype.lastFmAuthBegin = function() {
		return this.ga.push(['_trackEvent', 'App', 'Last.fm auth began']);
	};
	Analytics.prototype.lastFmAuthComplete = function() {
		return this.ga.push(['_trackEvent', 'App', 'Last.fm auth complete']);
	};
	Analytics.prototype.authComplete = function() {
		return this.ga.push(['_trackEvent', 'App', 'Auth complete']);
	};
	Analytics.prototype.clearAuth = function() {
		return this.ga.push(['_trackEvent', 'App', 'Clear auth']);
	};

	Analytics.prototype.search = function() {
		return this.ga.push(['_trackEvent', 'UI', 'Search']);
	};
	Analytics.prototype.playButton = function() {
		return this.ga.push(['_trackEvent', 'UI', 'Play']);
	};
	Analytics.prototype.pauseButton = function() {
		return this.ga.push(['_trackEvent', 'UI', 'Pause']);
	};
	Analytics.prototype.nextButton = function() {
		return this.ga.push(['_trackEvent', 'UI', 'Next']);
	};
	Analytics.prototype.nextMp3 = function() {
		return this.ga.push(['_trackEvent', 'UI', 'Next mp3']);
	};
	Analytics.prototype.scrollToCurrent = function() {
		return this.ga.push(['_trackEvent', 'UI', 'Scroll to current']);
	};
	Analytics.prototype.settingsMenu = function() {
		return this.ga.push(['_trackEvent', 'UI', 'Settings menu']);
	};
    Analytics.prototype.aboutShown = function(){
        return this.ga.push(['_trackEvent', 'UI', 'About window opened']);
    };

	Analytics.prototype.loadPlayList = function() {
		return this.ga.push(['_trackEvent', 'Player', 'Load playlist']);
	};
	Analytics.prototype.play = function(isNext) {
		return this.ga.push(['_trackEvent', 'Player', 'Play' + (isNext ? ' next' : '')]);
	};
	Analytics.prototype.toggleScrobbling = function(on) {
		return this.ga.push(['_trackEvent', 'Player', 'Toggle scrobbling ' + (on ? 'on' : 'off')]);
	};
	Analytics.prototype.loveTrack = function(on) {
		return this.ga.push(['_trackEvent', 'Player', (on ? 'Love' : 'Unlove') + ' track']);
	};

	app.classes.Analytics = Analytics;
	Object.defineProperty(app, 'analytics', {
		value : new Analytics()
	});
	
})(ChromePlayer);