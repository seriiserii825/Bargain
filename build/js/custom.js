$(function () {
	/*toggle-menu
	===============================*/
	$('#js-close-menu').on('click', function(){
		$(this).toggleClass('active');
		$('#js-main-menu').slideToggle();
	});

	/*services__list slide-toggle
	===============================*/
	$('#js-services__list > li').on('click', function(){
		var $this = $(this);
		if($this.hasClass('active') && $this.find('.services__sublist').is(':visible')){
			$this.removeClass('active').find('.services__sublist').slideUp('fast');
		}else if($this.hasClass('active') && $this.find('.services__sublist').is(':hidden')){
			$this.find('.services__sublist').slideDown();
		}
		
		return false;
	}).eq(0).addClass('active').find('.services__sublist').slideDown();

	$('#js-services__list > li').hover(function(){
		$(this).addClass('active');
	},function(){
		if($(this).find('.services__sublist').is(':hidden')){
			$(this).removeClass('active');
		}
	});

	/*advantages equalheights
	===============================*/
	$('.advantages__item-content p').equalHeights();

	/*show-modal
	===============================*/
	$('.show-modal').on('click', function(e){
		e.preventDefault();
		$('body').append('<div class="overlay"></div>').end().css('paddingRight', '17px');
		$('.modal').fadeIn(1000);
		$(this).fadeOut();
	});

	$('.modal .close').on('click', function(){
		$('.modal').fadeOut();
		$('.show-modal').fadeIn();
		$('.overlay').remove();
	});


});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjdXN0b20uanMiXSwic291cmNlc0NvbnRlbnQiOlsiJChmdW5jdGlvbiAoKSB7XHJcblx0Lyp0b2dnbGUtbWVudVxyXG5cdD09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0qL1xyXG5cdCQoJyNqcy1jbG9zZS1tZW51Jykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcclxuXHRcdCQodGhpcykudG9nZ2xlQ2xhc3MoJ2FjdGl2ZScpO1xyXG5cdFx0JCgnI2pzLW1haW4tbWVudScpLnNsaWRlVG9nZ2xlKCk7XHJcblx0fSk7XHJcblxyXG5cdC8qc2VydmljZXNfX2xpc3Qgc2xpZGUtdG9nZ2xlXHJcblx0PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSovXHJcblx0JCgnI2pzLXNlcnZpY2VzX19saXN0ID4gbGknKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xyXG5cdFx0dmFyICR0aGlzID0gJCh0aGlzKTtcclxuXHRcdGlmKCR0aGlzLmhhc0NsYXNzKCdhY3RpdmUnKSAmJiAkdGhpcy5maW5kKCcuc2VydmljZXNfX3N1Ymxpc3QnKS5pcygnOnZpc2libGUnKSl7XHJcblx0XHRcdCR0aGlzLnJlbW92ZUNsYXNzKCdhY3RpdmUnKS5maW5kKCcuc2VydmljZXNfX3N1Ymxpc3QnKS5zbGlkZVVwKCdmYXN0Jyk7XHJcblx0XHR9ZWxzZSBpZigkdGhpcy5oYXNDbGFzcygnYWN0aXZlJykgJiYgJHRoaXMuZmluZCgnLnNlcnZpY2VzX19zdWJsaXN0JykuaXMoJzpoaWRkZW4nKSl7XHJcblx0XHRcdCR0aGlzLmZpbmQoJy5zZXJ2aWNlc19fc3VibGlzdCcpLnNsaWRlRG93bigpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fSkuZXEoMCkuYWRkQ2xhc3MoJ2FjdGl2ZScpLmZpbmQoJy5zZXJ2aWNlc19fc3VibGlzdCcpLnNsaWRlRG93bigpO1xyXG5cclxuXHQkKCcjanMtc2VydmljZXNfX2xpc3QgPiBsaScpLmhvdmVyKGZ1bmN0aW9uKCl7XHJcblx0XHQkKHRoaXMpLmFkZENsYXNzKCdhY3RpdmUnKTtcclxuXHR9LGZ1bmN0aW9uKCl7XHJcblx0XHRpZigkKHRoaXMpLmZpbmQoJy5zZXJ2aWNlc19fc3VibGlzdCcpLmlzKCc6aGlkZGVuJykpe1xyXG5cdFx0XHQkKHRoaXMpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcclxuXHRcdH1cclxuXHR9KTtcclxuXHJcblx0LyphZHZhbnRhZ2VzIGVxdWFsaGVpZ2h0c1xyXG5cdD09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0qL1xyXG5cdCQoJy5hZHZhbnRhZ2VzX19pdGVtLWNvbnRlbnQgcCcpLmVxdWFsSGVpZ2h0cygpO1xyXG5cclxuXHQvKnNob3ctbW9kYWxcclxuXHQ9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ki9cclxuXHQkKCcuc2hvdy1tb2RhbCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpe1xyXG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0JCgnYm9keScpLmFwcGVuZCgnPGRpdiBjbGFzcz1cIm92ZXJsYXlcIj48L2Rpdj4nKS5lbmQoKS5jc3MoJ3BhZGRpbmdSaWdodCcsICcxN3B4Jyk7XHJcblx0XHQkKCcubW9kYWwnKS5mYWRlSW4oMTAwMCk7XHJcblx0XHQkKHRoaXMpLmZhZGVPdXQoKTtcclxuXHR9KTtcclxuXHJcblx0JCgnLm1vZGFsIC5jbG9zZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XHJcblx0XHQkKCcubW9kYWwnKS5mYWRlT3V0KCk7XHJcblx0XHQkKCcuc2hvdy1tb2RhbCcpLmZhZGVJbigpO1xyXG5cdFx0JCgnLm92ZXJsYXknKS5yZW1vdmUoKTtcclxuXHR9KTtcclxuXHJcblxyXG59KTsiXSwiZmlsZSI6ImN1c3RvbS5qcyJ9
