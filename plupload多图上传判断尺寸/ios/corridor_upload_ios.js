
accessid = ''
accesskey = ''
host = ''
policyBase64 = ''
signature = ''
callbackbody = ''
filename = ''
key = ''
expire = 0
g_object_name = ''
g_object_name_type = ''
now = timestamp = Date.parse(new Date()) / 1000; 

upload_geshu = 0
just_file_names = []
current_width = 0;
current_height = 0;

var year;
var month;
var day;
var hour;
var minutes;

function send_request()
{
    var xmlhttp = null;
    if (window.XMLHttpRequest)
    {
        xmlhttp=new XMLHttpRequest();
    }
    else if (window.ActiveXObject)
    {
        xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
  
    if (xmlhttp!=null)
    {
		if(null == year){
			var dn = new Date();
			year = dn.getFullYear();
			month = dn.getMonth()+1;
			if(month<10){
				month = "0"+month;
			}
			day = dn.getDate();
			if(day<10){
				day = "0"+day;
			}
			hour = dn.getHours();
			if(hour<10){
				hour = "0"+hour;
			}
			minutes = dn.getMinutes();
			if(minutes<10){
				minutes = "0"+minutes;
			}
		}
        // serverUrl是 用户获取 '签名和Policy' 等信息的应用服务器的URL，请将下面的IP和Port配置为您自己的真实信息。
        serverUrl = 'http://req.petreasure.com/req/ali/oss/get?version='+pageTemp.version+'&which=corridor&id='+pageTemp.id+'&flag='+(''+year+month+day+hour+minutes)
		
        xmlhttp.open( "GET", serverUrl, false );
        xmlhttp.send( null );
        return xmlhttp.responseText
    }
    else
    {
        alert("Your browser does not support XMLHTTP.");
    }
};

function check_object_radio() {
    var tt = document.getElementsByName('myradio');
    for (var i = 0; i < tt.length ; i++ )
    {
        if(tt[i].checked)
        {
            g_object_name_type = tt[i].value;
            break;
        }
    }
}

function get_signature()
{
    // 可以判断当前expire是否超过了当前时间， 如果超过了当前时间， 就重新取一下，3s 作为缓冲。
    now = timestamp = Date.parse(new Date()) / 1000; 
    if (expire < now + 3)
    {
        body = send_request()
        var obj = eval ("(" + body + ")");
        host = obj['host']
        policyBase64 = obj['policy']
        accessid = obj['accessid']
        signature = obj['signature']
        expire = parseInt(obj['expire'])
        callbackbody = obj['callback'] 
        key = obj['dir']
        return true;
    }
    return false;
};

function random_string(len) {
　　len = len || 32;
　　var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';   
　　var maxPos = chars.length;
　　var pwd = '';
　　for (i = 0; i < len; i++) {
    　　pwd += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
}

function get_suffix(filename) {
    pos = filename.lastIndexOf('.')
    suffix = ''
    if (pos != -1) {
        suffix = filename.substring(pos)
    }
    return suffix;
}

function calculate_object_name(filename)
{
    if (g_object_name_type == 'local_name')
    {
        g_object_name += "${filename}"
    }
    else if (g_object_name_type == 'random_name')
    {
        suffix = get_suffix(filename)
		
		var random_name = random_string(22);
        g_object_name = key +(''+year+month+day+hour+minutes)+ random_name + suffix;
		
		just_file_names.push((''+year+month+day+hour+minutes)+random_name + suffix);
    }
    return ''
}

function get_uploaded_object_name(filename)
{
    if (g_object_name_type == 'local_name')
    {
        tmp_name = g_object_name
        tmp_name = tmp_name.replace("${filename}", filename);
        return tmp_name
    }
    else if(g_object_name_type == 'random_name')
    {
        return g_object_name
    }
}

function set_upload_param(up, filename, ret)
{
    if (ret == false)
    {
        ret = get_signature()
    }
    g_object_name = key;
    if (filename != '') { suffix = get_suffix(filename)
        calculate_object_name(filename)
    }
    new_multipart_params = {
        'key' : g_object_name,
        'policy': policyBase64,
        'OSSAccessKeyId': accessid, 
        'success_action_status' : '200', //让服务端返回200,不然，默认会返回204
        'callback' : callbackbody,
        'signature': signature,
    };

    up.setOption({
        'url': host,
        'multipart_params': new_multipart_params
    });

    up.start();
}

var uploader = new plupload.Uploader({
	runtimes : 'html5,flash,silverlight,html4',
	browse_button : 'selectfiles', 
    multi_selection: false,
	container: document.getElementById('container'),
	flash_swf_url : 'lib/plupload-2.1.2/js/Moxie.swf',
	silverlight_xap_url : 'lib/plupload-2.1.2/js/Moxie.xap',
    url : 'http://oss.aliyuncs.com',

	resize: {
		crop: false,
		quality: 60,
		preserve_headers: false
	},	
	
    filters: {
        mime_types : [{ title : "Image files", extensions : "jpg,jpeg" }],
        max_file_size : '5mb', //最大只能上传5mb的文件
        prevent_duplicates : true, //不允许选取重复文件
		max_file_geshu : parseInt(pageTemp.zhang)
    },

	init: {
		PostInit: function() {
			document.getElementById('ossfile').innerHTML = '';
			document.getElementById('postfiles').onclick = function() {
				
			document.getElementById('selectfiles').style.display = "none";
			document.getElementById('postfiles').style.display = "none";
			
            set_upload_param(uploader, '', false);
            return false;
			};
		},

		FilesAdded: function(up, files) {
			
			var img = new moxie.image.Image();

			img.onload = function() {

				var first = false;

				if(current_width == 0){
					first = true;
				}

				if(first || (current_width == img.width && current_height == img.height)){
					current_width = img.width;
					current_height = img.height;
				
					plupload.each(files, function(file) {
						document.getElementById('ossfile').innerHTML += '<div id="' + file.id + '">' + file.name + ' (' + plupload.formatSize(file.size) + ')<b></b>'
						+'<div class="progress"><div class="progress-bar" style="width: 0%"></div></div>'
						+'</div>';
					});
				}else{
					document.getElementById('console').appendChild(document.createTextNode("\n尺寸不同,添加失败"));
					uploader.removeFile(files[files.length-1]);
				}
			};

			img.load(files[0].getSource());
			
		},
		FilesRemoved: function(up, rFiles) {
			upload_geshu -= 1;

		},
		QueueChanged:function(up) {

		},

		BeforeUpload: function(up, file) {
            check_object_radio();
            set_upload_param(up, file.name, true);
        },

		UploadProgress: function(up, file) {
			var d = document.getElementById(file.id);
			d.getElementsByTagName('b')[0].innerHTML = '<span>' + file.percent + "%</span>";
            var prog = d.getElementsByTagName('div')[0];
			var progBar = prog.getElementsByTagName('div')[0]
			progBar.style.width= 2*file.percent+'px';
			progBar.setAttribute('aria-valuenow', file.percent);
		},

		FileUploaded: function(up, file, info) {
			
			var width = JSON.parse(info["response"])["width"];
			var height = JSON.parse(info["response"])["height"];
			
            if (info.status == 200)
            {
                document.getElementById(file.id).getElementsByTagName('b')[0].innerHTML = '上传成功';
            }
            else if (info.status == 203)
            {
                document.getElementById(file.id).getElementsByTagName('b')[0].innerHTML = '上传失败';
            }
            else
            {
                document.getElementById(file.id).getElementsByTagName('b')[0].innerHTML = '上传失败';
            } 
			
			if(just_file_names.length == upload_geshu){
				setTimeout(function () {
					var file_names = "";
					for(var i = 0;i<upload_geshu;i++){
						file_names += just_file_names[i]+"_";
					}
					window.location.href="http://req.petreasure.com/req/ali/corridor/forJump.html?file="+file_names+"&width="+width+"&height="+height+"&version=petreasure"; 
				}, 200)
			}
		},

		Error: function(up, err) {
			
            if (err.code == -600) {
                document.getElementById('console').appendChild(document.createTextNode("\n文件大小5M以内"));
            }
            else if (err.code == -601) {
                document.getElementById('console').appendChild(document.createTextNode("\n支持的文件后缀为:jpg,jpeg"));
            }
            else if (err.code == -602) {
                document.getElementById('console').appendChild(document.createTextNode("\n此文件已上传过"));
            }
            else 
            {
                document.getElementById('console').appendChild(document.createTextNode("\n出错"));
            }
		}
	}
});

plupload.addFileFilter('max_file_geshu', function(geshu, file, cb) {
	if(this.files.length >= geshu){
		document.getElementById('console').appendChild(document.createTextNode("\n单张模式1张,系列模式30张"));
		cb(false);
	}else{
		upload_geshu = this.files.length+1;
		cb(true);
	}
	
}); 


uploader.init();

document.getElementById('back').onclick = function() {
window.location.href="http://req.petreasure.com/req/ali/corridor/forJump.html?version=petreasure"; 
};