var bcrypt		= require('bcrypt'),
	database	= require('./database.js'),
	activeSession,
	m_info = "",
	userDB		= database.userModel,
	roomDB		= database.roomModel;

//Export des routes à employer selon l'adressage url au serveur
module.exports = {

	home	: function (req, res) {
		res.render('home');
	},
	signup	: function (req, res) {
		res.render('signup.ejs', {m_info: ""});
	},
	registering : function (req, res) {

		//Partie enregistrement
		//L'on verifie si on recupere bien en POST les valeurs username
		if(req.body.username && req.body.password)
		{
			//Si l'on trouve un username
			var query = userDB.findOne({"username": req.body.username});
			query.exec(function(err, exist) {
				if (err)
				{
					 res.render('show_error.ejs', { msg_err: 'Database error!' });
					 return ;
				}
				if (!exist)
				{
					//Si utilisateur non déjà inscrit, l'on crypte son mot de passe
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
									res.render('signup.ejs', { m_info: "User registered!" });
									
									////Si utilisation appel de front-end
									//res.json({"status":"OK", "message":"User registered!"})
									return ;
								}
							});
						}
					});
				}
				else
				{
					res.render('signup.ejs', { m_info: 'Username already exist!' });

					////Si utilisation appel de front-end
					//res.json({"status":"KO", "message":"Username already exists!"})
					return { msg_err: 'Username already exist!' };
				}
			});
		}
	},
	login	: function (req, res) {
			res.render('login.ejs', {m_info: m_info});
	},
	authentification : function (req, res) {

		//Partie authentification
		//L'on verifie si on recupere bien en POST les valeurs username et password
		if (req.body.username && req.body.password)
		{
			//On verifie l'existance de l'utilisateur
			var query = userDB.findOne({"username": req.body.username});
			query.exec(function(err, exist) {
				if (err)
				{
					 res.render('show_error.ejs', { msg_err: 'Database error!' });
					 return 'Database error!';
				}
				if (exist !== null)
				{
					//Si l'utilisateur existe dans la base de donnee, alors
					bcrypt.compare(req.body.password, exist.password, function (err, verif) {
						if (err)
							res.send('Error database!');
						else if (verif == true){

							//Si le mot de passe correspond à celui créé par l'utilisateur, alors
							//On lui crée une session
							activeSession = req.session;
							activeSession.user = exist.username;
							exist.roomid = '';
							exist.save();

							////Si utilisation appel de front-end
							//res.json({"status":"OK", "message":"User connected!", "sessionid":activeSession.user})

							//On le redirige vers l'espace des rooms
							res.redirect('/checkrooms');

						}
						else
						{
								//Destruction de session si existante
								activeSession.destroy();

								////Si utilisation appel de front-end
								//res.json({"status":"KO", "message":"Erreurs identifiants!"})

								//Le mot de passe ne correspond pas
								res.render('login.ejs', {m_info: "Error credentials"});
								return ;
						}
					});
				}
				else
				{
					//Utilisateur non trouvé
					res.render('login.ejs', {m_info: "Error credentials"});
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

		//Si session utilisateur déjà existante
		if (activeSession.user)
		{
			var username = activeSession.user;

			//L'on va regarder si cet utilisateur est connecté à une room
			roomDB.find({}, function(err, exist) {
				if (err)
				{
					res.render('show_error.ejs', { msg_err: 'Database error!' });
							 return ;
				}
				if (exist) //Si connecté à une room, alors on le déconnecte
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

		//Si l'utilisateur connecté fait deja partie d'une room, on le redirige
		if (activeSession.user && activeSession.room)
		{
				res.redirect('/drawingroom/'+activeSession.room);
		}
		else //sinon on génére une nouvelle room
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

		//Acces aux rooms
		//Si utilisateur deja attaché à une room, alors redirection à celle-ci
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
		else //Sinon il essaye d'obtenir une place dans la room qu'il essaye d'acceder
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

		//Permet de filtrer les routes avec aucun login
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

		//Permet de filtrer les routes avec login requis
		if (req.session.user) {
			activeSession = req.session;
			next();
		}
		else {
			res.redirect('/');
		}
	}
};
