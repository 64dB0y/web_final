const express = require("express");
const path = require("path");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

app.use(express.static(path.join(__dirname, 'public')));
app.use('/socket.io', express.static(path.join(__dirname, 'node_modules', 'socket.io', 'client-dist'))); // 추가된 라인

io.on("connection", function(socket){
    let username = null; // 유저명을 저장할 변수 추가

    socket.on("newuser",function(uname){
        username = uname; // 새로운 사용자가 접속하면, 유저명 저장
        socket.broadcast.emit("update", username + " joined the conversation");
    });
    socket.on("exituser",function(){
        socket.broadcast.emit("update", username + " left the conversation");
        username = null; // 유저가 직접 종료를 눌렀다면 유저명 삭제
    });
    socket.on("chat",function(message){
        socket.broadcast.emit("chat", message);
    });

    socket.on("disconnect", function() {
        if (username) { // 유저명이 남아 있다면 (유저가 브라우저를 닫거나 네트워크가 끊겼다면)
            socket.broadcast.emit("update", username + " left the conversation");
        }
    });
});

server.listen(5000);