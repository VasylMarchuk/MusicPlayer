(function(app){

    var apiBase = 'https://api.vkontakte.ru/method/';

    var cbk = app.cbk;

    function VKApi(accessToken, userId, appId) {
        this.accessToken = accessToken;
        this.userId = userId;
        this.appId = appId;
    }

    VKApi.getSession = function(iFrameWindow, callback) {
        var url = 'https://api.vkontakte.ru/oauth/authorize?client_id='+app.VK_APP_ID+'&scope=audio,offline&display=popup&response_type=token&_hash=0';

        $.ajax({
            url:url,
            success: function(res, status, jXHR){
                function authedHandler(request, sender, back) {
                    if(request.cmd == 'vkAuthSuccess') {
                        try {
                            back({});
                        } catch(e) {}

                        chrome.extension.onRequest.removeListener(authedHandler);

                        var hash = request.hash.substr(1).split('&');

                        var userId, expiresIn, accessToken;

                        if(hash) {
                            for(var hi=0; hi<hash.length; hi++) {
                                var hp = hash[hi].split('=', 2);

                                switch(hp[0]) {
                                    case 'access_token':
                                        accessToken = hp[1];
                                        break;
                                    case 'expires_in':
                                        expiresIn = hp[1];
                                        break;
                                    case 'user_id':
                                        userId = hp[1];
                                        break;
                                }
                            }
                        }

                        if(userId !== undefined && accessToken !== undefined && expiresIn !== undefined) {
                            cbk(callback, {userId:userId, accessToken:accessToken,expiresIn:expiresIn});
                        } else {
                            cbk(callback, new Error('Failed to get session'));
                        }
                    }
                }

                chrome.extension.onRequest.addListener(authedHandler);

                function reloadHandler(request, sender, back) {
                    if(request.cmd == 'vkFrameReload') {
                        try {
                            back({});
                        } catch(e){}

                        chrome.extension.onRequest.removeListener(authedHandler);

                        cbk(callback, new Error('Need reload'));
                    }
                }

                chrome.extension.onRequest.addListener(reloadHandler);

                if(res.indexOf('Login success') !== -1) {
                    iFrameWindow.redirect(url);
                    return;
                }

                if(iFrameWindow == null || !('setContent' in iFrameWindow)) {
                    return;
                }

                iFrameWindow.setContent(res);

                $('.box_login', iFrameWindow).css('width','385px');

                $('head script', iFrameWindow.document).each(function(){
                    var s = iFrameWindow.document.createElement('script'); s.type = 'text/javascript';
                    if(this.src) {
                        s.async=true; s.src = this.src;
                    }
                    else {
                        s.innerHTML = this.innerHTML.replace('parent','0');
                    }
                    var h = iFrameWindow.document.getElementsByTagName('script')[0]; h.parentNode.insertBefore(s, h);
                });
            },
            error : function(jqXHR, textStatus, errorThrown) {
                console.log('Error getting session from VK: ' + textStatus);
            }
        });
    };

    VKApi.prototype.apiCall = function(method, params, type, callback) {
        var me = this;

        if(type !== undefined && typeof type == 'function') {
            callback = type;
            type = 'GET';
        }

        params.access_token = me.accessToken;

        $.ajax({
            url: apiBase + method,
            data: params,
            dataType : 'json',
            type : type,
            success: function(data, status) {
                cbk(callback, status == 'success' ? data : new Error('Api call \'' + apiBase + method + '\' failed: status=' + status));
            },
            error : function(jqXHR, textStatus, errorThrown) {
                cbk(callback, new Error('Api call \'' + apiBase + method + '\' failed: status=' + status + '; errorThrown=' + errorThrown));
            }
        });
    };

    VKApi.prototype.getUserName = function(callback) {
        var me = this;
        me.apiCall('getProfiles', { uids:me.userId.toString(), fields:'nickname, screen_name' }, function(err, data) {
            if(!err && data.response) {
                var uname = data.response[0];
                if(uname.nickname) {
                    uname = uname.nickname;
                } else if(uname.screen_name) {
                    uname = uname.screen_name;
                } else {
                    uname = uname.first_name + (uname.last_name || uname.first_name ? ' ' : '') + uname.last_name;
                }
                cbk(callback, uname);
            } else {
                cbk(callback, new Error('Error getting profile info'));
            }
        });
    };
    VKApi.prototype.searchSongs = function(artist, title, callback) {
        var me = this;
        me.apiCall('audio.search', { q:artist + ' - ' + title, count:10 }, function(err, data) {
            if(!err && data.response !== undefined) {
                data.response.shift();
                cbk(callback, data.response);
            } else {
                cbk(callback, new Error('Error gettings mp3s list from VK'));
            }
        });
    };

    app.classes.VKApi = VKApi;

})(ChromePlayer);