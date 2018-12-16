const	express			= require('express'),
			app				= express(),
			session			= require('express-session'),
			MongoStore		= require('connect-mongo')(session),
			path			= require('path'),
			engine			= require('ejs-mate'),
			cookieParser	= require('cookie-parser'),
			bodyParser		= require('body-parser'),
			server			= require('http').createServer(app),
			io				= require('socket.io')(server),
			s3cr3t			= "0987654321",
			routes			= require('./scripts/routes.js'),
			database		= require('./scripts/database.js'),
			userDB			= database.userModel;
			roomDB			= database.roomModel;
			lport			= process.env.PORT || 3000;


	var sessionMiddleware = session({

			//Parametres pour sauvegarder la session dans mongo
			store: new MongoStore({mongooseConnection: database.connection }),
			resave: false,
			saveUninitialized: true,
			secret: s3cr3t
		});

//Parametres application
	app.engine('ejs', engine)
		.set('views', path.join(__dirname, 'views'))
		.set('view engine', 'ejs')
		.use(express.static(path.join(__dirname, 'public')))
		.use(bodyParser.urlencoded({extended: true}))
		.use(bodyParser.json())
		.use(sessionMiddleware);

	//Permission CORS
	app.use(function (req, res, next) {

	    //Permission domaine
	    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');

	    // Requetes à authoriser
	    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

	    // Requetes entêtes à authoriser
	    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type', '*');

	    next();
	});

	//Creation de routes
	app.get('/', routes.noLogin, routes.home )
		.get('/signup', routes.noLogin, routes.signup )
		.post('/registering', routes.noLogin, routes.registering )
		.get('/login', routes.noLogin, routes.login )
		.post('/authentification', routes.noLogin, routes.authentification )
		.get('/checkrooms', routes.requireLogin, routes.checkrooms )
		.get('/createroom', routes.requireLogin, routes.createroom )
		.get('/drawingroom/', routes.requireLogin, routes.drawingroom )
		.get('/drawingroom/:roomid', routes.requireLogin, routes.drawingroom )
		.get('/logout', routes.requireLogin, routes.logout )
		.use(function(req, res, next) {
			res.send('<p>404</p>');
		});

	//Middleware pour communication sockets
	io.use(function(socket, next) {
		sessionMiddleware(socket.request, socket.request.res, next);
	});

	//Gestion d'evenement sockets pour l'affichage de salons
	var checkrooms = io.of('/checkrooms').on('connection', function(socket){

				socket.on('requestRooms', function() {
					roomDB.find({}, function(err, exist) {
						if (err)
						{
							console.log("ERROR");
						}
						else {
							socket.emit('getRooms', {rooms: exist });
						}
					});
				});

				socket.on('disconnect', function () {

				});
	});

	//Gestion d'evenement pour le salon de dessin
	var drawingroom = io.of('/drawingroom')
						.on('connection', function (socket) {

				var sess, SES;

				sess = socket.request.session;
				socket.join(sess.room);
				SES = sess.room;
				sess.room = null;
				sess.save();

				//evenement de disconnexion
				socket.on('disconnect', function(){

					roomDB.find({}, function(err, exist) {
						if (err)
						{
							console.log("ERR: "+err);
						}
						if (exist.length)
						{
							exist.forEach(function(elm, idx){
								for(var i = 1; i <= 4; i++)
								{
									if (elm['drawer'+i] == sess.user)
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

				});

				//evenement lors de connexion utilisateurs
				socket.on('requestUsersConnected', function () {
					roomDB.find({roomid: SES}, function(err, exist) {
							if (err)
							{
								console.log('ERROR: '+err);
							}
							if (exist.length && sess.user)
							{
								socket.emit('listUsersConnected', {user1: exist[0].drawer1, user2: exist[0].drawer2, user3: exist[0].drawer3, user4: exist[0].drawer4});
							}
					});
				});

				//evenement lorsqu'un message est envoyé
				socket.on('sendMessage', function (mess) {
					drawingroom.to(SES).emit('newChatMessage', {from: sess.user, message: mess});
				});

				//evenement lorsque un trait est dessiné
				socket.on('updateCanvas', function (cdata) {
					socket.to(SES).emit('syncCanvas', {cr: cdata.pT});
					socket.emit('syncCanvas', {cr: cdata.pT});
				});

				//evenement effaçage de dessin
				socket.on('clear', function () {
					socket.to(SES).emit('clearCanvas', {usr: sess.user});
					socket.emit('clearCanvas', {usr: sess.user});
				});

	});

	//Demarrage de serveur:
	server.listen(lport, function() {
		console.log('Server starting... on '+lport+'.\n');
	});
