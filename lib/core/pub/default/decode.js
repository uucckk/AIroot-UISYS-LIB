var mod = {};
var uuid = "UI";
var __PACKAGE_LIST__ = [];
function getObj(value){
	if(!mod[value]){
		mod[value] = {};
	}
	return mod[value];
}
var __FORMAT__ = function(__DATA__,__APPDOMAIN__,module){
	var list = __DATA__.split("\x01");
	var p = null;
	var t = null;
	var v = null;
	var html = null;
	var style = "";
	var runLst = [];
	for(var i = 0;i<list.length;i++){
		p = list[i];
		t = p.charAt(0)
		if(t == "R"){
			v = FormatRun(p.substring(1));
		}else{
			v = __READ_DATA__(p.substring(1));
			switch(t){
				case 'T'://HEAD
					getObj(v.module).head = v.value;
				break;
				case 'H' ://HTML
					getObj(v.module).html = v.value;
				break;
				
			}
		}
		
	}
}

/**
 * 转化为对象
 */
var __FORMAT_VALUE__ = function(value){
	var p = value.indexOf(' ');
	return {name:value.substring(0,p),value:value.substring(p+1)};
}

function FormatRun(value){
	var type = value.charAt(0);
	value = value.substr(2);
	var i = value.indexOf(" ");
	var group = value.substring(0,i);
	value = value.substring(i + 1);
	i = value.indexOf(" ");
	var name = value.substring(0,i);
	value = value.substring(i + 1);
	return {type:type,module:group,name:name,value:value};
}

var __READ_DATA__ = function(value){
	var f = value.indexOf(" ");
	var module = value.substring(0,f);
	var uuid = value.substr(f + 1,32);
	var value = value.substring(f + 34);
	return {uuid:uuid,module:module,value:value.trim()};
}

function main(){
	try{
		__FORMAT__(code);
		var p = mod[UI.GetClassName()];
		var html = "<!DOCTYPE html><html><head><meta charset='utf-8' ><script src='/uisys.js'></script><base href='/' />" + (p.head ? p.head : "") + "</head>";
		var temp = "<div style = 'display:none'>" + p.html.replace(/[\b]/g,uuid) + "</div>";
		var tmp = code.split("</script");
		var data = "";
		for(var i = 0;i<tmp.length;i++){
			data += "<script name='_data' type='text/plain'>";
			data += tmp[i];
			if(i + 1 < tmp.length){
				data += "</script";
			}
			data += "</script>";
		}
		
		var run = "<script type='text/javascript'>";
		//run += UI.GetCode(UI.SYSTEM_PATH + "/core/parser/module_base.tpl");
		run += "var fExt=" + (UI.Debug ? " '.ui'" : "'.ui.html'") + ";\r\n";
		run += "!function(){";
		//run += UI.GetCode(UI.SYSTEM_PATH + "/core/parser/module_manager.tpl");
		//此处兼容ie11 不能用innerText 只能用innerHTML
		run += "\r\nvar code = '';var lst = document.getElementsByName('_data');for(var i=0;i<lst.length;i++){code += lst[i].innerHTML;}"
		run += "\r\nUI.decode(document.body,'" + UI.GetClassName() + "',code);";
		run += "}();";
		run += "</script>";
		return html + data + "<body>" + temp + run + "</body></html>";
	}catch(e){
		return "<span>decode:" + e + "</sapn>"
	}
	
}