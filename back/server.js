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
		asecret			= "0987654321",
		routes			= require('./scripts/routes.js'),
		database		= require('./scripts/database.js'),
		userDB			= database.userModel;
		roomDB			= database.roomModel;
		lport			= process.env.PORT || 3000;
		
		
	var sessionMiddleware = session({
			
			store: new MongoStore({mongooseConnection: database.connection }),
			resave: false,
			saveUninitialized: true,
			secret: asecret
		});
		
	app.engine('ejs', engine)
		.set('views', path.join(__dirname, 'views'))
		.set('view engine', 'ejs')
		.use(express.static(path.join(__dirname, 'public')))
		.use(bodyParser.urlencoded({extended: true}))
		.use(sessionMiddleware);

	app	.get('/', routes.noLogin, routes.home )
		.get('/signup', routes.noLogin, routes.signup )
		.post('/registering', routes.noLogin, routes.registering )
		.get('/login', routes.noLogin, routes.login )
		.post('/authentification', routes.noLogin, routes.authentification )
		.get('/checkrooms', routes.requireLogin, routes.checkrooms )
		.get('/createroom', routes.requireLogin, routes.createroom )
		.get('/drawingroom/', routes.requireLogin, routes.drawingroom )
		.get('/drawingroom/:roomid', routes.requireLogin, routes.drawingroom )
		.get('/logout', routes.requireLogin, routes.logout )
		.get('/serge', routes.serge )
		.get('/w', routes.noLogin, function (req, res) {
				res.send('Oi:'+req.session.user);
			})
		.use(function(req, res, next) {
			res.send('<p>404</p>');
		});
		
	io.use(function(socket, next) {
		sessionMiddleware(socket.request, socket.request.res, next);
	});	

	var checkrooms = io.of('/checkrooms').on('connection', function(socket){
				
				socket.on('requestRooms', function() {
					roomDB.find({}, function(err, exist) {
						if (err)
						{
							console.log("ERR");
						}
						else {
							socket.emit('getRooms', {rooms: exist });
						}
					});
				});
				
				socket.on('disconnect', function () {
					
				});
	});
	
	var drawingroom = io.of('/drawingroom')
						.on('connection', function (socket) {
							
				var sess, SES;
							
				sess = socket.request.session;
				socket.join(sess.room);
				SES = sess.room;
				sess.room = null;
				sess.save();
							
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
				
				socket.on('sendMessage', function (mess) {
					drawingroom.to(SES).emit('newChatMessage', {from: sess.user, message: mess});
				});
				
				socket.on('updateCanvas', function (cdata) {
					socket.to(SES).emit('syncCanvas', {cr: cdata.pT});
					socket.emit('syncCanvas', {cr: cdata.pT});
				});
				
				socket.on('clear', function () {
					socket.to(SES).emit('clearCanvas', {usr: sess.user});
					socket.emit('clearCanvas', {usr: sess.user});
				});
			
	});
		
	server.listen(lport, function() {
		console.log('Server starting... on '+lport+'.\n');
	});
