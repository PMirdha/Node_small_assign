var http = require('http'),
	url  = require('url'),
	Conn_manip =require("./connection_manipulation_class") ;


var conn_obj=[];  //Global variable to keep track of new connections
var num_con =0;   //To keep track of number of connections


function handle_request(req,res){
	req.parsed_url = url.parse(req.url,true);
	//console.log("Incomming request:( "+req.method+")"+req.url);
	//console.log(req.parsed_url);
	var core_url = req.parsed_url.pathname;
	if(req.method =="GET")
	{
		if(core_url=="/api/request")
		{
			new_con_req(req,res);
		}

		else if(core_url=="/api/serverStatus")
		{

			server_status(function(con_detail){
				res.writeHead(200,{ "Content-Type" : "application/json"});
				res.end(JSON.stringify(con_detail)+"\n");
			});

		}
		else
		{

			res.end("Something is wrong with url");

		}
	}
	else if(req.method=="PUT")
	{

		if(core_url=="/api/kill")
		{
			
			read_post_put_string(req,res,function (err,con_id) {

				console.log("Reading is done");
				var id = con_id.connId;

				if(!err)
				{

					handle_kill_request(id,function (err,status) {
						
						if(err){
							res.writeHead(200,{ "Content-Type" : "application/json"});
							res.end(JSON.stringify({"status":err})+"\n");
						}

						else{
							res.writeHead(200,{ "Content-Type" : "application/json"});
							res.end(JSON.stringify({"status": status})+"\n");
						}
						
					});
					
				}

				else{
					res.writeHead(503,{ "Content-Type" : "application/json"});
					res.end(JSON.stringify({"error": err})+"\n");
				}
			});
		}
	}
}

/*--------------------Function to handle all kill request----------------------*/
function handle_kill_request(con_id,callback) {
	var i=0;
	var err="invalid connection Id : " + con_id;

	function search(i) {

		if(i>=num_con){
			callback(err,null);
		}

		else{
			if(con_id==conn_obj[i].Con_id)
			{

				if(conn_obj[i].Status=="on")
				{
					conn_obj[i].change_status("kill");
					var stat = "killed";
					callback(null,stat);
				}

				else if(conn_obj[i].Status=="ok")
				{
					conn_obj[i].change_status("kill");
					callback(err,null);
				}
			}
			i++;
			search(i);
		}
	}
	search(0);
}


/*------------------------Function to issue new Connections-----------------------*/
function new_con_req(req,res) {
	req.parsed=url.parse(req.url,true);
	var id = parseInt(req.parsed.query.connId);
	var tout =parseInt(req.parsed.query.timeout);

	//console.log(id + "  "+ tout);
	if(isNaN(id))id=0;
	if(isNaN(tout))tout=0;

	conn_obj.push(new Conn_manip());
	num_con++;

	//console.log(conn_obj[num_con-1].Con_id);
	console.log("New connection request");

	conn_obj[num_con-1].start_con(id,tout,function(err,status) {

		if(!err){
			res.writeHead(200,{ "Content-Type" : "application/json"});
			res.end(JSON.stringify({"status": status})+"\n");
		}

		else
		{
			res.writeHead(503,{ "Content-Type" : "application/json"});
			res.end(JSON.stringify({"error": err})+"\n");
		}

	});

}

/*---------------Function to check current connection details----------------------------*/
function server_status(callback){
	var i=0;
	var con_detail={};
	function check(i){

		if(i>=num_con)
		{
			callback(con_detail);
		}

		else{
			if(conn_obj[i].Status=="on")
			{
				var con_id = conn_obj[i].Con_id;
				var time = conn_obj[i].Tout_sec;
				con_detail[con_id] =  time;
			}
			i++;
			check(i);
		}

	}
	check(0);

}

/*---------------Function to read String from POST or PUT method---------------------*/
function read_post_put_string(req,res,callback) {
	var json_data="";

	req.on(
		"readable",
		function(){
			var d = req.read();
			if(d!=null)
			{
				if(typeof d == 'string')
				{
					json_data+=d;
				}
				else (typeof d=='Object' && d instanceof Buffer)
				{
					json_data += d.toString("utf8");
				}
			}
		}
	);
	
	req.on(
		"end",
		function(){
			var err=null;
			//console.log(json_data);
			if(!json_data)
			{
				err = "not a valid data";
			}
			else
			{
				var json_parsed;
				try{
					json_parsed = JSON.parse(json_data);
					//console.log(json_parsed);
				}catch(e){
					console.log(e.message);
					err = e.message;
					callback(err,null);
				}
				if(!json_parsed)
				{
					err = "I got no JSON data";
					callback(err,null);
				}
				else{
					console.log("Valid Data:-" + JSON.stringify(json_parsed));
					callback(null,json_parsed);
				}
			}
			
		}
	);
}




/*--------------------Create a server and listen on port 8080--------------------*/

var s = http.createServer(handle_request);

s.listen(8080);