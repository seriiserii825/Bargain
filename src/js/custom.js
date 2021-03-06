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