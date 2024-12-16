var xhr = $.ajax();

function setHeaders() {
	var h = {
		'app_key' : APPS_TOKEN,
		'app_version' : APPS_VERSION_NUMBER,
		'app_id' : APPS_ID,
		'token' : USER_TOKEN,
		'refresh_token' : TOKEN_KEY
	};
	if (PRODUCTION == false) {
		h['app_dev'] = 1;
	}
	return h;
}

function setParams(params) {
   if (typeof params  === 'object' && params !== null) {
      params['userid'] = localStorage.getItem('userid');
		params['username'] = localStorage.getItem('username');
		params['token'] = localStorage.getItem('user_token');
		params['lat'] = lat;
		params['lng'] = lng;
		return params;
   } else {
      return false;
   }
}

function bindClick() {
	/**/
	$('[goto-url], .external-link, .external_link, .external-url, .external_url').unbind('click').on('click',function(){
		var url = $(this).attr('data-url') ? $(this).attr('data-url') : $(this).attr('goto-url');
		var u = encodeURI(url);
		// cordova.InAppBrowser.open(u,'_system');
      window.open(u,'_blank');	
	});
	
	$('[goto-page], .get_url, .get-url').unbind('click').on('click',function(){
		var url = $(this).attr('data-url') ? $(this).attr('data-url') : $(this).attr('goto-page');
		var data = {};
		$('.modal').hide().remove();
      loadPage({
         url : url,
         data : data,
         success : function(){ window.scrollTo(0,0); }
      });
	});

   $('[data-dialog]').unbind('click').click(function() {
		var url =  $(this).attr('data-dialog');
		var title = $(this).attr('data-title') ? $(this).attr('data-title') : '';
		var size = $(this).attr('dialog-size') ? $(this).attr('dialog-size') : 'lg';
      var name = $(this).attr('dialog-name') ? $(this).attr('dialog-name') : 'dlg_edit';
		dialog({
			url : url,
			name : name,
			title : title,
			pos : 'center',
			size : size
		});
	});
		
	/**/
	$('.exit, [exit]').unbind('click').click(function(){ 
		navigator.notification.confirm('Tekan OK untuk menutup aplikasi',function(a) { if (a == 1) { navigator.app.exitApp(); }},'');
	});

	// Move to Bottom-Controler.php
	// $('[signout], [logout]').unbind('click').click(signOut);

	$('.carousel').carousel();
}


function loadSpiner(option) {
   var tipe = option.tipe ? option.tipe : 'page';
   var status = option.status ? option.status : 'on';
   var id = option.id ? option.id : '';
   $('.spinning').remove();
   $('.myspinner').remove();
   switch(tipe) {
      default :
         if (status == 'on') {
            $('body').prepend('<div class="myspinner"><div class="spinner-border" role="status"></div></div>');
            $('.myspinner').css({ 'display' : 'flex', 'z-index' : '10500' });
            if (option.autoclose > 0) {
               setTimeout(function(){
                  $('.myspinner').remove();
               },option.autoclose * 1000);
            }
         }
      break;

      case 'placeholder' :
         var html = '<p class="card-text placeholder-glow">'
                  +'<span class="placeholder col-7"></span>'
                  +'<span class="placeholder col-4"></span>'
                  +'<span class="placeholder col-4"></span>'
                  +'<span class="placeholder col-6"></span>'
                  +'<span class="placeholder col-8"></span>'
                  +'</p>';
         if (id) {
            $('#'+id).html(html);
         }
      break;

      case 'spinner' :
         if (id) {
            $('#'+id).html('<i class="fa fa-sync fa-spin spinning"></i>');
         }
      break;
   }
}

function postForm(option) {
   var url = $(option.form).attr('data-url');
   var params = getFormData($(option.form));
   var data = Object.assign(params,option.data);
	// option['data'] = data;
	option['tipe'] = 'json';
	// alert(JSON.stringify(option.data));
	loadPage(option);
}

function loadPage(option) {
   var tipe = option.tipe ? option.tipe : 'html';
   var url = API_URL+ (option.url ? option.url : '');
   var elm = option.elm ? option.elm : '#layout';
   var params = option.data ? option.data : {};
   var data = setParams(params);
   var spinner = option.spiner ? option.spiner : { 'status' : 'on'};
   try {
      if (url == '') { throw "Invalid URL!"; }
      // alert(JSON.stringify(params));
      loadSpiner(spinner);
      $.ajax({
         url : url, dataType : 'html', type : 'POST',
         headers : setHeaders(), data : data, error : function(a,b,c) {
            loadSpiner({ 'status' : 'off' });
            debug('Request Timeout, please try again!','error');
            if (option.error) { setTimeout(option.error,500); }
         }, success : function(html) {
            // alert(html);
            loadSpiner({ 'status' : 'off' });
            if (tipe == 'json') {
               var js = JSON.parse(html);
               var res = js;
            } else {
               $(elm).html(html);
               var res = html;
            }
            if (option.success) {
               setTimeout(option.success(res),500);
            }
         }

      });
   } catch(e) {
      loadSpiner({ 'status' : 'off' });
      alert(e);
   }
}

function getFormData(form){
    var unindexed_array = form.serializeArray();
    var indexed_array = {};

    $.map(unindexed_array, function(n, i){
        indexed_array[n['name']] = n['value'];
    });

    return indexed_array;
}

function debug(m,t) {
	if (t == null || t == 'undefined' || t == '') {
		t = 'question';
	}
	var Toast = Swal.mixin({
      toast: true,
      position: 'top', //top-end
      showConfirmButton: false,
      timer: 3000
    });
	Toast.fire({
	  icon: t,
	  title: m
	});
}

function formatted_string(pad, user_str, pad_pos)
{
  if (typeof user_str === 'undefined') 
    return pad;
  if (pad_pos == 'l')
     {
     return (pad + user_str).slice(-pad.length);
     }
  else 
    {
    return (user_str + pad).substring(0, pad.length);
    }
}

function commaFormatted(amount) {
	var amount = amount + ',00';
	var a = amount.split(',', 1);
	var d = new String(a[1]);
	var i = parseInt(a[0]);
	if(isNaN(i)) { return ''; }
	var minus = '';
	if(i < 0) { minus = '-'; }
	i = Math.abs(i);
	var n = new String(i);
	var b = [];
	while(n.length > 3)
	{
		var nn = n.substr(n.length-3);
		b.unshift(nn);
		n = n.substr(0,n.length-3);
	}
	if(n.length > 0) { b.unshift(n); }
	n = b.join(",");
	if(a[1])
	{
	    if(d.length < 1) { amount = n; }
	    else { amount = n + ','+ d ; }
	}
	else
	{
	    amount = n;
	}
	amount = minus + amount;
	return amount;
}

function showErrorStatus(option) {
   if (typeof option  === 'object') {
      e = option.text ? option.text : ''
   } else {
      e = option
   }
   var html = '<div id="error-status" class="card bg-danger-subtle shadow">'
   +'<div class="error-text card-body">';
   if (option.close == true) { html+='<div class="text-end mb-3"><i class="fa fa-close" aria-close="error-status"></i></div>'; }
   html+=e+'</div></div>';
   $('#error-status').remove();
   $('body').append(html);
   
   if (option.close == true) {
      $('[aria-close]').unbind('click').click(function(){
         var dv = $(this).attr('aria-close');
         $('#'+dv).remove();
      });
   }   
}

function dialog(option) {
	var url = option.url;
	var nama = option.nama ? option.nama : option.name;
	option.size = option.size ? option.size : 'lg';
	var pos = option.pos == 'center' ? 'modal-dialog-centered' : '';

	if (option.size == 'fullscreen') {
		size = 'modal-fullscreen';
	} else {
		size = 'modal-'+option.size+' modal-dialog-scrollable';
	}

	var html = '<div class="modal fade" id="'+nama+'" data-bs-backdrop="static" data-bs-keyboard="false" aria-labelledby="staticBackdropLabel" aria-hidden="true">'+
						'<div class="modal-dialog '+size+' '+pos+'">'+
				'<div class="modal-content">'+
				'<div class="modal-header">'+
					'<h1 class="modal-title fs-5" id="staticBackdropLabel">'+option.title+'</h1>'+
					'<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>'+
				'</div>'+
				'<div class="modal-body">'+
				'</div>'+
				'<div class="modal-footer">'+
				'</div>'+
				'</div>'+
			'</div>'+
			'</div>';
	$('#'+nama).remove();
	$('body:first').prepend(html);
	$('#'+nama).modal('show').on('shown.bs.modal', function () {
		if (option.url) {
			//loadHTML(url,{},$('#'+nama+' .modal-body'),option.callbackOpen);
         loadPage({ url : url, elm : '#'+nama +' .modal-body', success : option.callbackOpen });
		} else {
			if (option.content) { 
				$('#'+nama+' .modal-body').html(option.content); 
				if (option.callbackOpen) {
					setTimeout(option.callbackOpen,100);
				}
			}
		}
      bindClick();
	}).on('hidden.bs.modal',function(){
		bindClick();
		setTimeout(option.callbackClose,1);
	});
}

function swalert(options) {
	var option = {};
	if (typeof options == 'object') {
		option = options;
	} else {
		option.text = options;
	}
	Swal.fire({
		target : option.target ? option.target : '',
		toast : true,
		showConfirmButton: false,
		timer: 3000,
		text : option.text
	})
}

function printData(option) {
	var html = $(option.div).html();
	// alert(html);
	dialog({
		title : (option.title ? option.title : ''),
		nama : 'dlg_print',
		content : html,
		size : 'fullscreen',
		callbackOpen : function() { setTimeout(function() { window.print(); },1000); }
	});
}

/* For Cordova */
function initStart() {
   if (TOKEN_KEY == null || TOKEN_KEY == '') {
		TOKEN_KEY = md5(device.uuid+'-'+device.cordova);
		localStorage.setItem('token_key',TOKEN_KEY);
	}
   if (APPS_TOKEN == '' || APPS_TOKEN == null || APPS_TOKEN == 'undefined') {
		appVersionData();
		setTimeout(function() { window.location.reload(); },1000);
	} else {
      loadSpiner({ status : 'on' });
      $.ajax({
         headers : setHeaders(),
         url : API_URL+'?call=home', data : setParams({}), type : 'POST', dataType : 'html',
         timeout : 10000, error : function() {
            loadSpiner({ status : 'off' });
            showErrorStatus('<p class="mb-2">Server timeout, please reload to reconnect</p><p><button type="button" class="btn btn-default"><i class="fa fa-sync"></i> Reload</button> <a href="settings.html" class="btn btn-default"><i class="fa fa-gear"></i> Setting</a></p>');
         }, success : function(html) {
            loadSpiner({ status : 'off' });
            $('#layout').html(html);
            bindClick();
            if (cordova.platformId == 'android') {
               if (StatusBar) {
                  StatusBar.overlaysWebView(false);
                  StatusBar.backgroundColorByHexString(NAVBAR_COLOR);
                  StatusBar.show();
               }
            }
         }
      })
   }
}

function appVersionData() {
	cordova.getAppVersion.getAppName(function (version) {
    	localStorage.setItem('apps_name',version);
		APPS_NAME = version;	
	});

	cordova.getAppVersion.getVersionCode(function (version) {
    	localStorage.setItem('apps_version_code',version);
		APPS_VERSION_CODE = version;	
	});
	
	cordova.getAppVersion.getVersionNumber(function (version) {
    	localStorage.setItem('apps_version_number',version);
		APPS_VERSION_NUMBER = version;
	});
	
	cordova.getAppVersion.getPackageName(function (version) {
    	localStorage.setItem('apps_token',version);
		APPS_TOKEN = version;
	});
	
}

