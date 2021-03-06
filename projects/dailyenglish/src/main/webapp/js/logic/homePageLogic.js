var tableMeta = {
	    columnDefs: [
            {key:"checkbox", label:"请选择", formatter:"",width:50 , sortable:false},
	        {key:"title", label:"帖子标题", formatter:"formatPostTitle",width:130 , sortable:true},
	        {key:"author", label:"作者", formatter:"", width:80 , sortable:false},
	        {key:"createtime", label:"创建日期", formatter:"formatJavaDate", width:130 , sortable:true},
	    ],
	    state : {
	        page:{"rowsPerPage":10,"totalRecords":"","visibility":null,"recordOffset":0, "local":false},
            sort:{key:"createtime",dir:0},
            filter:{}
	    }
};

function getCurrentTime(){
	var time;
	jUserLoginIn.getCurrentTime(function(data){
		if(data != null){
			time = data;
		}else{
			return null;
		}
	});
	return time;
}

function showPost(title){
	JqueryDialog.Open('帖子信息', 'postinformation.html', 300, 300, title,false);
}

function initialDialog(field){
	jPost.getPostByTitle(field,function(data){
		$("#posttitle").val(data.title);
		$("#postcontent").val(data.content);
		$("#createDate").val(formatPostDate(data.createtime));
		$("#changeDate").val(formatPostDate(data.lastchange));
		$("#postauthor").val(data.author);
		pageState.initialPost.title = data.title;
		pageState.initialPost.content = data.content;
	});
}

function createPost(){
	JqueryDialog.Open('创建新帖子', 'postinformation.html', 300, 300,"",true);
	$("#postauthor").hide();
	$("#create").hide();
	$("#change").hide();
	$("#author").hide();
}

function formatPostTitle(data){
	var str =  "<a href='javascript:showPost(\"" + data + "\");'>" + data + "</a>";
	return str;
}

function deletePost(){
	var tableObj = document.getElementsByName("chkBox");
	var deleteTitles = new Array();
	var j = 0;
	for(var i in tableObj){
		var obj = tableObj[i];
		if(obj.type == "checkbox" && obj.checked){
			var value = obj.value;
			deleteTitles[j++] = value;
		}
	}
	if(j > 0){
		var del = true;
		DWREngine.setAsync(false); 
		for(var i=0;i<deleteTitles.length;i++){
			jPost.validateAuthority(deleteTitles[i],function(data){
				if(!data){
					del = false;
				}
			});
		}
		DWREngine.setAsync(true);
		if(del){
			jPost.deletePostsByTitles(deleteTitles,function(){
				makeTable(tableMeta);
				renderPaginator();
				alert("刪除成功");
		    });
		}else{
			alert("您没有权限，请联系管理员");
		}
	}else{
		alert("请选择帖子");
	}
}

function submitPostInformation(isCreate){
	if(isCreate){
		var postbean = new Object();
		postbean.title = $("#posttitle").attr("value");
		postbean.content = $("#postcontent").attr("value");
		jPost.createPost(postbean,function(data){
			if(data){
				alert("Create Post Success");
				makeTable(tableMeta);
				renderPaginator();
				JqueryDialog.Close();
			}
		});
	}else{
		validateChangeAndUpdate();
	}
	
}

function validateChangeAndUpdate(){
	var currenttitle = $("#posttitle").attr("value");
	var currentcontent = $("#postcontent").attr("value");
	if(currenttitle != pageState.initialPost.title || currentcontent != pageState.initialPost.content){
		var r=confirm("你改变了信息，要保存吗?");
		if(r){
			jPost.validateAuthority(pageState.initialPost.title,function(data){
				if(data){
					jPost.updatePost(currenttitle ,currentcontent,function(updateflag){
						if(updateflag){
							alert("更新信息成功");
						}
						JqueryDialog.Close();
					});
				}else{
					alert("您没有权限，请联系管理员");
				}
			});
		}
	}
}
        
function display(){  
	highlightLeftNav("homePage");
	var time = getCurrentTime();
	$("#time").html(time);
	var post = "Jason发了新帖子";
	$("#postaction").html(post);
	makeTable(tableMeta);
	renderPaginator();
}

function makeTable(tableMeta){
	jPost.getAllPost(tableMeta.state,function(data){
		var dataTable = new DataTable("tabletest",tableMeta,data);
	});
}

function renderPaginator(){
	var rowsPerPage = tableMeta.state.page.rowsPerPage;
	var currentPage = 1 + Math.ceil(globalRecordOffset / rowsPerPage);
	DWREngine.setAsync(false); 
    jPost.getPostCount(function(data){
    	pageState.initialPost.totalRecords = data;
    	tableMeta.state.page.totalRecords = data;
    });
    DWREngine.setAsync(true);
	var paging = new Paginator(currentPage, tableMeta.state.page.totalRecords, rowsPerPage, "paging", "gotoPage");
	paging.render();
}

function gotoPage(pageNum){
	globalRecordOffset = (pageNum - 1) * tableMeta.state.page.rowsPerPage;
	tableMeta.state.page.recordOffset = globalRecordOffset;
	makeTable(tableMeta);
	renderPaginator();
}

