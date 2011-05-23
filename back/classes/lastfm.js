(function(app){

	var apiBase = 'http://ws.audioscrobbler.com/2.0/';

	var cbk = app.cbk;

	function sign(params, apiSecret) {
		delete params['api_sig'];

		var signature = [];
		for(var key in params) {
			if(params[key] !== undefined) {
				signature.push(key+params[key]);
			}
		}

		signature.sort();

		params.api_sig = app.md5(signature.join('')+apiSecret);

		return params;
	}

	function handleXmlError(xml, callback) {
		var $xml = $(xml);
		if($xml.find('lfm').attr('status')=='failed') {
			cbk(callback, new Error('Api call failed: code=' + $xml.find('error').attr('code') + '; message=' + $xml.find('error').text()));
			return true;
		}
		return false;
	}

	function LastFm(sessionKey, apiKey, apiSecret) {
		var me = this;
		me.sessionKey = sessionKey;
		me.apiKey = apiKey;
		me.apiSecret = apiSecret;
	}

	LastFm.getSession = function(apiKey, apiSecret, token, callback) {
		$.get(apiBase, sign({
			method : 'auth.getSession',
			api_key : apiKey,
			api_sig : apiSecret,
			token : token
		}, apiSecret), function(xml, status) {
			if(status == 'success' && $.isXMLDoc(xml)) {
				var $xml = $(xml);
				if($xml.find('lfm').attr('status')=='ok') {
					cbk(callback, {
						name : $xml.find('name').text(),
						key : $xml.find('key').text(),
						subscriber : $xml.find('subscriber').text()
					});
					return;
				}
			}
			cbk(callback, new Error('Could not fetch session'));
		});
	};
	LastFm.getToken = function(apiKey, apiSecret, callback) {
		$.get(apiBase, sign({method:'auth.getToken', api_key:apiKey}, apiSecret), function(xml, status) {
			if(status == 'success' && $.isXMLDoc(xml)) {
				var $xml = $(xml);
				if($xml.find('lfm').attr('status')=='ok') {
					cbk(callback, $xml.find('token').text());
					return;
				}
			}
			cbk(callback, new Error('Could not fetch token'));
		});
	};
	LastFm.authToken = function(apiKey, token, callback) {
		chrome.tabs.create({url:'http://www.last.fm/api/auth/?api_key='+apiKey+'&token='+token}, function tabCreated(tab){

			console.log(tab);

			var authedHandler = function authedHandler(request, sender, back) {
				if(request.cmd == 'authSuccess') {
					cbk(callback);
					chrome.extension.onRequest.removeListener(authedHandler);
					chrome.tabs.remove(tab.id);
				}
				back({});
			};

			chrome.extension.onRequest.addListener(authedHandler);
		});
	};

	LastFm.prototype.apiCall = function(params, method, callback) {
		var me = this;

		if(method !== undefined && typeof method == 'function') {
			callback = method;
			method = 'GET';
		}

		params.api_key = me.apiKey;
		params.sk = me.sessionKey;

		$.ajax({
			url: apiBase,
			data: sign(params, me.apiSecret),
			type : method,
			success: function(xml, status) {
				if(status == 'success' && $.isXMLDoc(xml)) {
					if($(xml).find('lfm').attr('status')=='ok') {
						cbk(callback);
						return;
					} else if(handleXmlError(xml, callback)) {
						return;
					}
				}
				cbk(callback, new Error('Api call failed: status=' + status + '; isXMLDoc=' + $.isXMLDoc(xml)));
			},
			error : function(jqXHR, textStatus, errorThrown) {
				if($.isXMLDoc(jqXHR.responseXML) && handleXmlError(jqXHR.responseXML, callback)) {
					return;
				}
				
				cbk(callback, new Error('Api call failed: status=' + textStatus + (errorThrown ? '; error=' + errorThrown : '')));
			}
		});
	};

	LastFm.prototype.setNowPlaying = function(artist, title, album, duration, callback) {
		var me = this;
		me.apiCall({
			method : 'track.updateNowPlaying',
			artist:artist,
			track:title,
			album:album,
			duration:parseInt(duration)
		}, 'POST', callback);
	};
	LastFm.prototype.scrobble = function(artist, title, album, duration, callback){
		var me = this;
		me.apiCall({
			method : 'Track.scrobble',
			artist:artist,
			track:title,
			album:album,
			duration: parseInt(duration),
			timestamp: parseInt(Date.now()/1000.0)
		}, 'POST', callback);
	};
	LastFm.prototype.loveTrack = function(artist, title, callback){
		var me = this;
		me.apiCall({
			method : 'Track.love',
			artist : artist,
			track : title
		}, 'POST', callback)
	};

	app.classes.LastFm = LastFm;

})(ChromePlayer);