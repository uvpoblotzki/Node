var sys = require("sys");
var http = require("http");
var parseQueryString = require("querystring").parse;
var Db = require('mongodb').Db,
  Connection = require('mongodb').Connection,
  Server = require('mongodb').Server,
  // BSON = require('../lib/mongodb').BSONPure;
  BSON = require('mongodb').BSONNative;

var host = process.env['MONGO_NODE_DRIVER_HOST'] != null ? process.env['MONGO_NODE_DRIVER_HOST'] : 'localhost';
var port = process.env['MONGO_NODE_DRIVER_PORT'] != null ? process.env['MONGO_NODE_DRIVER_PORT'] : Connection.DEFAULT_PORT;

sys.puts("Connecting to " + host + ":" + port);

var db = new Db('node-mongo-examples', new Server(host, port, {}), {native_parser:true});

sys.log("Opening db: " + db);
db.open(function (err, db) {
  http.createServer(function(req, res) {
    if (req.method == "GET") {
      // List Todos
      db.collection("todos", function (err, collection) {
        sys.log("Getting collection 'todos': " + collection);
        collection.find(function (err, cursor) {
          sys.log("Reading all todos: " + cursor);
          var isFirst = true;
          cursor.each(function(err,todo) {
            if (isFirst) {
              isFirst = false;
              res.writeHeader(200, {"Content-Type" : "text/html;charset=UTF-8"});
              res.write("<http><head><title>ToDos</title></head><body>");
              res.write("<h2>ToDos</h2>");
              res.write('<table width="60%" border="1">');
            }
            if (todo != null) {
              sys.log("Got todo: " + todo._id + ", " + todo.title);
              res.write('<tr valign="top">');
              res.write('<td width="10%">' + todo.title + "</td><td>" + todo.description + "</td>");
              res.write('<td width="10%"><form method="post"><input type="hidden" name="_method" value="delete"></input><input type="hidden" name="id" value="'+todo._id+'"></input><input name="delete" value="delete" type="submit"></input></form></td>');
              res.write("</tr>");
            } else {
              res.write('<tr valign="top">');
              res.write('<form method="post">');
              res.write('<td><input name="title"></input></td>');
              res.write('<td><textarea cols="50" rows="2" name="description"></textarea></td>');
              res.write('<td><input type="submit" name="add" value="add"></input></td>');
              res.write('</form>');
              res.write("</tr>");
              res.write("</table>");
              res.end("</body></html>");
            }
          });
        });
      });
    } else if (req.method == "POST") {
      // Add Todo
      sys.log('Adding Todo');
      req.on('data', function(chunk) {
        sys.log("Got data: '" + chunk + "'");
        var parameter = parseQueryString(chunk.toString());
        sys.log("Got parameter: " + sys.inspect(parameter));
        if (parameter._method != "delete") {
          if (parameter.title) {
            db.collection("todos", function (err, collection) {
              sys.log("Getting collection 'todos': " + collection);
              collection.insert({"title" : parameter.title, "description" : parameter.description}, function (err, docs) {
                sys.log("Inserted todo: " + sys.inspect(docs));
                res.writeHeader(303, {"Location" : "/"});
                res.end();
              });
            });
          } else {
            res.writeHeader(303, {"Location" : "/"});
            res.end();
          }
        } else {
          sys.log("Deleting ID: " + parameter.id);
          db.collection("todos", function (err, collection) {
            collection.remove({"_id": BSON.ObjectID.createFromHexString(parameter.id)}, function(err, doc) {
              sys.log("Deleted Todo: " + parameter.id);
              res.writeHeader(303, {"Location" : "/"});
              res.end();
            });
          });
        }
      }); 
    }
  }).listen(8124);
  console.log("Server running at http://localhost:8124/");
});

