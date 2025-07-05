import {WebSocket,WebSocketServer} from "ws";

const wss = new WebSocketServer({port:5050});


interface User{
    socket:WebSocket,
    room:string,
    name:string
}


let allSockets:User[] = [];


wss.on("connection",(socket)=>{
    socket.on("message",(message)=>{
        const parsedMessage = JSON.parse(message.toString());
        
        if(parsedMessage.type === "join")
        {
            allSockets.push({
                socket,
                room:parsedMessage.payload.roomId,
                name:parsedMessage.payload.name,  
            });
        }
        if(parsedMessage.type === "chat")
        {
            const currentUserRoom = allSockets.find((x)=> x.socket === socket);

            if(currentUserRoom)
            {
                allSockets.forEach((user)=>{
                    if(user.room === currentUserRoom.room)
                    {
                        try{
                            user.socket.send(
                                JSON.stringify({
                                    type:"chat",
                                    payload:parsedMessage.payload
                                })
                            );
                        }
                        catch(err){
                            console.log("Failed to send message",err);
                        }
                    }
                });
            }
        }
    });
    socket.on("close",()=>{
        allSockets  = allSockets.filter((user)=> user.socket !== socket);
    })
})



