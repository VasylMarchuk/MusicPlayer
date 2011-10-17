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
    LastFmApi.authToken = function(iFrameWindow, apiKey, token, callback) {
        var url = 'http://www.last.fm/api/auth/?api_key='+apiKey+'&token='+token;

        var authedHandler = function authedHandler(request, sender, back) {
            try {
                back({});
            } catch(e){}

            if(request.cmd == 'authSuccess') {
                chrome.extension.onRequest.removeListener(authedHandler);
                cbk(callback);
            }
        };

        chrome.extension.onRequest.addListener(authedHandler);


        iFrameWindow.redirect(url);

//        $.ajax({
//            url:url,
//            success: function(res, status, jXHR){
//
//                function authedHandler(request, sender, back) {
//                    if(request.cmd == 'vkAuthSuccess') {
//                        try {
//                            back({});
//                        } catch(e) {}
//
//                        chrome.extension.onRequest.removeListener(authedHandler);
//
//                        var hash = request.hash.substr(1).split('&');
//
//                        var userId, expiresIn, accessToken;
//
//                        if(hash) {
//                            for(var hi=0; hi<hash.length; hi++) {
//                                var hp = hash[hi].split('=', 2);
//
//                                switch(hp[0]) {
//                                    case 'access_token':
//                                        accessToken = hp[1];
//                                        break;
//                                    case 'expires_in':
//                                        expiresIn = hp[1];
//                                        break;
//                                    case 'user_id':
//                                        userId = hp[1];
//                                        break;
//                                }
//                            }
//                        }
//
//                        if(userId !== undefined && accessToken !== undefined && expiresIn !== undefined) {
//                            cbk(callback, {userId:userId, accessToken:accessToken,expiresIn:expiresIn});
//                        } else {
//                            cbk(callback, new Error('Failed to get session'));
//                        }
//                    }
//                }
//
//                chrome.extension.onRequest.addListener(authedHandler);
//
//                if(res.indexOf('Login success') !== -1) {
//                    iFrameWindow.redirect(url);
//                    return;
//                }
//
//                iFrameWindow.setContent(res);
//
//                $('.box_login', iFrameWindow).css('width','385px');
//
//                $('head script', iFrameWindow.document).each(function(){
//                    var s = iFrameWindow.document.createElement('script'); s.type = 'text/javascript';
//                    if(this.src) {
//                        s.async=true; s.src = this.src;
//                    }
//                    else {
//                        s.innerHTML = this.innerHTML.replace('parent','0');
//                    }
//                    var h = iFrameWindow.document.getElementsByTagName('script')[0]; h.parentNode.insertBefore(s, h);
//                });
//            }
//        });










//		chrome.tabs.create({url:'http://www.last.fm/api/auth/?api_key='+apiKey+'&token='+token}, function tabCreated(tab){
//
//		});
    };

    LastFmApi.prototype.apiCall = function(params, method, callback) {
        var me = this;

        if(method !== undefined && typeof method == 'function') {
            callback = method;
            method = 'GET';
        }

        params.api_key = me.appId;
        params.sk = me.sessionKey;

        $.ajax({
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
        me.apiCall({
            method : 'track.updateNowPlaying',
            artist:artist,
            track:title,
            album:album,
            duration:parseInt(duration)
        }, 'POST', callback);
    };
    LastFmApi.prototype.scrobble = function(artist, title, album, duration, callback){
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
    LastFmApi.prototype.loveTrack = function(artist, title, callback){
        var me = this;
        me.apiCall({
            method : 'Track.love',
            artist : artist,
            track : title
        }, 'POST', callback)
    };
    LastFmApi.prototype.unLoveTrack = function(artist, title, callback){
        var me = this;
        me.apiCall({
            method : 'Track.unlove',
            artist : artist,
            track : title
        }, 'POST', callback)
    };

    LastFmApi.prototype.getTrackInfo = function(artist, title, callback) {
        var me = this;
        me.apiCall({
            method : 'Track.getInfo',
            artist : artist,
            track : title,
            username : me.userName
        }, callback);
    };

    LastFmApi.prototype.getArtistTopTracks = function(artist, autoCorrect, callback) {
        var me = this;
        me.apiCall({
            method : 'Artist.getTopTracks',
            artist : artist,
            autocorrect : autoCorrect ? 1:0
        }, callback);
    };

    LastFmApi.prototype.findTrack = function(artist, track, callback) {
        var me = this;
        me.apiCall({
            method : 'Track.search',
            artist : artist,
            track: track
        }, callback);
    };

    app.classes.LastFmApi = LastFmApi;

})(ChromePlayer);