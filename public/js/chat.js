const socket=io()

//Elements
const $messageForm=document.querySelector('#message-form')
const $messageFormInput=$messageForm.querySelector('input')
const $messageFormButton=$messageForm.querySelector('button')
const $locationButton=document.querySelector('#send-location')
const $messages=document.querySelector('#messages')

//Templates
const messageTemplate=document.querySelector('#message-template').innerHTML
const locationTemplate=document.querySelector('#location-template').innerHTML
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML

//Options
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoscroll=()=>{
    //New messsage element
    const $newMessage=$messages.lastElementChild

    //Height of new message
    const newMessageStyles=getComputedStyle($newMessage)
    const newMessageMargin=parseInt(newMessageStyles.marginBottom)
    const newMessageHeight=$newMessage.offsetHeight +newMessageMargin

    //Visble height
    const visibleHeight=$messages.offsetHeight

    //Height of messages container
    const containerHeight=$messages.scrollHeight

    //How far is scrolled
    const scrollOfset=$messages.scrollTop + visibleHeight

    if(containerHeight-newMessageHeight <= scrollOfset){
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (res) => {
    const html=Mustache.render(messageTemplate,{
        username: res.username,
        message:res.text,
        createdAt:moment(res.createdAt).format('H:mm')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('LocationMessage',(res)=>{
    console.log(res)
    const html=Mustache.render(locationTemplate,{
        username: res.username,
        url:res.url,
        createdAt:moment(res.createdAt).format('H:mm')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled')

    const textInput = e.target.elements.message.value

    socket.emit("SendMessage",textInput,(error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()

        if(error){
            return console.log(error)
        }

        console.log('Message delivered')
    })
})

$locationButton.addEventListener('click',()=>{

    $locationButton.setAttribute('disabled','disabled')

    if(!navigator.geolocation){
        $locationButton.removeAttribute('disabled')
        return alert('Geolocation is not supported by your browser')
    }

    navigator.geolocation.getCurrentPosition((position)=>{

        socket.emit('sendLocation',{longitude: position.coords.longitude, latitude: position.coords.latitude},(error)=>{
            $locationButton.removeAttribute('disabled')
            if(error){
                return console.log(error)
            }

            console.log('Location shared!')
        })
    })
})

socket.on('roomData',({room,users})=>{
    const html=Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html
})

socket.emit('join',{username , room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})