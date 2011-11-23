(function(app){

	var action = chrome.browserAction;

	function Button() {
		this.textChangeTimeout = undefined;
		this.textQueue = [];
	}
	Button.prototype.setToolTip = function(text){
		action.setTitle({title:text});
	};
	Button.prototype.setBadgeText = function setBadgeText(text){
		var me = this;
		if(me.textChangeTimeout !== undefined) {
			clearTimeout(me.textChangeTimeout);
		}
		me.textQueue = [];

		//text is an array, but has only one entry
		if(Array.isArray(text) && text.length == 1) {
			text = text[0];
		}

		//text is empty
		if(text === undefined || text == '' || (Array.isArray(text) && text.length == 0)) {
			action.setBadgeText({text:''});
			return;
		}

		//text is not an array and is 4 chars or less
		if(!Array.isArray(text) && text.length <=4 ) {
			action.setBadgeText({text:text});
			return;
		}

		//text is not an array, but is larger than 4 chars
		if(!Array.isArray(text) && text.length > 4) {
			me.textQueue.push({
				text : text,
				action : 'scroll',
				direction : 'forward',
				pos : 0
			});
		}

		//text is an array
		if(Array.isArray(text)) {
			for(var ti=0; ti<text.length; ti++) {
				var t = text[ti];

				var qItem = {
					text : (new String(t)).toString(),
					action : t.length > 4 ? 'scoll' : 'next'
				};

				if(t.length > 4) {
					qItem.direction = 'forward';
					qItem.pos = 0;
				}

				me.textQueue.push(qItem);
			}
		}

		function scroller() {
			var item = me.textQueue.shift();

			if(item.action == 'next') {
				action.setBadgeText({text:item.text});
				me.textQueue.push(item);
				me.textChangeTimeout = setTimeout(scroller, 2000);
			} else {

				action.setBadgeText({text:item.text.substr(item.pos, 4)/* .replace(/\s/, String.fromCharCode(160)) */ });

				if(item.direction == 'forward') {
					if(item.pos == item.text.length - 4) {
						item.pos = 0;
						me.textQueue.push(item);
						me.textChangeTimeout = setTimeout(scroller, 2000);
					} else {
						item.pos++;
						me.textQueue.unshift(item);
						me.textChangeTimeout = setTimeout(scroller, item.pos == 1 ? 2000 : 500);
					}
				}
				//TODO: Scroll direction 'backward'
			}
		}

		me.textChangeTimeout = setTimeout(scroller, me.textQueue[0].action == 'next' ? 2000 : 500);
	};
	Button.prototype.setBadgeBackgroundColor = function setBadgeBackgroundColor(r, g, b, a) {

		if((Array.isArray(r) && arguments.length>1) || (Array.isArray(r) && r.length!=4)) {
			throw new Error('Invalid arguments');
		}

		var color = Array.isArray(r) ? r : [ r || 0, g || 0, b || 0, a || 0];

		action.setBadgeBackgroundColor({color:color});
	};

	app.classes.Button = new Button();

})(MusicPlayer);