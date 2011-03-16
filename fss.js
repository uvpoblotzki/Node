var http = require('http'), 
    fs = require('fs'), 
    util = require('util'), 
    url = require('url');


http.createServer(function (req, res) {
  var path = url.parse(req.url).pathname.replace(/^\//, '');
  util.log('requested path: ' + path);
  fs.readFile(path, function(err, data) {
    if (err) {
      res.writeHeader(404, {'Content-Type': 'text/plain'});
      res.end('File ' + path + ' not found.');
      util.log('File ' + path + ' not found.');
    } else {
      res.writeHeader(200, {'Content-Type': 'text/plain'});
      res.end(data);
    }
  }); 
}).listen(8124);
util.log('Server started on http://localhost:8124');
