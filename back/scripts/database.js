var		mongoose = require('mongoose');

//mongodb://localhost/local
//Parametres de la database
mongoose.connect('mongodb://mongo:27017', {useMongoClient : true});
mongoose.Promise = global.Promise;

//evenements database
var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error!'));
	db.once('open', function() {});

//model user
var userSchema		= new mongoose.Schema({
		username : String,
		password : String,
		roomid : String
});

//model room
var roomSchema		= new mongoose.Schema({
		roomid : String,
		roomname : String,
		drawer1 : String,
		drawer2 : String,
		drawer3 : String,
		drawer4 : String
});

//exports
exports.connection	= db;
exports.userModel	= mongoose.model('users', userSchema);
exports.roomModel	= mongoose.model('rooms', roomSchema);
