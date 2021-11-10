const express=require('express')
const http=require('http')
const path=require('path')
const socketio=require('socket.io')
const Filter=require('bad-words')
const {generateMessage,generateLocationMesaage}=require('./utils/messages')
const {addUser,removeUser,getUser,getUsersInRoom}=require('./utils/users')

const port=process.env.PORT
const app=express()
const server=http.createServer(app)
const io=socketio(server)

const PublicDirrPath = path.join(__dirname, '../public')
app.use(express.static(PublicDirrPath))

io.on('connection',(socket)=>{
    console.log('New WebSocket connection')

    socket.on('join',({username,room},callback)=>{
        const {error,user}=addUser({id:socket.id,username,room})
        
        if(error){
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Admin',"Welcome!"))
        socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined`))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on('SendMessage', (msg,callback) => {
        const filter=new Filter()

        if(filter.isProfane(msg)){
            return callback('Profanity is not allowed')
        }

        const user=getUser(socket.id)

        io.to(user.room).emit("message", generateMessage(user.username,msg))
        callback()
    })

    socket.on('sendLocation',(obj,callback)=>{
        const user=getUser(socket.id)
        io.to(user.room).emit('LocationMessage',generateLocationMesaage(user.username,`https://google.com/maps?q=${obj.latitude},${obj.longitude}`))
        callback()
    })

    socket.on('disconnect',()=>{
        const user=removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message', generateMessage('Admin',`${user.username} has left`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port,()=>{
    console.log('Server up on port '+port)
})