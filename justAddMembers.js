// Initialize the app
var express = require('express');
var app     = express();

// Initialize the Twitter client
var Twitter = require('twit');
var config  = require('./config');
var twitter = new Twitter(config);

// Predicates
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
	// return id
}
// Optional - Check to see if the member of code_0x64 list is already a member of speaker list
function isAlreadyInSpeakerList(screen_name, next){
	// ...
	return console.error(err)
}

// Segmentation of members
function pSegment(arr, maxLength){
  var segmented = []
  for (var counter = 0; counter * maxLength < arr.length; counter++){
    if(maxLength > arr.length){
      segmented.push(arr.slice(counter * maxLength, arr.length))
      } else {
      segmented.push(arr.slice(counter * maxLength, (counter + 1) * maxLength))
      }
  }
  
  return segmented
}

// // Get list members
twitter.get('lists/members', {list_id: 212430249, count: 4000, cursor:-1})
	.then(({data}) => {
			const filteredMembers = data.users
				.map(stripMemberData)
				.filter(isPopular)
				// .filter(isLocal)
				.filter(isInBayArea)
				//.filter(isNonstopAway)
				.filter(isJavascripty)
				.filter(isMSFT(false))
				.map(({id}) => id)
			console.log(filteredMembers)

			const segmentedMembers = pSegment(filteredMembers, 100)
				.map(el => el.join(','))
			console.log(segmentedMembers.length)

			return Promise.all(segmentedMembers.map(addToList))
	})
	.then(addedMembers => {
		console.log(addedMembers[0].data)
		console.log('added!')
	})
	.catch(pErr => {
		console.error('error ' + pErr)
	})

// Step 2
// add to list
// "id": 842089117546512400, "name": "a-group-of-js-speakers"

function addToList(id){
	console.log(id)
	return twitter.post('lists/members/create_all', {slug: 'a-group-of-js-speakers', owner_id: '8987572', user_id: id})
}

// twitter.post('lists/members/create', {list_id: '842089117546512400', user_id: '4874452334'})
// twitter.post('lists/members/create_all', {slug: 'a-group-of-js-speakers', owner_id: '8987572', user_id: '4874452334'})
// 	.then(({data}) => console.log(data))
