(function($){
    $(document).ready(function() {
        //alert('sss'); 
        $('.services .column').mouseenter(function(){
            $(this).find('.icon').addClass('hover');
        }).mouseleave(function(){
            $(this).find('.icon').removeClass('hover');
        });
    });
}(jQuery));
