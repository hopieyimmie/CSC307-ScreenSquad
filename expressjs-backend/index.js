const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();
const cors = require('cors');
const userServices = require('./controllers/user-services');
const movieReviewServices = require('./controllers/movie-review-services');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'mysecretkey',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

var currentUser;

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  if (currentUser) {
    res.send(`Welcome, ${currentUser.name}!`);
  } else {
    res.send('You are not logged in.');
  }
});

app.get('/users', async (req, res) => {
  try {
    const result = await userServices.getAllUsers();
    res.send({ users_list: result });
  } catch (error) {
    console.log(error);
    res.status(500).send('An error occurred on the server.');
  }
});

app.get('/users/:item', async (req, res) => {
  const item = req.params['item'];

  let result;
  if (item.indexOf('@') === -1) {
    result = await userServices.findUserById(item);
  } else {
    result = await userServices.findUserByEmail(item);
  }

  if (result === undefined || result === null || result.length === 0) {
    res.status(204).json({ message: 'Resource not found.' });
  } else {
    res.status(200).json(result[0]);
  }
});

app.put('/users/:_id', async (req, res) => {
  const id = req.params['_id'];
  console.log(req.body);
  let result = await userServices.editUser(id, req.body);

  if (result === undefined || result === null || result.length === 0) {
    res.status(204).json({ message: 'Resource not found.' });
  } else {
    res.status(200).json(result[0]);
  }
});

app.post('/login', async (req, res) => {
  const userToAdd = req.body;
  const savedUserMessage = await userServices.loginUser(userToAdd.email, userToAdd.password);

  if (savedUserMessage === 'Login successful') {
    let foundUser = await userServices.findUserByEmail(userToAdd.email);
    currentUser = foundUser[0];
    res.status(200).json({ message: savedUserMessage });
  } else if (savedUserMessage === 'Invalid email or password') {
    res.status(401).json({ message: savedUserMessage });
  } else {
    res.status(500).json({ message: savedUserMessage });
  }
});

app.post('/register', async (req, res) => {
  const userToAdd = req.body;
  const savedUserMessage = await userServices.addUser(userToAdd);

  if (savedUserMessage === 'User registered successfully') {
    res.status(201).json({ message: savedUserMessage });
  } else if (savedUserMessage === 'User already exists') {
    res.status(400).json({ message: savedUserMessage });
  } else {
    res.status(500).json({ message: savedUserMessage });
  }
});

app.post('/logout', async (req, res) => {
  currentUser = null;
  res.status(201).json({ message: 'User logged out successfully' });
});

app.get('/reviews/:movieId', async (req, res) => {
  const movieId = req.params['movieId'];

  try {
    const reviews = await movieReviewServices.getReviews(movieId);
    res.json({ reviews });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'An error occurred on the server.' });
  }
});

app.post('/reviews', async (req, res) => {
  const review = req.body;

  try {
    const result = await movieReviewServices.addReview(review);
    res.json({ message: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(process.env.PORT || port, () => {
  console.log("REST API is listening.");
});