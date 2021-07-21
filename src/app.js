var express = require("express");
var server = express();
// var bodyParser = require("body-parser");

var model = {};

server.use(express.json());

model.clients = {};

model.reset = function(){
    model.clients = {};
}

model.addAppointment = function(param, cita){
    cita = Object.assign(cita, {status: "pending"})

    if(!model.clients.hasOwnProperty(param)){
        model.clients[param] = [];
    }
        model.clients[param].push(cita)
}

model.attend = function(name, cita){
   let found = model.clients[name].find(n =>{
       return n.date === cita
    })
    found.status = "attended"
    return found;
}

model.expire = function(name, cita){
    let found = model.clients[name].find(n =>{
       return n.date === cita
    })
    found.status = "expired"
    return found;
}

model.cancel = function(name, cita){
    let found = model.clients[name].find(n =>{
       return n.date === cita
    })
    found.status = "cancelled"
    return found;
}

model.erase = function(name, cita){
    if(cita){
    if(typeof parseInt(cita[0]) === "number"){
        model.clients[name] = model.clients[name].filter(n => {
                 return n.date !== cita
            }) 
        }
        model.clients[name] = model.clients[name].filter(s => {
            return s.status !== cita
        })
    }
}

model.getAppointments = function(name, status){
   if(status){
     var citas = model.clients[name].filter(s => {
          return s.status === status
       })
       return citas;
   }
   return model.clients[name]
}

model.getClients = function(){
    return Object.keys(model.clients)
}


server.get("/api", (req, res) => {
    res.json(model.clients)
})

server.post("/api/Appointments", (req, res) => {
    const {client, appointment} = req.body;
    if(!client){
        res.status(400).send("the body must have a client property")
    }
    if(typeof client !== "string"){
        res.status(400).send("client must be a string")
    }
    
    model.addAppointment(client, appointment)
    return res.json(appointment)
})

server.get("/api/Appointments/clients", function(req, res){
    const clients = model.getClients()
    return res.json(clients)
})


server.get("/api/Appointments/:name", (req, res) => {
    const {name} = req.params;
    const {date, option} = req.query;
    
    if(!model.clients.hasOwnProperty(name)){
        return res.status(400).send("the client does not exist")
    }
    let founded = model.clients[name].find(d => {
        return d.date === date
    })
    if(!founded){
        return res.status(400).send("the client does not have a appointment for that date")
    }

    if(option !== "attend" && option !== "expire" && option !== "cancel"){
        return res.status(400).send("the option must be attend, expire or cancel")
    }
    if(option === "attend"){
        var result = model.attend(name, date)
      return res.json(result)
    }
    if(option === "expire"){
      var result = model.expire(name, date)
      return res.json(result)
    }
    if(option === "cancel"){
      var result = model.cancel(name, date)
      return res.json(result)
    }
})


server.get("/api/Appointments/:name/erase", function(req, res){
    const {name} = req.params
    const {date} = req.query
    let borrados
    if(!model.clients.hasOwnProperty(name)){
        return res.status(400).send("the client does not exist")
    }
    let muestra = model.getAppointments(name, date)
    borrados = muestra.filter(s => s.status == date)
    model.erase(name, date)
    return res.json(borrados)
})

server.get("/api/Appointments/getAppointments/:name", function(req, res){
    const {name} = req.params;
    if(model.clients.hasOwnProperty(name)){
       var appoints = model.getAppointments(name)
        res.json(appoints)
    } 
})


server.listen(3003);
module.exports = { model, server };
