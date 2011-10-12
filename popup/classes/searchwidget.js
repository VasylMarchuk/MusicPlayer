(function(app){

	var i18n = chrome.i18n;

	function clickable(el, onclick) {
		$(el).bind({
			click : onclick,
			mousedown : function(){ $(this).addClass('down'); },
			mouseup : function(){ $(this).removeClass('down'); }
		});
	}

	function SearchWidget() {
		var me = this;

		var $el = me.$element = $('<div />', {
			id:'search-widget'
		});

		var ctrl = me.controls = {
			omniBox : $('<input />', {'class':'omnibox', text : '', placeholder : 'Search: Artist - Title' })
		};

		$el.append(ctrl.omniBox);
		
//		$el.bind('addedToDom', function addedToDom(){
//        });
	}

//	SearchWidget.prototype.setVkStatus = function(username) {
//	};

	app.classes.SearchWidget = SearchWidget;

})(ChromePlayer);