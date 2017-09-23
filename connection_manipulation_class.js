/*-------------------------------Class for work to be done----------------------*/

function Conn_manip(){
}
Conn_manip.prototype.Con_id=0;
Conn_manip.prototype.Tout_sec = 0;
Conn_manip.prototype.Status = null;

Conn_manip.prototype.start_con=function(con_id,tleft,callback){
	this.Con_id = con_id;
	this.Tout_sec = tleft;
	this.Status = "on";
	var self = this;
	//console.log("New connection request");
	this.start_stop_timer(function(exit_status){
		var json = {};
		self.Status = exit_status;
		console.log("Connection with id - "+self.Con_id+" Loop exited:- "+ exit_status);
		callback(null,exit_status);
	});

}

Conn_manip.prototype.start_stop_timer=function(callback){
	console.log("timer started");
	if(this.Status=="on")
	{
		var self=  this;
		var again=function(){
			//console.log("Time left "+self.Tout_sec);
			if(self.Tout_sec>0 && self.Status=="on")
			{
				setTimeout(function(){
					self.Tout_sec--;
					again();
				},1000);
			}
			else if(self.Tout_sec==0 || self.Status=="kill")
			{
				self.Status="ok";
				callback(self.Status)
			}
		}
		again();
	}

}

Conn_manip.prototype.change_status=function(status) {
	this.Status = status;
}

module.exports = Conn_manip;

/*--------------------------------Class Ends------------------------------------*/