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
			offset: {x:0, y:0},
			position: 'center right',
			template: '<div class="{tooltipClass}"><em/>{message}</div>',
			showCloseIcon: true,		// put close icon on tooltip
		
			// show/hide effects
			showEffect: 'default',	// show effect for tooltip
			hideEffect: 'default',	// hide effect for tooltip
			speed: 'normal',	// message's fade-in speed
			
			// css class names
			closeIconClass: 'bvalidator_close_icon',// close tooltip icon class
			tooltipClass: 'bvalidator_tooltip',	// tooltip class
			errorClass: 'bvalidator_invalid',	// input field class name in case of validation error
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
				url:        'Please enter a valid URL.'
			}
		}
	};
	
	// validator instance
	var instance;
	
	$.fn.bValidator = function(overrideOptions) {

		$.extend(true, options, overrideOptions);
		
		instance = new bValidator();
		
		// if selector is a form		
		if (this.is('form')) {
			
			// validate all input elements in form
			instance = new bValidator(getElementsForValidation(this));
			
			// bind validation on form submit
			this.submit(function(e){
				//e.preventDefault();
				return instance.validate(true);
			});
		}
		// if selector is something else
		else 
			instance = new bValidator(getElementsForValidation(this));
		
		this.data("bValidator", instance);
		
		return instance;
	};
	
	
	getElementsForValidation = function(mainElement){
		
		if(mainElement.is(':input'))
			var elements = element;
		else{
			//skip hidden and input fields witch we do not want to validate
			var elements = mainElement.find(':input').not(":button, :image, :reset, :submit, :hidden, :disabled");
		}
		
		// input validation event             
		if (options.validateOn){
			elements.bind(options.validateOn, {'bValidatorInstance': instance}, function(event) {
				alert('validateOn');
				event.data.bValidatorInstance.validate(true, $(this));
			});
		}
		
		return elements;
	}
	
	
	bValidator = function(elements){
		
		this.validate = function(showMessages, elementsOverride) {
			
			if(elementsOverride)
				var elementsl = elementsOverride;
			else
				var elementsl = elements;
			
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
						var validationResult = validator[validatorName](inputValue, validatorParams[0], validatorParams[1], validatorParams[2], validatorParams[3]);
					}
					// call custom user dafined function
					else if(typeof window[validatorName] == 'function'){
						var validationResult = window[validatorName](inputValue, validatorParams[0], validatorParams[1], validatorParams[2], validatorParams[3]);
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
							
							errorMessages[errorMessages.length] = errMsg;
						}
						else
							errorMessages[errorMessages.length] = '';
						
						ret = false;
						
						if(callBack('onValidateFail', actions[i], $(this), errorMessages) === false)
							continue;
							
						// input validation event             
						if (options.errorValidateOn){
							$(this).bind(options.errorValidateOn, {'bValidatorInstance': instance}, function(event) {
								alert('errorValidateOn');
								event.data.bValidatorInstance.validate(true, $(this));
							});
						}
					}
					else{
						if(callBack('onValidateSuccess', actions[i], $(this)) === false)
							continue;
					}
				}
				
				if(errorMessages.length){
					if(showMessages)
						showTooltip($(this), errorMessages)
						
					$(this).addClass(options.display.errorClass);
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
	}
	
	showTooltip = function(element, messages){
		
		// if tooltip already exists remove it from DOM
		var existingTooltip = element.data("bValidatorTooltip")
		if(existingTooltip){
			existingTooltip.remove();
		}
		
		msg_container = $('<div class="bValidator0001"></div>').css('position','absolute');
		element.data("bValidatorTooltip", msg_container);
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
		
		tooltip.css({ visibility: 'visible', position: 'absolute', top: pos.top, left: pos.left }).fadeIn(options.display.speed);
	}
	
	// calculates error message position relative to the input	
	getTooltipPosition = function(input, tooltip) {
		
	        // get origin top/left position
	        var  pos = options.display.position.split(/,?\s+/),
	 		y = pos[0],
	 		x = pos[1];
	        
	        var tooltipContainer = input.next('.bValidator0001');
	        var top  = - (input.outerHeight() + tooltip.outerHeight()) - options.display.offset.x;
	        var left = (input.offset().left + input.outerWidth()) - tooltipContainer.offset().left + options.display.offset.y;
		
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
		}
	};
	
})(jQuery);