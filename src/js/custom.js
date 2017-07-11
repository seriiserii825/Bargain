$(function () {
	/*toggle-menu
	===============================*/
	$('#js-close-menu').on('click', function(){
		$(this).toggleClass('active');
		$('#js-main-menu').slideToggle();
	});

});