var MusicPlayer;

(function(window){

    function Application() {
        var me = this;

        me.classes = {};
        me.LASTFM_API_KEY = 'b6ee0c125425b77a1d35c95e1ac7647c';
        me.LASTFM_API_SECRET = 'bc88fab51c9bc69376bfaece2566dada';
        me.VK_APP_ID = "2387324";
        me.VK_APP_SECRET = "kG4IQXqFvij8xseFQlPu";
        me.GA_ACCOUNT = 'UA-26418593-3';
        me.currentAuthTab = undefined;

        chrome.tabs.onRemoved.addListener(function(tabId){
            if(me.currentAuthTab && me.currentAuthTab.id == tabId) {
                me.currentAuthTab = undefined;
            }
        });
    }

    Application.prototype.extensionId = function(){
        return chrome.i18n.getMessage('@@extension_id');
    };

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

    Object.defineProperty(Application.prototype, 'isFirstRun', {
        get : function(){
            if(this._fr) {
                return this._fr;
            }

            var usedBefore = (localStorage.getItem('usedBefore') == 'true');
            localStorage.setItem('usedBefore', 'true');
            return this._fr = !usedBefore;
        }
    });

    Object.defineProperty(Application.prototype, 'analytics', {
        get : function(){
            throw new Error('Analytics module has not been loaded');
        },
        configurable : true
    });

    MusicPlayer = new Application();

})(window);