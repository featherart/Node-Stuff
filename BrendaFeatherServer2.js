var http = require('http'),
    url = require('url'),
    fs = require('fs'),
    qs = require('querystring');

var header ='<!doctype html><html><head><title>Give us your stuff</title></head><body><div class="header"><h1>Give us your stuff</h1>';
var goBack ='<a href="/">Go Back Home</a>';
var footer ='</body>';

http.createServer(function (request,response) {
    console.log('server running');
	var path = url.parse(request.url).pathname;
	var body = makeBody(path, querystring);
    var querystring = url.parse(request.url, true).query;  //return an object from a querystring with raw name-value pairs.
    response.writeHead(200, {
    	'Content-Length': body.length,
	    'Content-Type': 'text/html' });
    response.end(body);
    request.form = '';
	request.addListener('data', function(chunk) {
        //handle a chunk of data, passed in as a buffer.
        //Buffers are easily transformed to strings.
        request.form += chunk.toString();
    });

    //This event is emitted when we reach the end of the request body.
    //In some cases, we might never reach the end, because the connection is prematurely closed. We want to check for that.
    request.addListener('end', function() {

        if (request.method == 'POST') {
            request.form = qs.parse(request.form);
            var appendData = '{name: \'' + request.form.name + '\', email: ' + request.form.email + ', dessert: ' + request.form.dessert + '} \n';
            fs.appendFile('stuff.txt', appendData, 'utf8', function(err) {
            	if(err) throw err;
            	console.log('The data to append was appended to the file');
	        });
	        console.log(request.form.name);
	        console.log(typeof request.form.name);
	        var username = request.form.name;
	        var newPath = '/submit?name=' + username;
	        var body = makeBody(newPath, username);
        }
        //Request exists in a higher "scope" than this listener callback.
        //thus, we can use this property to indicate a "state". If we've "ended", it will be true. Otherwise, undefined.
        //This is useful in case a "close" event fires before "end".
        request.ended = true;
    });

    //This event is emitted when the connection is closed.
    request.addListener('close', function() {
        //Checking for an edge case, in this case, we didn't get the entire message.
        if (!request.ended) {
            //Request died midway through. Throw an error.
            request.terminated = true;
            return;
        }
    });
}).listen(process.env.PORT || 8124);

function makeBody(path, querystring) {
    var body = header;
    var name = querystring || 'lady';

	switch (path) {
		case '/submit':
			body += "Hello, " + name + "!";
	  		break;

		default:
			body += '<form method="POST" action="submit"><label>Name</label><input type="text" name="name"></input><label>Email</label><input type="text" name="email"></input><label>Dessert</label><input type="text" name="dessert"></input><input type="submit" name="submit"></submit></form>';		    
	}

    body += footer;
    return body;
};