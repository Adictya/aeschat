const express = require("express");
const socket = require("socket.io");
const forge = require("node-forge");
const fs = require('fs');
const util = require("./utils/primitive-root");

const app = express();
const server = app.listen(3300, () => {
	console.log("Listening at port 3300");
});

// Static files
app.use(express.static("public"));

// Socket setup
const io = socket(server);

function Readfile (ffile)
{
	var fcontents;
	fs.readFile(ffile,'utf8',function(err,contents){
		console.log("file contents are" , contents);
	});
	console.log("File Contents in function",fcontents);
}

io.on("connection", socket => {
	console.log("Conn. established");
	console.log("Socket", socket.id);

	let q, p;
	const bits = 8;
	const a = Math.floor(Math.random() * 9) + 1;
	console.log("a", a);
	// Generate p and q
	[p, q] = util.genPrimes();

	// 1.) Send p & q to client
	socket.on("request", data => {
		console.log("q", q, "p", p);
		socket.emit("request", {
			q: q,
			p: p
		});
	});

	// 3.) Exchange A & B
	socket.on("exchange", data => {
		console.log("B:", data);
		const B = data;
		// 2.) Calculate A = q^a mod p
		const A = Math.pow(q, a) % p;
		// Calculate K(a) = B^a mod p
		const K_a = Math.pow(B, a) % p;
		// Send A and K_a to client
		socket.emit("exchange", {
			K_a: K_a,
			A: A
		});
	});
	
	socket.on("readfile", file => {
		io.sockets.emit("fileread",{fcontents : fs.readFileSync(file.file,'utf8')})
	});
	// Handle chat event
	socket.on("chat", data => {
		io.sockets.emit("chat", data);
	});

	// Handle typing event
	socket.on("typing", data => {
		socket.broadcast.emit("typing", data);
	});
});
