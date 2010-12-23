

(function($) {
	
	var defaultOptions = {
		
		showCloseIcon: true,		// put close icon on tooltip
		
		// show/hide effects
		showEffect: 'default',	// show effect for tooltip
		hideEffect: 'default',	// hide effect for tooltip
		speed: 'normal',		// message's fade-in speed
		
		// css class names
		closeIconClass: 'bvalidator_close_icon',// close tooltip icon class
		tooltipClass: 'bvalidator_tooltip',	// tooltip class
		errorClass: 'bvalidator_invalid',	// input field class name in case of validation error
		
		// when to validate
		inputEvent: null,			// change, blur, keyup, null 
		errorInputEvent: 'keyup',		// change, blur, keyup, null 
		formEvent: 'submit',			// submit, null
		
		lang: 'en',					// default language for error messages 
		template: '<div/>',
		errorMessageAttr: 'data-validation-error', // name of the attribute for overridden error message
		
		offset: [0, 0], 
		position: 'center right',
		singleError: false		// validate all inputs at once
	};
	
	$.fn.bValidator = function(options) {

		var options = $.extend(defaultOptions, options);
	
		//alert(this.attr('id'));
	};
})(jQuery);