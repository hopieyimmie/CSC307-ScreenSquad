const express = require('express');
const bodyParser = require("body-parser");
const session = require("express-session");
const app = express();
const port = 8000;
const cors = require('cors');
const userServices = require('./models/user-services')
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: "mysecretkey",
  resave: false,
  saveUninitialized: true,
  cookie : {secure: false}
}));

var currentUser;

app.use(express.json());

app.use(cors());

app.get('/', (req, res) => {
    if (currentUser) {
        res.send(`Welcome, ${currentUser.name}!`);
    } else {
        res.send("You are not logged in.");
    }
    //res.send('Hello World!');
});


app.get('/users', async (req, res) => {
    try{
        const result = await userServices.getAllUsers();
        res.send({users_list: result});
    } catch(error){
        console.log(error);
        res.status(500).send('An error occurred in the server.');
    }
    /*
    if (name != undefined && job != undefined){
        let result = findUserByName(name);
        let i = 0;
        for(i = 0; i < result.length; i++){
            if(result[i].job == job){
                result = {users_list: result[i]};
                res.send(result);
                break;
            }
        }
        if(i == result.length){
            res.send(users);
        }
    }
    else{
        res.send(users);
    }
    */
});


/*
app.get('/users/:id', async (req, res) => {
    const id = req.params['id']; //or req.params.id
    let result = await userServices.findUserById(id);
    if (result === undefined || result === null || result.length == 0)
        res.status(404).send('Resource not found.');
    else {
        res.send({users_list: result});
    }
});
*/

app.get('/users/:item', async (req, res) => {
    const item = req.params['item']; //or req.params.id
    let result;
    if(item.indexOf('@') == -1){
        result = await userServices.findUserById(item);
    }
    else{
        result = await userServices.findUserByEmail(item);
    }
    
    
    
    if (result === undefined || result === null || result.length == 0)
        res.status(204).json({ message: 'Resource not found.'});
        
    else {
        res.status(200).json(result[0]);
        
        
    }
    return result;
    
});

app.put('/users/:_id', async (req, res) => {
    const id = req.params['_id']; //or req.params.id
    console.log(req.body);
    let result = await userServices.editUser(id, req.body);
    
    if (result === undefined || result === null || result.length == 0)
        res.status(204).json({ message: 'Resource not found.'});
        
    else {
        res.status(200).json(result[0]);
        
        
    }
    return result;
    
});

/* Log-in User*/
app.post('/login', async (req, res) => {
    const userToAdd = req.body;
    const savedUserMessage = await userServices.loginUser(userToAdd.email, userToAdd.password);
    
    if(savedUserMessage == 'Login successful'){
        let foundUser = await userServices.findUserByEmail(userToAdd.email);
        currentUser = foundUser[0];
        res.status(200).json({ message: savedUserMessage });
    }
    else if(savedUserMessage == 'Invalid email or password'){
        res.status(401).json({ message: savedUserMessage });
    }
    else{
        res.status(500).json({ message: savedUserMessage });
    }
    
});

/* Register User*/
app.post('/register', async (req, res) => {
    const userToAdd = req.body;
    const savedUserMessage = await userServices.addUser(userToAdd);
    if(savedUserMessage == 'User registered successfully'){
        res.status(201).json({ message: savedUserMessage });
    }
    else if(savedUserMessage == 'User already exists'){
        res.status(400).json({ message: savedUserMessage });
    }
    else{
        res.status(500).json({ message: savedUserMessage });
    }
    
});

/* Register User*/
app.post('/logout', async (req, res) => {
    currentUser = null;
    res.status(201).json({ message: 'User logged out successfully' });
    
});

/*
app.post('/users', async (req, res) => {
    const userToAdd = req.body;
    const savedUser = await userServices.addUser(userToAdd);
    if(savedUser){
        res.status(201).send(userToAdd);
    }
    else{
        res.status(500).end()
    }
    
});
*/




app.delete('/users/:id', async (req, res) => {
    let deletedUser = await userServices.removeUser(req.params.id);
    if (!deletedUser){
        res.status(404).send('Resource not found.');
        
    }
    else{
        res.status(204).send(deletedUser);
    }
    
    
});


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});

/*
function findUserIndex(id){
    const requiredIndex = users['users_list'].findIndex(character => {
        return character.id === String(id);
    });
    return requiredIndex;
}

function generateID() {
    let length = 6;
    let result = '';
    const characters = 'abcdefghijklmnopqrstuvwxyz';
    const charactersLength = characters.length;
    const numbers = '0123456789';
    const numbersLength = numbers.length;
    let numbersStr = '';
    for(let i = 0; i < 3; i++){
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        numbersStr += numbers.charAt(Math.floor(Math.random() * numbersLength));
    }
    return result + numbersStr;
}

function addUser(user){
    users['users_list'].push(user);
}
const findUserByName = (name) => { 
    return users['users_list'].filter( (user) => user['name'] === name); 
}
function findUserById(id) {
    return users['users_list'].find( (user) => user['id'] === id); // or line below
    //return users['users_list'].filter( (user) => user['id'] === id);
}

*/