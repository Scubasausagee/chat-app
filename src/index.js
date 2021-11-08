const express=require('express')
const path=require('path')

const port=process.env.PORT
const app=express()

const PublicDirrPath = path.join(__dirname, '../public')
app.use(express.static(PublicDirrPath))

app.get('',(req,res)=>{
    res.render('index')
})

app.listen(port,()=>{
    console.log('Server up on port '+port)
})