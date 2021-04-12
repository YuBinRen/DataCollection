$.ajaxSetup({ 
	beforeSend: function(xhr, settings) {
		function getCookie(name) {
			var cookieValue = null;
			if (document.cookie && document.cookie != '') {
				var cookies = document.cookie.split(';');
				for (var i = 0; i < cookies.length; i++) {
					var cookie = jQuery.trim(cookies[i]);
					// Does this cookie string begin with the name we want?
					if (cookie.substring(0, name.length + 1) == (name + '=')) {
						cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
						break;
					}
				}
			}
			return cookieValue;
		}
		if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
			xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
		}
	}
});

var update_accordion = function(exit_status){
	
	switch(exit_status) {
		case 'finished':
			//change log-header
			$('#log-header').text(' - Click to open the log');
			$('#load-pic').css('display', 'none');
			$('#res-head').css('display', 'block');
			$('#accordion').accordion('activate', 0);
			$('#log-name').css('font-weight', 'normal');
			$('#jobok-pic').css('display', 'block');
			$('#joberr-pic').css('display', 'none');
			$('#jobq-pic').css('display', 'none');
			break;

		case 'finished-err':
			//change log-header
			$('#log-header').text(' - Problems in handling your input. Please check the log');
			$('#log-header').addClass('error-log');
			$('#load-pic').css('display', 'none');
			$('#res-head').css('display', 'block');
			$('#accordion').accordion('activate', 0);
			$('#log-name').css('font-weight', 'normal');
			$('#jobok-pic').css('display', 'block');
			$('#joberr-pic').css('display', 'none');
			$('#jobq-pic').css('display', 'none');
			break;
			
		case 'running':
			$('#log-header').text(' - Your job is RUNNING');
			$('#load-pic').css('display', 'block');
			$('#res-head').css('display', 'none');
			$('#jobok-pic').css('display', 'none');
			$('#joberr-pic').css('display', 'none');
			$('#jobq-pic').css('display', 'none');
			break;
			
		case 'error':
			$('#log-header').text(' - Problems in handling your input. Please check the log');
			$('#log-header').addClass('error-log');
			$('#load-pic').css('display', 'none');
			$('#res-head').css('display', 'none');	
			$('#jobq-pic').css('display', 'none');
			$('#jobok-pic').css('display', 'none');
			$('#joberr-pic').css('display', 'block');
			$('#error-log-head').css('display', 'block');
			break;
			
		case 'queued':
			$('#log-header').text(' - Your job is QUEUED');
			$('#load-pic').css('display', 'none');
			$('#res-head').css('display', 'none');
			$('#jobq-pic').css('display', 'block');
			$('#jobok-pic').css('display', 'none');
			$('#joberr-pic').css('display', 'none');
			break;
		}
	
	return true;
}

var fetch_results = function(job_id, limit, fetch_url, is_example, user_job_name){
	//console.log(job_id, 10, fetch_url, is_example, user_job_name)
	$.ajax({
		url: fetch_url,
		data: {job_id : job_id, limit: limit, is_example: is_example, user_job_name: user_job_name},
		type: 'GET',
		dataType: 'json',
		success: function(data, textStatus, jqXHR){
			$('.res-avail').css('visibility', 'visible');
			$('#Results').html(data['table']);
			//console.log(data['table']);
		//	$('.gallery').lightBox({fixedNavigation:true, maxHeight: 700, maxWidth: 700});
		},
		failure: function(jqXHR, extStatus, errorThrown){
			window.console && console.log('Results fetching failed!');
		}
	});
}

//AJAX call to check whether the JOB is complete or not. It also updates the log
var check_and_update = function(job_id, check_url, fetch_url, is_example, user_job_name){

	//console.log(job_id, 10, fetch_url, is_example, user_job_name)
	$.ajax({
		url: check_url,
		data: {job_id : job_id, is_example: is_example, user_job_name: user_job_name},
		cache: false,
		type: 'GET',
		success: function(data, textStatus, jqXHR){
			curr_log_text = data['out'];
			$('#log-content').html(curr_log_text);
			//console.log(curr_log_text);
			exit_status = data['status'];
			update_accordion(exit_status);
			//console.log(exit_status, data['random']);
			//window.console && window.console && console.log(exit_status);
			if (exit_status == 'queued' || exit_status == 'running') {
				setTimeout(function(){
					check_and_update(job_id, check_url, fetch_url, is_example, user_job_name);
				}, 5000);
			} else {
				if (exit_status == 'finished' || exit_status == 'finished-err'){
					fetch_results(job_id, 10, fetch_url, is_example, user_job_name);
				} 
			}
			
		},
		failure: function(jqXHR, extStatus, errorThrown){
			window.console && console.log('Results downloading from server failed!');
		}
	});
}

var hide_div = function(div_id, static_url){
	var shown = ($(div_id).css('display'));
	if (shown == 'none'){
		$(div_id).css('display', 'block');
		$(div_id+'-img').attr('src', static_url+'lddt/images/collapse.png');
	} else {
		$(div_id).css("display", "none");
		$(div_id+'-img').attr('src', static_url+'lddt/images/expand.png');
	}
}

//Form validation functions
var suggested_highlight = function(id){
	jq_id = '#'+id;
	chk = $(jq_id).is(':checked');

	if (! chk) {
		$(jq_id+'-container').css("border", "1px solid red");
	} else {
		$(jq_id+'-container').css("border", "none");
	}
	
}

//1 Check if suggested checkboxes are ticked


$(document).ready(function(){
	$.validator.addMethod('isInteger', function (value, element) {
    return (value % 1 === 0);
	}, 'Please input an integer greater or equal than 0.');
	
	$("#input-form").validate({
		errorPlacement: function(error, element) {
    	curr_id = element.prop('id');
    	error.appendTo($('#'+curr_id+'-err'));
		},
		rules: {
	     mod: {
	    	 required: true
	     },
	     ref_str: {
	    	 required: true
	     },
	     mail: {
	       required: false,
	       email: true
	     },
	     hyd: {
	    	 required: false
	     },
	     job_name: {
	     	 required: false,
	     	 maxlength: 40
	     },
	     r:{
	    	 required: false,
	    	 number: true,
	    	 min: 0
	     },
	     b:{
	    	 required: false,
	    	 number: true,
	    	 min: 0
	     },
	     a:{
	    	 required: false,
	    	 number: true,
	    	 min: 0
	     },
	     m:{
	    	 required: false,
	    	 number: true
	     },
	     i:{
	    	 required: false,
	    	 number: true,
	    	 min: 0,
	    	 isInteger: true
	     }
	  },
    messages: {
      mail: {
        email: "Your email address, if input, must be in the format of name@domain.com"
      }
    },
    submitHandler: function(form) {
      // If the form is valid I check for the checked molck options....
    	var def_molck = false;
    	if($('#hyd').is(':checked') && $('#unk').is(':checked') && $('#oxt').is(':checked') && $('#nonstd').is(':checked')) def_molck = true;
    	
    	if (!def_molck){
        $( "#dialog-confirm" ).dialog({
          resizable: false,
          height: "auto",
          modal: true,
          buttons: {
            Submit: function() {
              //return true;
            	form.submit();
            	//return true;
            },
            Cancel: function() {
            	$( this ).dialog( "close" );
            	return false;
            }
          }
        });
    	} else {
    		form.submit();
    		//return true;
    	}
    },
    onkeyup: false,
    onfocusout: false
  });

	$('body').popover(popOverSettings);
});

var popOverSettings = {
    placement: 'bottom',
    container: 'body',
    html: true,
    selector: '[data-toggle]', 
    title: function(){
    	var id = $(this).attr('id').substring(8);
    	switch (id){
				case 'mod-name-h':
					curr_title = 'Model name';
					break;
				case 'glob-score-h':
					curr_title = 'lDDT global score';
					break;
				case 'loc-plot-h':
					curr_title = 'lDDT local score: 2D plot';
					break;
				case 'loc-3d-h':
					curr_title = 'lDDT local score: 3D plot';
					break;
				case 'reference-h':
					curr_title = 'Reference structure';
					break;
				default:
					curr_title = 'Help';
			}

		return curr_title;
    },
    content: function () {
		var id = $(this).attr('id').substring(8);
        return $('#'+id).html();
    }
}

