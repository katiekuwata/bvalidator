

(function($) {
	
	// options for this validator instance
	var options = {};	
	
	var defaultOptions = {
		
		showCloseIcon: true,		// put close icon on tooltip
		
		// show/hide effects
		showEffect: 'default',	// show effect for tooltip
		hideEffect: 'default',	// hide effect for tooltip
		speed: 'normal',	// message's fade-in speed
		
		// css class names
		closeIconClass: 'bvalidator_close_icon',// close tooltip icon class
		tooltipClass: 'bvalidator_tooltip',	// tooltip class
		errorClass: 'bvalidator_invalid',	// input field class name in case of validation error
		
		// when to validate
		inputEvent: null,			// change, blur, keyup, null 
		errorInputEvent: 'keyup',		// change, blur, keyup, null 
		formEvent: 'submit',			// submit, null
		
		lang: 'en',				// default language for error messages 
		template: '<div/>',
		
		errorMessageAttr: 'data-validation-error', // name of the input attribute for overridden error message
		validateActionsAttr: 'data-bvalidator', // name of the input attribute wich stores info what validation actions to do
		
		offset: [0, 0], 
		position: 'center right',
		singleError: false,		// validate all inputs at once
		
		
		regex : {
			alpha     : /^[a-z ._-]+$/i,
			alphanum  : /^[a-z0-9 ._-]+$/i,
			digit     : /^\d+$/,
			number    : /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/,
			email     : /^([a-zA-Z0-9_\.\-\+%])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
			image     : /.(jpg|jpeg|png|gif|bmp)$/i,
			url       : /^(http|https|ftp)\:\/\/[a-z0-9\-\.]+\.[a-z]{2,3}(:[a-z0-9]*)?\/?([a-z0-9\-\._\?\,\'\/\\\+&amp;%\$#\=~])*$/i
		}
	};
	
	
	$.fn.bValidator = function(overrideOptions) {

		options = $.extend(defaultOptions, overrideOptions);
	
		//alert(this.attr('id'));
		
		// if selector is a form		
		if (this.is('form')) {
			
			// validate all input elements in form
			validate ($(this).find(':input'));
			
			//$(this).data('bValidator', )
			
			//return this.each(function() {			
			//	var form = $(this); 
			//	instance = new Validator(form.find(":input"), form, options);	 
			//	form.data("validator", instance);
			//});
			
		} else {
			instance = new Validator(this, this.eq(0).closest("form"), options);
			return this.data("validator", instance);
		}     
		
	};
	
	validate = function(elements, showTooltips) {
		
		// validate each element
		elements.each(function() {			
			
			// value of validateActionsAttr input attribute
			var actionsStr = $.trim($(this).attr(options.validateActionsAttr));
			
			if(!actionsStr)
				return true;
				
			// get all validation actions
			var actions = actionsStr.split(';');
			
			// value of input field
			var inputValue = getValue($(this));
			
			//alert(inputValue.value);
			
			// for each validation action
			for(var i in actions){
				
				// check if we have some options with validator
				var validatorOptions = actions[i].match(/\((.*?)\)/);
				if(validatorOptions && validatorOptions.length == 2){
					validatorOptions = validatorOptions.split(',');
				}
				
				var validatorName = $.trim(actions[i]);
				
				// if validator exists
				if(typeof validator[validatorName] == 'function') {
					// call validator function
					validator[validatorName](inputValue);
				}
				// call custom user dafined function
				else if(typeof window[validatorName] == 'function'){
					window[validatorName](inputValue);
				}
			}
			
		});
	}
	
	// calculates error message position relative to the input	
	getTooltipPosition = function(input, tooltip) {
		
	        // get origin top/left position
	        var  pos = options.position.split(/,?\s+/),
	 		y = pos[0],
	 		x = pos[1];
	        
	        var tooltipContainer = input.next('.sd3ddfd3e3as73267236ws23');
	        var top  = - (input.outerHeight() + tooltip.outerHeight()) - options.offset[0];
	        var left = (input.offset().left + input.outerWidth()) - tooltipContainer.offset().left + options.offset[1];
		
		// adjust Y
		if(y == 'center' || y == 'bottom'){
			var height = tooltip.outerHeight() + input.outerHeight();
			if (y == 'center') 	{ top += height / 2; }
			if (y == 'bottom') 	{ top += height; }
		}
		
		// adjust X
		if(x == 'center' || x == 'left'){
			var width = input.outerWidth();
			if (x == 'center') 	{ left -= (width  + tooltip.outerWidth()) / 2; }
			if (x == 'left')  	{ left -= width; }
		}
		
		return {top: top, left: left};
	}
	
	// shows tolltop	
	showTooltip = function(input, message) {
		
	        
	}
	
	// gets element value	
	getValue = function(element) {
		
		var ret = {};

		// checkbox
		if(element.is('input:checkbox')){
			if(element.attr('name'))
				ret['selectedInGroup'] = $('input:checkbox[name=' + element.attr('name') + ']:checked').length;
			ret['value'] = element.attr('checked');
		}
		else if(element.is('input:radio')){
			if(element.attr('name'))
				ret['value'] = $('input:radio[name=' + element.attr('name') + ']:checked').length;
			else
				ret['value'] = element.val();
		}
		else if(element.is(':input')){
			ret['value'] = element.val();
		}
		
		return ret;
	}

	// object that contains validator functions
	var validator = {
	
		equalto: function(value, elementId){
			return value == $('#' + elementId).val();
		},
		
		differs: function(value, elementId){
			return value != $('#' + elementId).val();
		},
		
		minlength: function(value, minlength){
			return (value.length >= minlength)
		},
		
		maxlength: function(value, maxlength){
			return (value.length <= maxlength)
		},
		
		rangelength: function(value, minlength, maxlength){		
			return (value.length >= minlength && value.length <= maxlength)
		},
		
		min: function(value, min){		
			return (value >= min)
		},
		
		max: function(value, max){		
			return (value <= max)
		},
		
		between: function(value, min, max){		
			return (value >= min && value <= max)
		},
		
		required: function(value){
			if(value + '')
				return true;
			return false
		},
		
		alpha: function(value){
			return this.regex(value, options.regex.alpha);
		},
		
		alphanum: function(value){
			return this.regex(value, options.regex.alphanum);
		},
		
		digit: function(value){
			return this.regex(value, options.regex.digit);
		},
		
		number: function(value){
			return this.regex(value, options.regex.number);
		},
		
		email: function(value){
			return this.regex(value, options.regex.email);
		},
		
		image: function(value){
			return this.regex(value, options.regex.image);
		},
		
		url: function(value){
			return this.regex(value, options.regex.url);
		},
		
		regex: function(value, regex){
			
			if(typeof regex === "string")
				regex = new RegExp(regex);
			
			return regex.test(value);
		}
	};
	
})(jQuery);