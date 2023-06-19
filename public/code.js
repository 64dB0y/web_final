(function(){
    const app = document.querySelector(".app");
    const socket = io();
    let uname;
    let lastUser = null;
    let lastMinute = null;

    function getDate() {
        const date = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
        return new Intl.DateTimeFormat('ko-KR', options).format(date);
    }

    function getTime() {
        const date = new Date();
        const options = { hour: '2-digit', minute: '2-digit' };
        return new Intl.DateTimeFormat('ko-KR', options).format(date);
    }

    function renderMessage(type, message, username = uname) {
        const messageContainer = app.querySelector(".chat-screen .messages");
        const messageEl = document.createElement("div");
        const currentTime = new Date();
        let time = '';
    
        const oldScrollPos = messageContainer.scrollTop;
    
        if (lastUser !== username || lastMinute !== currentTime.getMinutes()) {
            time = `(${getTime()})`;
            lastMinute = currentTime.getMinutes();
        }
        
        lastUser = username;
    
        if(type === "my" || type === "other"){
            messageEl.setAttribute("class", `message ${type}-message`);
            messageEl.innerHTML = `
                <div class="message-box">
                    <div class="name">${username === uname ? 'You' : username}</div>
                    <div class="text">${message}</div>
                </div>
                <div class="time">${time}</div>
            `;
        } else if(type === "update"){
            messageEl.setAttribute("class", "update");
            messageEl.innerHTML = `${message}`;
        }
    
        messageContainer.appendChild(messageEl);
    
        // If the message is from the user, scroll to the bottom
        if (username === uname) {
            messageContainer.scrollTop = messageContainer.scrollHeight;
        } else {
            // Otherwise, restore the old scroll position
            messageContainer.scrollTop = oldScrollPos;
        }
    }
    
    // join date is rendered once here
    renderMessage("update", `${getDate()}`);

    app.querySelector(".join-screen #username").addEventListener("keypress", function(event){
        if(event.key === "Enter"){
            let username = app.querySelector(".join-screen #username").value;
            if(username.length == 0){
                return;
            }
            socket.emit("newuser", username);
            uname = username;
            renderMessage("update", `${uname} joined the conversation`);
            app.querySelector(".join-screen").classList.remove("active");
            app.querySelector(".chat-screen").classList.add("active");
        }
    }); 

    app.querySelector(".join-screen #join-user").addEventListener("click", function(event){
        let username = app.querySelector(".join-screen #username").value;
        if(username.length == 0){
            return;
        }
        socket.emit("newuser", username);
        uname = username;
        renderMessage("update", `${uname} joined the conversation`);
        app.querySelector(".join-screen").classList.remove("active");
        app.querySelector(".chat-screen").classList.add("active");
    });

    app.querySelector(".chat-screen #message-input").addEventListener("keypress", function(event){
        if(event.key === "Enter"){
            let message = app.querySelector(".chat-screen #message-input").value;
            if(message.length == 0){
                return;
            }
            renderMessage("my", message);
            socket.emit("chat", {
                username: uname,
                text: message
            });
            app.querySelector(".chat-screen #message-input").value = "";
        }
    });

    app.querySelector(".chat-screen #exit-chat").addEventListener("click", function(){
        socket.emit("exituser", uname);  // Add username
        window.location.href = window.location.href;
    });    

    socket.on("update", function(update){
        renderMessage("update" ,update);
    });

    socket.on("chat", function(message){
        renderMessage("other", message.text, message.username);
    });
})();
