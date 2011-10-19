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

	Analytics.prototype.popUpShown = function(){
		return this.ga.push(['_trackEvent', 'UI', 'Popup Opened']);
	};
	Analytics.prototype.popUpHidden = function(wasAuthorized, timeSpent){
		return this.ga.push(['_trackEvent', 'UI', 'Popup Closed - '+ (wasAuthorized?'authed':'unauthed'), undefined, timeSpent]);
	};

	app.classes.Analytics = Analytics;
	Object.defineProperty(app, 'analytics', {
		value : new Analytics()
	});
	
})(ChromePlayer);