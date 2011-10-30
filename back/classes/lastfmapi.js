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

    function LastFmApi(sessionKey, userName, apiKey, apiSecret) {
        var me = this;
        me.sessionKey = sessionKey;
        me.userName = userName;
        me.appId = apiKey;
        me.apiSecret = apiSecret;
    }

    LastFmApi.getSession = function(apiKey, apiSecret, token, callback) {
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
    LastFmApi.getToken = function(apiKey, apiSecret, callback) {
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
    LastFmApi.authToken = function(iFrameWindow, apiKey, callback) {
        //+'&token='+token
        var url = 'http://www.last.fm/api/auth/?api_key='+apiKey+'&cb=chrome-extension://'+chrome.i18n.getMessage('@@extension_id')+'/inject/lfmsuccess.html';

        var authedHandler = function authedHandler(request, sender, back) {
            try {
                back({});
            } catch(e){}

            if(request.cmd == 'authSuccess') {
                chrome.extension.onRequest.removeListener(authedHandler);
                cbk(callback, request.token);
            }
        };

        chrome.extension.onRequest.addListener(authedHandler);

        setTimeout(function(){
            iFrameWindow.redirect(url);
        }, 300);
    };

    LastFmApi.prototype.apiCall = function(params, method, callback) {
        var me = this;

        if(method !== undefined && typeof method == 'function') {
            callback = method;
            method = 'GET';
        }

        params.api_key = me.appId;
        params.sk = me.sessionKey;

        return $.ajax({
            url: apiBase,
            data: sign(params, me.apiSecret),
            type : method,
            cache : false,
            success: function(xml, status) {
                if(status == 'success' && $.isXMLDoc(xml)) {
                    if($(xml).find('lfm').attr('status')=='ok') {
                        cbk(callback, xml);
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

    LastFmApi.prototype.setNowPlaying = function(artist, title, album, duration, callback) {
        var me = this;
        return me.apiCall({
            method : 'track.updateNowPlaying',
            artist:artist,
            track:title,
            album:album,
            duration:parseInt(duration)
        }, 'POST', callback);
    };
    LastFmApi.prototype.scrobble = function(artist, title, album, duration, callback){
        var me = this;
        return me.apiCall({
            method : 'Track.scrobble',
            artist:artist,
            track:title,
            album:album,
            duration: parseInt(duration),
            timestamp: parseInt(Date.now()/1000.0)
        }, 'POST', callback);
    };

    LastFmApi.prototype.getLovedTracks = function(callback){
        var me = this;
        return me.apiCall({
            method : 'user.getlovedtracks',
            user : me.userName
        }, callback)
    };

    LastFmApi.prototype.getUserInfo = function(callback){
        var me = this;
        return me.apiCall({
            method : 'User.getInfo'
        }, callback)
    };

    LastFmApi.prototype.loveTrack = function(artist, title, callback){
        var me = this;
        return me.apiCall({
            method : 'Track.love',
            artist : artist,
            track : title
        }, 'POST', callback)
    };
    LastFmApi.prototype.unLoveTrack = function(artist, title, callback){
        var me = this;
        return me.apiCall({
            method : 'Track.unlove',
            artist : artist,
            track : title
        }, 'POST', callback)
    };

    LastFmApi.prototype.getTrackInfo = function(artist, title, callback) {
        var me = this;
        return me.apiCall({
            method : 'Track.getInfo',
            artist : artist,
            track : title,
            username : me.userName
        }, callback);
    };

    LastFmApi.prototype.getArtistTopTracks = function(artist, autoCorrect, callback) {
        var me = this;
        return me.apiCall({
            method : 'Artist.getTopTracks',
            artist : artist,
            autocorrect : autoCorrect ? 1:0
        }, callback);
    };

    LastFmApi.prototype.findTrack = function(artist, track, callback) {
        var me = this;
        return me.apiCall({
            method : 'Track.search',
            artist : artist,
            track: track
        }, callback);
    };

    app.classes.LastFmApi = LastFmApi;

})(ChromePlayer);