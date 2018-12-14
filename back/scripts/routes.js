var bcrypt		= require('bcrypt'),
	database	= require('./database.js'),
	activeSession, 
	m_info = "",
	userDB		= database.userModel,
	roomDB		= database.roomModel;

module.exports = {

	serge	: function (req, res) {
		res.send('home');
	},
	home	: function (req, res) {
		res.render('home');
	},
	signup	: function (req, res) {
		res.render('signup.ejs');
	},
	registering : function (req, res) {
		
		if(req.body.username && req.body.password)
		{
			var query = userDB.findOne({"username": req.body.username});
			query.exec(function(err, exist) {
				if (err)
				{
					 res.render('show_error.ejs', { msg_err: 'Database error!' });
					 return ;
				}
				if (!exist)
				{
					bcrypt.hash(req.body.password, 11, function(err, hash){
						if (err)
							res.send('Error= '+err);
						else
						{
							var registerUser = new userDB({username: req.body.username, password: hash});
							registerUser.save(function(err, ret) {
								if (err)
								{
									 res.render('show_error.ejs', { msg_err: 'Database error!' });
									 return ;
								}
								else
								{
									res.render('show_info.ejs', { msg_err: 'User registered! <a href="/login">Login here!</a>' });
									return ;
								}
							});
						}
					});	
				}
				else
				{
					res.render('show_error.ejs', { msg_err: 'Username already exist!' });
					return ;
				}
			});
		}
	},
	login	: function (req, res) {
			res.render('login.ejs', {m_info: m_info});
	},
	authentification : function (req, res) {
		if (req.body.username && req.body.password)
		{
			var query = userDB.findOne({"username": req.body.username});
			query.exec(function(err, exist) {
				if (err)
				{
					 res.render('show_error.ejs', { msg_err: 'Database error!' });
					 return ;
				}
				if (exist !== null)
				{
					bcrypt.compare(req.body.password, exist.password, function (err, ret) {
						if (err)
							res.send('Error database!');
						else
						{
							activeSession = req.session;
							activeSession.user = exist.username;
							exist.roomid = '';
							exist.save();
							res.redirect('/checkrooms');
						} 
					});
				}
				else
				{
					res.render('show_error.ejs', { msg_err: 'Username not found!' });
					return ;
				}
			});
		}
		else
		{
			res.redirect('/login');
		}
	},
	logout	: function (req, res) {
		
		if (activeSession.user)
		{
			var username = activeSession.user;
			
			roomDB.find({}, function(err, exist) {
				if (err)
				{
					res.render('show_error.ejs', { msg_err: 'Database error!' });
							 return ;
				}
				if (exist)
				{
					console.log(exist);
					exist.forEach(function(elm, idx){
						for(var i = 1; i <= 4; i++)
						{
							if (elm['drawer'+i] == username)
							{
								elm['drawer'+i] = "";
								elm.save(function(){ 
									roomDB.remove({"drawer1": "", "drawer2": "", "drawer3": "", "drawer4": ""}, function(){
									});
								});
							}
						}
					});
				}
			});
			activeSession.destroy();
		}
		res.redirect('/login');
		
	},
	checkrooms : function (req, res) {
		
			roomDB.find({}, function(err, docs){
				res.render('checkrooms.ejs', {docms: docs});
			});
	},
	createroom : function (req, res) {
		
		if (activeSession.user && activeSession.room)
		{
				res.redirect('/drawingroom/'+activeSession.room);
		}
		else
		{
			roomDB.find({}, function(err, exist) {
				
					if (err)
					{
						res.redirect('/checkrooms');
					}
					if (exist)
					{
						console.log(exist);
						exist.forEach(function(elm, idx) {
							for(var i = 1; i <= 4; i++)
							{
								if (elm['drawer'+i] == activeSession.user)
								{
									res.redirect('/drawingroom/'+elm.roomid);
								}
							}
						});
						
						var str = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890", rid = "", createRoom;
							
						for (var i = 0; i < 10; i++)
						{
								rid += str[Math.round(Math.random() * str.length)];
						}
						createRoom = new roomDB({roomid: rid, roomname: 'Room N°'+rid+'.', drawer1: activeSession.user, drawer2: "", drawer3: "", drawer4: ""});
						createRoom.save(function(err, ret) {
							if(err)
								{
									res.render('show_error.ejs', { msg_err: 'Error database!' });
									return ;
								}
							else
								{
									activeSession.room = rid;
									res.redirect('/drawingroom/'+rid);
								}
						});
					}
			});
		}
		
	},
	drawingroom : function (req, res) {
		
		if (req.session.room)
		{
			if (req.params.roomid === req.session.room)
			{	
				res.render('drawingroom.ejs', { roomid: req.params.roomid, username: activeSession.user, roomname: activeSession.room });
			}
			else
			{
				req.session.room = null;
				res.redirect('/');
			}
		}
		else 
		{
			if (req.params.roomid)
			{
				roomDB.findOne({roomid:req.params.roomid}, function (err, exist){
						if (err)
						{
							res.send('ERROR');
						}
						if (exist)
						{
							if (exist.drawer1 == '' || exist.drawer1 == activeSession.user)
								exist.drawer1 = activeSession.user;
							else if (exist.drawer2 == '' || exist.drawer2 == activeSession.user)
								exist.drawer2 = activeSession.user;
							else if (exist.drawer3 == '' || exist.drawer3 == activeSession.user)
								exist.drawer3 = activeSession.user;
							else if (exist.drawer4 == '' || exist.drawer4 == activeSession.user)
								exist.drawer4 = activeSession.user;
							exist.save(function () {
								activeSession.room = exist.roomid; 
								res.render('drawingroom.ejs', { roomid: req.params.roomid, username: activeSession.user, roomname: activeSession.room });
							});
						}
						else
							res.redirect('/');
				});
			}
			else
				res.redirect('/');
		}
	},
	noLogin : function (req, res, next) {
		if (!req.session.user)
		{
			next();
		}
		else
		{
			res.redirect('/checkrooms');
		}
	},
	requireLogin: function (req, res, next) {
		if (req.session.user) {
			activeSession = req.session;
			next();
		}
		else {
			res.redirect('/');
		}
	}
};
