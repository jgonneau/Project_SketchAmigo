var		mongoose = require('mongoose');

//mongodb://localhost/local
mongoose.connect('mongodb://mongo:27017', {useMongoClient : true});
mongoose.Promise = global.Promise;

var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error!'));
	db.once('open', function() {});

var userSchema		= new mongoose.Schema({
		username : String,
		password : String,
		roomid : String
});

var roomSchema		= new mongoose.Schema({
		roomid : String,
		roomname : String,
		drawer1 : String,
		drawer2 : String,
		drawer3 : String,
		drawer4 : String
});

exports.connection	= db;
exports.userModel	= mongoose.model('users', userSchema);
exports.roomModel	= mongoose.model('rooms', roomSchema);
