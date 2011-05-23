//var _gaq = _gaq || [];

function xhrRequest(url, method, data, callback){
    var xhr = new XMLHttpRequest()

    //console.debug('Sending request:', url+'?'+data)

    if(method == "POST"){
        xhr.open(method, url, true)
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
        xhr.send(data)
    } else {
        if(url.match(/\?/))
            xhr.open(method, url+'&'+data, true)
        else
            xhr.open(method, url+'?'+data, true)

        xhr.send()
    }

    xhr.onreadystatechange = function(){
        if(xhr.readyState == 4){
//            console.log("Response on "+url+" :", xhr)
//            console.log("Response text:", xhr.responseText)
            callback(xhr)
        }
    }
}

/**
    VK

    Module for working with vk.com
**/
var VK = {
    determineSearchMethod: function(callback){
//        console.log("Trying to determine search method")

        xhrRequest("http://vkontakte.ru", "GET", null, function(xhr){
            if(!xhr.responseText.match(/top_search/)){
                xhrRequest("http://vk.com", "GET", null, function(xhr_vk){
                    if(!xhr_vk.responseText.match(/top_search/)) {
                        callback({search_method:'test_mode'})
                    } else {
                        callback({search_method:'vk.com'})
                    }
                })
            } else {
                callback({search_method:'vkontakte.ru'})
            }
        })
    },

    /**
        VK.#_rawSearch(artist, song, callback)

        Searching by parsing page. Callback function must return hash with url.
    **/
    _rawSearch: function(artist, song, duration, callback){
        var track = artist + " " + song

        var url  = "http://"+VK.search_method+"/al_search.php"
        var data = "c%5Bq%5D="+encodeURIComponent(track)+"&al=1&c%5Bsection%5D=audio"

        xhrRequest(url, "POST", data, function(xhr){
            // User logged off from vkontakte
            if(xhr.responseText.match(/progress\.gif/)){
                delete VK.search_method

                VK.search(artist, song, duration, callback)

                return
            }

            var container = document.getElementById('vk_search');
            container.innerHTML = xhr.responseText;

            var audio_data = []
            var audio_rows = container.querySelectorAll('div.audio')

            for(var i=0; i<audio_rows.length; i++){
                if(i>=10) break

                var url_data = audio_rows[i].querySelector('input[type=hidden]').value.split(',');
                var url = url_data[0];
                var duration = url_data[1];

                var title = audio_rows[i].querySelector('td.info span');

                audio_data.push({
                  artist: audio_rows[i].querySelector('td.info a').innerHTML,
                  title: title.textContent.trim(),
                  duration: duration,
                  url: url
                })
            }

//            console.log("Tracks:", audio_data);

            if(audio_data.length > 0){

                audio_data.lastIndex = 0

                for(var i=0;i<audio_data.length; i++){
//                    console.log(audio_data[i], Math.abs(parseInt(audio_data[i].duration) - duration))

                    if(audio_data[i].artist.toLowerCase() == artist && audio_data[i].title.toLowerCase() == song){
                        if(!duration || Math.abs(parseInt(audio_data[i].duration) - duration) <= 2){
                            audio_data.lastIndex = i
                            break
                        }
                    } else if(!audio_data[i].title.toLowerCase().match(/(remix|mix)/) &&
                               audio_data[i].artist.toLowerCase() == artist &&
                               audio_data[i].title.toLowerCase() == song){
                        audio_data.lastIndex = i
                    }
                }
//                console.log("audio_data.lastIndex", audio_data.lastIndex)

                //Caching for 3 hours
//                CACHE.set(track, audio_data, 1000*60*60*2)

                callback(audio_data)
            } else {
                callback({error:'not_found'})
            }
        })

        return false
    },

    /**
        VK Applications for using in test_mode. [user_id, app_id, app_key]
    **/
    apps: [
        [327488, 525159, 'g5vuj9EWFO'],
        [2118012, 1882836,'xYsD1Dtsng'],
        [19730188, 1881945, 'rcj0HPk4Wk'],
        [85838504, 1887506, 'nTCyM7WEBo'],
        [9142393, 1891705, 'MlO3y0UXFV'],
        [86844124, 1891718, '8NgTW7tjWm'],
        [4824199, 1915951, 'pvHpN0V001'],
        [5573107, 1914989, 'CChij669jU'],

        [6240007, 1972474, 'DMXPeITyti'], // От вконтакт пользователя
        [102802046, 1985438, 'sPZCZS5YxJ'], //ivaninvanov@mail.ru
        [102813567, 1985491, 'UjgLqfMPgc'], //ivaninvanov1@mail.ru
        [102815638, 1985494, 'vI7EmQNdS9'],
        [102819736, 1985507, '3V0H9Y7zo9']

    ],

    getApiData: function(){
        return VK.apps[Math.floor(Math.random()*VK.apps.length)]
    },

    /**
        VK#_testmodeSearch(artist, song, callback)

        Searching vkontakte with api in test_mode
    **/
    _testmodeSearch: function(artist, song, duration, callback){
        var track = artist + " " + song

        var api = VK.getApiData()
        var url = "http://api.vk.com/api.php"

        md5hash = ChromePlayer.md5(api[0]+'api_id='+api[1]+'count=10format=jsonmethod=audio.searchq='+track+'test_mode=1'+api[2])
        var data = 'api_id='+api[1]+'&method=audio.search&format=json&sig='+md5hash+'&test_mode=1&count=10&q='+encodeURIComponent(track)

//        console.log("Search url:", url+'?'+data)

        xhrRequest("http://chromusapp.appspot.com/sign_data", "POST", "track="+encodeURIComponent(artist+song), function(xhr){
//            console.log(xhr.responseText);
        })

        xhrRequest(url, "GET", data, function(xhr){
            // Too many requests and now we banned for some time
            if(xhr.responseText.match(/\:false/)){
                // Checking if user logged into vkontakte
                VK.determineSearchMethod(function(response){
                    if(response.search_method == "test_mode"){
                        callback({error:'overload'})
                    } else {
                        VK.search_method = response.search_method
                        VK.search(artist, song, duration, callback)
                    }
                })

                return
            }

            var response_text = xhr.responseText.replace(/\u001D/g,'').replaceEntities()

            var results = JSON.parse(response_text);

//            console.log(results)

            if(results.response){
                var vk_tracks = []

                if(results.response[1]){
                    vk_tracks.lastIndex = 0
                    for(var i=1; i<results.response.length; i++){
                        var audio = results.response[i].audio

//                        console.log(audio)
                        vk_tracks.push(audio)

                        if(audio.artist.toLowerCase() == artist && audio.title.toLowerCase() == song){
                            if(!duration || Math.abs((parseInt(audio.duration) - duration) <= 2)){
                                vk_tracks.lastIndex = vk_tracks.length - 1

                                break
                            }
                        } else if(!audio.title.toLowerCase().match(/(remix|mix)/) && audio.artist.toLowerCase() == artist){
                            vk_tracks.lastIndex = vk_tracks.length - 1
                        }
                    }
//                    console.log("Selected track:", vk_tracks[vk_tracks.lastIndex])
                }

                if(vk_tracks && vk_tracks.length > 0){
                    //vk_track.duration = parseInt(vk_track.duration)

                    //Caching for 3 hours
//                    CACHE.set(track, vk_tracks, 1000*60*60*3)

                    callback(vk_tracks)
                } else {
                    callback({error:'not_found'})
                }
            } else {
                if(results.error)
                    callback({error:results.error})
                else{
//                    console.error("ERROR!:", results)
                    callback({error:'Unknown error while searching track'})
                }
            }
        })
    },


    /**
        VK#search(artist, song, callback)
        - artist (String): Artist
        - song (String): Song
        - callback (Function): Function to be called when search compete, to obtain results.
    **/
    search: function(artist, song, duration, callback){
//        console.log("Seaching:", artist, " - ", song)
//        console.log("Search method:", this.search_method)

        if(this.search_method == undefined){
            this.determineSearchMethod(function(response){
//                console.log("Search method:", response.search_method)

                VK.search_method = response.search_method

                VK.search(artist, song, duration, callback)
            })

            return
        }

        artist = artist.toLowerCase()
        song = song.toLowerCase()

        if(duration != undefined)
            duration = parseInt(duration)

        var track = artist + " " + song

//        if(CACHE.get(track))
//            return callback(CACHE.get(track))

//        _gaq.push(['_trackEvent', 'vkontakte_search', this.search_method, artist+'-'+song]);

        if(this.search_method == "test_mode")
            this._testmodeSearch(artist, song, duration, callback)
        else
            this._rawSearch(artist, song, duration, callback)

//        console.log("Setting search method to null");
        this.search_method = undefined;
    }
}