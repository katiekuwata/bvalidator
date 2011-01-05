function uuueee(w, a,b,d){
	//alert('iz uuu' + a + b +d)
}



(function($) {	
	
	var options = {
		
		lang: 'en',				// default language for error messages 
		
		errorMessageAttr: 'data-validation-error', // name of the input attribute for overridden error message
		validateActionsAttr: 'data-bvalidator', // name of the input attribute wich stores info what validation actions to do
		
		paramsDelimiter: ',',		// 
		validatorsDelimiter: ';',		// 
		
		callback: {
			onBeforeValidate: function(){},
			onAfterValidate: function(){},
			onValidateFail: function(){},
			onValidateSuccess: function(){},
		},
		
		
		// when to validate
		validateOn: 'keyup',			// null, 'change', 'blur', 'keyup'
		errorValidateOn: 'keyup',		// null, 'change', 'blur', 'keyup'
		
		display : {
			singleError: false,		// validate all inputs at once
			offset: {x:-20, y:-3},
			position: {x:'right', y:'top'}, // left|center|right  top|center|bottom
			template: '<div class="{tooltipClass}"><em/>{message}</div>',
			showCloseIcon: true,		// put close icon on tooltip
			showTooltipSpeed: 'normal',	// message's fade-in speed 'fast', 'normal', 'slow' or number of miliseconds
			
			// css class names
			closeIconClass: 'bvalidator_close_icon',// close tooltip icon class
			tooltipClass: 'bvalidator_tooltip',	// tooltip class
			errorClass: 'bvalidator_invalid',	// input field class name in case of validation error
			validClass: '',		// input field class name in case of valid value
		},
		
		regex: {
			alpha:    /^[a-z ._-]+$/i,
			alphanum: /^[a-z0-9 ._-]+$/i,
			digit:    /^\d+$/,
			number:   /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/,
			email:    /^([a-zA-Z0-9_\.\-\+%])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
			image:    /.(jpg|jpeg|png|gif|bmp)$/i,
			url:      /^(http|https|ftp)\:\/\/[a-z0-9\-\.]+\.[a-z]{2,3}(:[a-z0-9]*)?\/?([a-z0-9\-\._\?\,\'\/\\\+&amp;%\$#\=~])*$/i
		},
		
		errorMessages: {
			en: {
				default:    'Please correct this value.',
				equalto:    'Please enter the same value again.',
				differs:    'Please enter a different value.',
				minlength:  'The length must be at least {0} characters',
				maxlength:  'The length must be at max {0} characters',
				rangelength:'The length must be between {0} and {1}',
				min:        'Please enter a value greater than or equal to {0}.',
				max:        'Please enter a value less than or equal to {0}.',
				between:    'Please enter a value between {0} and {1}.',
				required:   'Please complete this mandatory field.',
				alpha:      'Please enter alphabetic characters only.',
				alphanum:   'Please enter alphanumeric characters only.',
				digit:      'Please enter only digits.',
				number:     'Please enter a valid number.',
				email:      'Please enter a valid email address.',
				image:      'This field should only contain image types',
				url:        'Please enter a valid URL.',
				ip4:        'Please enter a valid IP address.',
				date:       'Please enter a valid date in format {0}.',
			}
		}
	};
	
	// validator instance
	var instance;
	
	var mainElement;
	
	$.fn.bValidator = function(overrideOptions) {

		$.extend(true, options, overrideOptions);
		
		mainElement = this;
		
		instance = new bValidator();
		
		if(this.data("bValidator"))
			return this.data("bValidator");
		
		this.data("bValidator", instance);
		
		// if selector is a form
		if (this.is('form')) {
			// bind validation on form submit
			this.bind('submit.bV', function(event){
				return instance.validate(true);
			});
			
			// bind reset on form reset
			this.bind("reset.bV", function()  {
				instance.reset();			
			});
		}
		
		if(options.validateOn)
			bindValidateOn(getElementsForValidation(this));
		
		return instance;
	};
	
	
	getElementsForValidation = function(mainElement){
		
		if(mainElement.is(':input'))
			var elements = element;
		else{
			//skip hidden and input fields witch we do not want to validate
			var elements = mainElement.find(':input').not(":button, :image, :reset, :submit, :hidden, :disabled");
		}
		
		return elements;
	}
	
	
	bindValidateOn = function(elements){
		elements.bind(options.validateOn + '.bV', {'bValidatorInstance': instance}, function(event) {
			console.log('validateOn');
			event.data.bValidatorInstance.validate(true, $(this));
		});
	}
	
	
	bValidator = function(elements){
		
		this.validate = function(showMessages, elementsOverride) {
			
			if(elementsOverride)
				var elementsl = elementsOverride;
			else
				var elementsl = getElementsForValidation(mainElement);
			
			// return value
			var ret = true;
			
			// validate each element
			elementsl.each(function() {
				
				// value of validateActionsAttr input attribute
				var actionsStr = $.trim($(this).attr(options.validateActionsAttr));
				
				if(!actionsStr)
					return true;
				
				// get all validation actions
				var actions = actionsStr.split(options.validatorsDelimiter);
				
				// value of input field for validation
				var inputValue = getValue($(this));
				
				var errorMessages = [];
				
				// for each validation action
				for(var i in actions){
					
					actions[i] = $.trim(actions[i]);
					
					if(!actions[i])
						continue;
					
					if(callBack('onBeforeValidate', actions[i], $(this)) === false)
						continue;
					
					// check if we have some parameters for validator
					var validatorParams = actions[i].match(/^(.*?)\[(.*?)\]/);
					
					if(validatorParams && validatorParams.length == 3){
						var validatorName = $.trim(validatorParams[1]);
						validatorParams = validatorParams[2].split(options.paramsDelimiter);
					}
					else{
						validatorParams = [];
						var validatorName = actions[i];
					}
					
					// if validator exists
					if(typeof validator[validatorName] == 'function'){
						// call validator function
						var validationResult = validator[validatorName](inputValue.value, validatorParams[0], validatorParams[1], validatorParams[2], validatorParams[3]);
					}
					// call custom user dafined function
					else if(typeof window[validatorName] == 'function'){
						var validationResult = window[validatorName](inputValue.value, validatorParams[0], validatorParams[1], validatorParams[2], validatorParams[3]);
					}
					
					if(callBack('onAfterValidate', actions[i], $(this), validationResult) === false)
						continue;
					
					if(!validationResult){
						
						if(showMessages){
							// get error messsage
							var errMsg = $(this).attr(options.errorMessageAttr)
							
							if(!errMsg && options.errorMessages[options.lang][validatorName])
								errMsg = options.errorMessages[options.lang][validatorName];
							else
								errMsg = options.errorMessages[options.lang].default;
							
							if(errMsg.indexOf('{')){
								for(var i=0; i<4; i++)
									errMsg = errMsg.replace(new RegExp("\\{" + i + "\\}", "g"), validatorParams[i]);
							}
							
							errorMessages[errorMessages.length] = errMsg;
						}
						else
							errorMessages[errorMessages.length] = '';
						
						ret = false;
						
						if(callBack('onValidateFail', actions[i], $(this), errorMessages) === false)
							continue;
					}
					else{
						if(callBack('onValidateSuccess', actions[i], $(this)) === false)
							continue;
					}
				}
				
				// if validation failed
				if(errorMessages.length){
					if(showMessages)
						showTooltip($(this), errorMessages)
					
					$(this).removeClass(options.display.validClass);
					if(options.display.errorClass)
						$(this).addClass(options.display.errorClass);
					
					// input validation event             
					if (options.errorValidateOn){
						if(options.validateOn)
							$(this).unbind(options.validateOn + '.bV');
						$(this).unbind(options.errorValidateOn + '.bVerror');
						$(this).bind(options.errorValidateOn + '.bVerror', {'bValidatorInstance': instance}, function(event) {
							console.log('errorValidateOn');
							event.data.bValidatorInstance.validate(true, $(this));
						});
					}
					
					if (options.display.singleError)
						return false;
				}
				else{
					removeTooltip($(this));
					$(this).removeClass(options.display.errorClass);
					
					if(options.display.validClass)
						$(this).addClass(options.display.validClass);
					
					if (options.errorValidateOn)
						$(this).unbind(options.errorValidateOn + '.bVerror');
					if (options.validateOn){
						$(this).unbind(options.validateOn + '.bV');
						bindValidateOn($(this));
					}
				}
			});
			
			return ret;
		}
		
		this.getOptions = function() {
			return options;
		}
		
		this.isValid = function() {
			return this.validate(false);
		}
		
		this.removeTooltip = function(element){
			removeTooltip(element);
		}
		
		this.getElements = function(){
			return getElementsForValidation(mainElement);
		}
		
		this.bindValidateOn = function(element){
			bindValidateOn(element);
		}
		
		this.reset = function() {
			elements = getElementsForValidation(mainElement);
			if (options.validateOn)
				bindValidateOn(elements);
			elements.each(function(){
				removeTooltip($(this));
				$(this).unbind('.bVerror');
				$(this).removeClass(options.display.errorClass);
				$(this).removeClass(options.display.validClass);
			});
		}
		
		this.destroy = function() {
			if (mainElement.is('form'))
				mainElement.unbind('.bV');
				
			this.reset();
		}
	}
	
	showTooltip = function(element, messages){
		
		// if tooltip already exists remove it from DOM
		removeTooltip(element);
		
		msg_container = $('<div class="bVtooltipContainer"></div>').css('position','absolute');
		element.data("tooltip.bV", msg_container);
		msg_container.insertAfter(element);
		
		var messagesHtml = '';
		
		for(var i in messages){
			messagesHtml += '<div>' + messages[i] + '</div>\n';
		}
		
		if(options.display.showCloseIcon){
			var closeiconTpl = '<div style="display:table"><div style="display:table-cell">{message}</div><div style="display:table-cell"><div class="'+options.display.closeIconClass+'" onclick="$(this).closest(\'.'+ options.display.tooltipClass +'\').css(\'visibility\', \'hidden\');">x</div></div></div>';
			messagesHtml = closeiconTpl.replace('{message}', messagesHtml);
		}
		
		var template = options.display.template.replace('{tooltipClass}', options.display.tooltipClass).replace('{message}', messagesHtml);
		
		var tooltip = $(template);
		tooltip.appendTo(msg_container);
		
		var pos = getTooltipPosition(element, tooltip); 
		
		tooltip.css({ visibility: 'visible', position: 'absolute', top: pos.top, left: pos.left }).fadeIn(options.display.showTooltipSpeed);
	}
	
	// removes tooltip from DOM
	removeTooltip = function(element){
		var existingTooltip = element.data("tooltip.bV")
		if(existingTooltip){
			existingTooltip.remove();
		}
	}
	
	// calculates error message position relative to the input	
	getTooltipPosition = function(input, tooltip) {
	        
	        var tooltipContainer = input.data("tooltip.bV");
	        var top  = - ((tooltipContainer.offset().top - input.offset().top) + tooltip.outerHeight() - options.display.offset.y);
	        var left = (input.offset().left + input.outerWidth()) - tooltipContainer.offset().left + options.display.offset.x;
		
		var x = options.display.position.x;
		var y = options.display.position.y;
		
		// adjust Y
		if(y == 'center' || y == 'bottom'){
			var height = tooltip.outerHeight() + input.outerHeight();
			if (y == 'center') 	{ top += height / 2; }
			if (y == 'bottom') 	{ top += height; }
		}
		
		// adjust X
		if(x == 'center' || x == 'left'){
			var width = input.outerWidth();
			if (x == 'center') 	{ left -= width / 2; }
			if (x == 'left')  	{ left -= width; }
		}
		
		return {top: top, left: left};
	}
	
	// calls callback functions
	callBack = function(type, param1, param2, param3) {
	        if($.isFunction(options.callback[type])){
	        	return options.callback[type](param1, param2, param3);
	        }
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

	// object with validator functions
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
		},
		
		ip4: function(ip){
			var r = /^(([01]?\d\d?|2[0-4]\d|25[0-5])\.){3}([01]?\d\d?|25[0-5]|2[0-4]\d)$/;
			if (!r.test(ip) || ip == "0.0.0.0" || ip == "255.255.255.255")
				return false
			
			return true;
		},
		
		date: function(date, format){ // format can be any combination of mm,dd,yyyy with separator between. Example: 'mm.dd.yyyy' or 'yyyy-mm-dd'
			
			if(date.length == 10 && format.length == 10){
				var s = format.match(/[^mdy]+/g);
				if(s.length == 2 && s[0].length == 1 && s[0] == s[1]){
					
					var d = date.split(s[0]);
					var f = format.split(s[0]);
					
					for(var i=0; i<3; i++){
						if(f[i] == 'dd') var day = d[i];
						else if(f[i] == 'mm') var month = d[i];
						else if(f[i] == 'yyyy') var year = d[i];
					}
					
					var dobj = new Date(year, month-1, day)
					if ((dobj.getMonth()+1!=month) || (dobj.getDate()!=day) || (dobj.getFullYear()!=year))
						return false
					
					return true
				}
			}
			return false;
		}

		
		
	};
	
})(jQuery);