/*
var bValidatorOptions = {
	
	// callback functions
	onBeforeValidate:    function(){console.log('onBeforeValidate');},
	
	// default error messages
	errorMessages: {
		hr: {
			default:    'Ispravite ovu vrijednost.',
			equalto:    'Unesite ponovno istu vrijednost.',
			differs:    'Unesite razlièitu vrijednost.',
			minlength:  'Duljina mora biti najmanje {0} znakova.',
			maxlength:  'Duljina mora biti najviše {0} znakova.',
			rangelength:'Duljina mora biti izmeðu {0} i {1} znakova.',
			min:        'Unesite vrijednost veæu ili jednaku {0}.',
			max:        'Unesite vrijednost manju ili jednaku {0}.',
			between:    'Unesite vrijednost izmeðu {0} i {1}.',
			required:   'Ovo polje je obavezno.',
			alpha:      'Unesite samo slova.',
			alphanum:   'Unesite samo slova i brojeve.',
			digit:      'Unesite samo brojeve.',
			number:     'Unesite ispravan broj.',
			email:      'Unesite ispravanu Email adresu.',
			image:      'Odaberite samo slikovne datoteke.',
			url:        'Unesite ispravan URL.',
			ip4:        'Unesite ispravanu IP adresu.',
			date:       'Unesite ispravan datum u formatu {0}.',
		}
	}
};
*/

var optionsLocal = {
	
	// callback functions
	onAfterValidate:    function(){console.log('onAfterValidate');}
};

/*
 * jQuery bValidator plugin
 *
 * http://code.google.com/p/bvalidator/
 *
 * Copyright (c) 2011 Bojan Mauser
 *
 * $Id$
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */

(function($) {	
	
	var options = {
		
		singleError:         false,		// validate all inputs at once
		offset:              {x:-20, y:-3},	// offset position for error message tooltip
		position:            {x:'right', y:'top'}, // error message placement x:left|center|right  y:top|center|bottom
		template:            '<div class="{errMsgClass}"><em/>{message}</div>', // template for error message
		showCloseIcon:       true,	// put close icon on error message
		showErrMsgSpeed:    'normal',	// message's fade-in speed 'fast', 'normal', 'slow' or number of miliseconds
		// css class names
		closeIconClass:      'bvalidator_close_icon',	// close error message icon class
		errMsgClass:         'bvalidator_errmsg',	// error message class
		errorClass:          'bvalidator_invalid',	// input field class name in case of validation error
		validClass:          '',			// input field class name in case of valid value
		
		lang: 'en', 				// default language for error messages 
		errorMessageAttr:    'data-bvalidator-msg',// name of the attribute for overridden error message
		validateActionsAttr: 'data-bvalidator', // name of the attribute which stores info what validation actions to do
		paramsDelimiter:     ',',		// delimiter for validator options inside []
		validatorsDelimiter: ';',		// delimiter for validators
		
		// when to validate
		validateOn:          null,		// null, 'change', 'blur', 'keyup'
		errorValidateOn:     'keyup',		// null, 'change', 'blur', 'keyup'
		
		// callback functions
		onBeforeValidate:    null,
		onAfterValidate:     null,
		onValidateFail:      null,
		onValidateSuccess:   null,
		
		// default error messages
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
		},
		
		// regular expressions used by validator methods
		regex: {
			alpha:    /^[a-z ._-]+$/i,
			alphanum: /^[a-z0-9 ._-]+$/i,
			digit:    /^\d+$/,
			number:   /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/,
			email:    /^([a-zA-Z0-9_\.\-\+%])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
			image:    /.(jpg|jpeg|png|gif|bmp)$/i,
			url:      /^(http|https|ftp)\:\/\/[a-z0-9\-\.]+\.[a-z]{2,3}(:[a-z0-9]*)?\/?([a-z0-9\-\._\?\,\'\/\\\+&amp;%\$#\=~])*$/i
		}
	};
	
	// validator instance
	var instance;
	
	// element passed to constructor
	var mainElement;
	
	$.fn.bValidator = function(overrideOptions) {

		// global options
		if(window['bValidatorOptions']){
			$.extend(true, options, window['bValidatorOptions']);
		}

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
				return instance.validate();
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
			event.data.bValidatorInstance.validate(false, $(this));
		});
	}
	
	
	bValidator = function(elements){
		
		this.validate = function(doNotshowMessages, elementsOverride) {
			
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
					
					if(callBack('onBeforeValidate', $(this), actions[i]) === false)
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
					
					if(callBack('onAfterValidate', $(this), actions[i], validationResult) === false)
						continue;
					
					if(!validationResult){
						
						if(!doNotshowMessages){
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
						
						if(callBack('onValidateFail', $(this), actions[i], errorMessages) === false)
							continue;
					}
					else{
						if(callBack('onValidateSuccess', $(this), actions[i]) === false)
							continue;
					}
				}
				
				if(!doNotshowMessages){
					// if validation failed
					if(errorMessages.length){
						
						showErrMsg($(this), errorMessages)
						$(this).removeClass(options.validClass);
						if(options.errorClass)
							$(this).addClass(options.errorClass);
						
						// input validation event             
						if (options.errorValidateOn){
							if(options.validateOn)
								$(this).unbind(options.validateOn + '.bV');
							$(this).unbind(options.errorValidateOn + '.bVerror');
							$(this).bind(options.errorValidateOn + '.bVerror', {'bValidatorInstance': instance}, function(event) {
								console.log('errorValidateOn');
								event.data.bValidatorInstance.validate(false, $(this));
							});
						}
						
						if (options.singleError)
							return false;
					}
					else{
						removeErrMsg($(this));
						$(this).removeClass(options.errorClass);
						
						if(options.validClass)
							$(this).addClass(options.validClass);
						
						if (options.errorValidateOn)
							$(this).unbind(options.errorValidateOn + '.bVerror');
						if (options.validateOn){
							$(this).unbind(options.validateOn + '.bV');
							bindValidateOn($(this));
						}
					}
				}
			});
			
			return ret;
		}
		
		this.getOptions = function() {
			return options;
		}
		
		this.isValid = function() {
			return this.validate(true);
		}
		
		this.removeErrMsg = function(element){
			removeErrMsg(element);
		}
		
		this.getInputs = function(){
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
				removeErrMsg($(this));
				$(this).unbind('.bVerror');
				$(this).removeClass(options.errorClass);
				$(this).removeClass(options.validClass);
			});
		}
		
		this.destroy = function() {
			if (mainElement.is('form'))
				mainElement.unbind('.bV');
				
			this.reset();
		}
	}
	
	showErrMsg = function(element, messages){
		
		// if error msg already exists remove it from DOM
		removeErrMsg(element);
		
		msg_container = $('<div class="bVErrMsgContainer"></div>').css('position','absolute');
		element.data("errMsg.bV", msg_container);
		msg_container.insertAfter(element);
		
		var messagesHtml = '';
		
		for(var i in messages){
			messagesHtml += '<div>' + messages[i] + '</div>\n';
		}
		
		if(options.showCloseIcon){
			var closeiconTpl = '<div style="display:table"><div style="display:table-cell">{message}</div><div style="display:table-cell"><div class="'+options.closeIconClass+'" onclick="$(this).closest(\'.'+ options.errMsgClass +'\').css(\'visibility\', \'hidden\');">x</div></div></div>';
			messagesHtml = closeiconTpl.replace('{message}', messagesHtml);
		}
		
		var template = options.template.replace('{errMsgClass}', options.errMsgClass).replace('{message}', messagesHtml);
		
		var errmsg = $(template);
		errmsg.appendTo(msg_container);
		
		var pos = getErrMsgPosition(element, errmsg); 
		
		errmsg.css({ visibility: 'visible', position: 'absolute', top: pos.top, left: pos.left }).fadeIn(options.showErrMsgSpeed);
	}
	
	// removes error message from DOM
	removeErrMsg = function(element){
		var existingMsg = element.data("errMsg.bV")
		if(existingMsg){
			existingMsg.remove();
		}
	}
	
	// calculates error message position relative to the input	
	getErrMsgPosition = function(input, tooltip) {
	        
	        var tooltipContainer = input.data("errMsg.bV");
	        var top  = - ((tooltipContainer.offset().top - input.offset().top) + tooltip.outerHeight() - options.offset.y);
	        var left = (input.offset().left + input.outerWidth()) - tooltipContainer.offset().left + options.offset.x;
		
		var x = options.position.x;
		var y = options.position.y;
		
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
	        if($.isFunction(options[type])){
	        	return options[type](param1, param2, param3);
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
		},

	};
	
})(jQuery);