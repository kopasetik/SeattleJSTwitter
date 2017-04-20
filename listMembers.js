// Initialize the app
var express = require('express');
var app     = express();

// Load ejs views for rendering HTML
app.engine('ejs', require('ejs').renderFile);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Initialize the Twitter client
var Twitter = require('twit');
var config  = require('./config');
var twitter = new Twitter(config);

// add to list
// "id": 842089117546512400, "name": "a-group-of-js-speakers"

function addToList({screen_name}){
	
	// return twitter.post('lists/members/create', {list_id, screen_name})
	return twitter.post('lists/members/create', {list_id: 842089117546512400, screen_name})
}

// Get lists

function getLists(next){
	twitter.get('lists/list', {screen_name: 'kopasetik', count: 200}, (err, data) => {
		if (!err && data){
			return next(null, data)
		}

		return console.error(err)

	})
}
// Get list members

function getMembers(next){
	const isPopular = ({followers_count}) => {
		return followers_count > 500
	}
	const isLocal = ({location}) => {
		return /(seattle|redmond|kirkland|bellevue|vancouver|pnw|bellingham|spokane|sammamish|mercer\sisland|pacific\snorthwest|portland|pdx|tacoma|oregon|bc|british\scolumbia|,\swa)/i.test(location)
	}
	const isInBayArea = ({location}) => {
		return /(san\sfrancisco|oakland|stanford|norcal|northern\scalifornia|bay\sarea|silicon\svalley|the\svalley|san\sjose|cupertino|mountain\sview|menlo\spark|redwood\scity|sunnyvale|santa\sclara|campbell|santa\scruz|los\sgatos|berkeley|east\sbay|soma|mission|castro|fidi|presidio|haight|pleasanton|san\sbruno|san\smateo|alto)/i.test(location)
	}
	const isNonstopAway = ({location}) => {
			return /(los\sangeles|pasadena|denver|san\sdiego|sacramento|fresno|,\s(nv|ut|id|mt|wy))/i.test(location)
	}
	const isJavascripty = ({description}) => {
		return /(js|javascript|es6|es2015|dom|angular|react|vue|ember|async|typescript|bootstrap|material|d3|w3c|webpack|tc39|progressive\sweb\sapp|mozilla|web\sstandards|webvr|web\sperf|chrome|web\sde[vs]|a(ccessibilit|11)y|usability|\bu(ser\se)?x(perience)?|front[-\s]?end|node(\.js)?)/i.test(description)
	}
	// this could be a curried function
	const isMSFT = (boolean) => {
		const msftTest = /(m(icro)?so?ft|edge|vs\scode|visual\sstudio|azure|chakra)/i
		if (boolean) {
			return function ({description, screen_name, location}){
				return (msftTest.test(description) || msftTest.test(screen_name) || msftTest.test(location))
			}
		}
		return function ({description, screen_name, location}){
			return !(msftTest.test(description) || msftTest.test(screen_name) || msftTest.test(location))
		}
	}
	const stripMemberData = ({screen_name, location, followers_count, listed_count, description, id}) => {
		return {screen_name, location, followers_count, listed_count, description, id}
	}
	twitter.get('lists/members', {list_id: 212430249, count: 4000, cursor:-1}, (err, data) => {
		if (!err && data){
			const filteredMembers = data.users.map(stripMemberData)
				.filter(isPopular)
				// .filter(isLocal)
				.filter(isInBayArea)
				//.filter(isNonstopAway)
				.filter(isJavascripty)
				.filter(isMSFT(false))
			console.log(filteredMembers.length)
			return next(null, filteredMembers)
		}

		return console.error(err)

	})
}

// Get the user IDs of 100 friends
function getFriends(next) {
	twitter.get('friends/ids', { screen_name: config.screen_name, count: 100 }, function(err, data) {

		// If we have the IDs, we can look up user information
		if (!err && data) {
			return lookupUsers(data.ids, next);
		}

		// Otherwise, return with error
		// else {
			return next(err);
		// }
	});
}

// Optional - Check to see if the member of code_0x64 list is already a member of speaker list
function isAlreadyInSpeakerList(screen_name, next){

	return console.error(err)
}

// Get user information for the array of user IDs provided
function lookupUsers(user_ids, next) {
	twitter.get('users/lookup', { user_id: user_ids.join() }, function(err, data) {

		// If we have user information, we can pass it along to render
		if (!err && data) {

			// We'll fill this array with the friend data you need
			var friends_array = new Array();

			for (index in data) {

				// Get your friend's join date and do some leading zero magic
				var date = new Date(data[index].created_at);
				var date_str = date.getFullYear() + '-'
							 + ('0' + (date.getMonth()+1)).slice(-2) + '-'
							 + ('0' + date.getDate()).slice(-2);

				// Push the info to an array
				friends_array.push({
					'name'          : data[index].name,
					'screen_name'   : data[index].screen_name,
					'created_at'    : date_str,
					'profile_image' : data[index].profile_image_url,
					'link_color'	: data[index].profile_link_color
				});
			}

			// The callback function defined in the getFriends call
			next(err, friends_array);
		}

		// Otherwise, return with error
		else {
			next(err);
		}
	});
}

// This is the route for our index page
app.get('/', function(req, res){

	// Calling the function defined above to get friend information
	getFriends(function(err, data) {

		// Render the page with our Twitter data
		if (!err && data) {
			res.render('index', { friends: data });
		}

		// Otherwise, render an error page
		else {
			res.send('Something went wrong :(\n'+err.message);
		}
	});
});

app.get('/lists', (req, res) => {
function belongsToKopasetik({user: {screen_name}}){
	return screen_name === 'kopasetik'
}

	getLists((err, data) => {
		if (!err && data) {
			res.send(data.filter(belongsToKopasetik) );
		}

		// Otherwise, render an error page
		else {
			res.send('Something went wrong :(\n'+err.message);
		}
	})
})

app.get('/members', (req, res) => {


	getMembers((err, data) => {
		if (!err && data) {

			res.send(data );
		}

		// Otherwise, render an error page
		else {
			res.send('Something went wrong :(\n'+err.message);
		}
	})
})

app.get('/speakers/add', (req, res) => {
	getMembers((e, d) =>{
		if (!e && d){
			return Promise.all(d.map(addToList)).then(addedMembers => {
				console.log('added!')
				res.send(d)
			})
		}
		return res.send('Something went wrong :(\n'+e.message)
	})
})



// Start the server
var server = app.listen(3000, function() {
  console.log('Listening on port %d', server.address().port);
});