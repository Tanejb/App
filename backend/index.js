const express = require('express');
const path = require('path');
require('dotenv').config();


const app = express();
const bodyParser = require('body-parser');
const firebaseAdmin = require('firebase-admin');
const session = require('express-session');
const PORT = process.env.PORT || 3000;
const http = require('http');
const server = http.createServer(app);
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');
const io = socketio(server);
const {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} = require('firebase/auth');
const { initializeApp } = require('firebase/app');
const {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  addDoc,
  setDoc,
} = require('firebase/firestore');
const firebaseConfig = require('./firebaseConfig');

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);


const botName = 'Admin ';
// Run when client connects
io.on('connection', (socket) => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);
    // Welcome current user
    socket.emit('message', formatMessage(botName, ' Welcome to Chat'));

    // Broadcast when user connects
    socket.broadcast
      .to(user.room)
      .emit('message', formatMessage(botName, `${user.username}  has joined the chat`));

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // Listen for ChatMessage
  socket.on('chatMessage', (msg) => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

// Firebase Admin configuration
const serviceAccount = require('../backend/serviceAccountKey.json');

app.use(
  session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Uporabite true za HTTPS
  })
);
app.use(express.static(path.join(__dirname, '../frontend/public')));
app.set('views', path.join(__dirname, '../frontend/views'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});
app.set('view engine', 'ejs');

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
});

app.get('/', (req, res) => {
  res.render('index');
});
app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/chatroom', (req, res) => {
  res.render('chatroom');
});

app.get('/chat', (req, res) => {
  res.render('chat');
});

app.get('/profile', (req, res) => {
  res.render('profile');
});

app.post('/submit-register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send('Email and password are required');
  }

  try {
    const userRecord = await firebaseAdmin.auth().createUser({
      email: email,
      password: password,
    });

    // Add user to Firestore
    await addDoc(collection(db, 'users'), {
      uid: userRecord.uid,
      email: userRecord.email,
      createdAt: new Date(),
    });

    res.redirect('/login'); // Redirect to home or another page after registration
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send('Error registering user');
  }
  /*try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Add user to Firestore
    await addDoc(collection(db, 'users'), {
      uid: user.uid,
      email: user.email,
      createdAt: new Date(),
    });

    res.redirect('/'); // Redirect to home or another page after registration
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send('Error registering user');
  } */
});

app.post('/submit-login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send('Email and password are required');
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Optionally, you can add any additional login logic here, such as
    // creating a session or redirecting to a specific page.
    req.session.user = { email: user.email, uid: user.uid };
    console.log('Session set:', req.session.user);
    res.redirect('/'); // Redirect to home or another page after login
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(401).send('Error logging in user');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    console.log('Session destroyed.');
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).send('Error destroying session');
    }
    res.redirect('/login'); // Redirect to login page after logout
  });
});

app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    console.log('Session destroyed.');
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).send('Error destroying session');
    }
    res.redirect('/login'); // Redirect to login page after logout
  });
});

app.get('/categories', async (req, res) => {
  try {
    const categoriesRef = collection(db, 'categories');
    const categoriesSnapshot = await getDocs(categoriesRef);
    const categories = categoriesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.render('categories', { categories });
  } catch (error) {
    console.error('Napaka pri pridobivanju kategorij:', error);
    res.status(500).json({ error: 'Napaka pri pridobivanju kategorij' });
  }
});

app.get('/categories/:id', async (req, res) => {
  const categoryId = req.params.id;
  try {
    const categoryRef = doc(db, 'categories', categoryId);
    const categoryDoc = await getDoc(categoryRef);
    if (!categoryDoc.exists()) {
      return res.status(404).send('Kategorija ne obstaja');
    }

    const quizzesRef = collection(db, 'quizzes');
    const q = query(quizzesRef, where('categoryId', '==', categoryRef));
    const quizzesSnapshot = await getDocs(q);
    const quizzes = quizzesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const category = categoryDoc.data();
    res.render('categories-details', { category, quizzes });
  } catch (error) {
    console.error('Napaka pri pridobivanju kategorije ali kvizov:', error);
    res.status(500).send('Notranja napaka strežnika');
  }
});

app.get('/quizzes/:id', async (req, res) => {
  const quizId = req.params.id;

  try {
    const quizRef = doc(db, 'quizzes', quizId);
    const quizDoc = await getDoc(quizRef);
    if (!quizDoc.exists()) {
      return res.status(404).send('Kviz ne obstaja');
    }

    const questionsRef = collection(db, 'questions');
    const q = query(questionsRef, where('quizId', '==', quizRef));
    const questionsSnapshot = await getDocs(q);
    const questions = questionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const quiz = { id: quizDoc.id, ...quizDoc.data() };

    res.render('quiz-detail', { quiz, questions });
  } catch (error) {
    console.error('Napaka pri pridobivanju kviza ali vprašanj:', error);
    res.status(500).send('Notranja napaka strežnika');
  }
});

app.post('/submit-quiz/:id', async (req, res) => {
  const quizId = req.params.id;
  const userAnswers = req.body;

  if (!req.session.user) {
    return res.status(401).send('You have to be logged in to submit a quiz');
  }

  try {
    const quizRef = doc(db, 'quizzes', quizId);
    const quizDoc = await getDoc(quizRef);
    if (!quizDoc.exists()) {
      return res.status(404).send('Kviz ne obstaja');
    }
    const quizData = quizDoc.data();

    const questionsRef = collection(db, 'questions');
    const q = query(questionsRef, where('quizId', '==', quizRef));
    const questionsSnapshot = await getDocs(q);
    const questions = questionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    let score = 0;
    const results = questions.map((question) => {
      const correctAnswer = question.correct_answer;
      const userAnswer = userAnswers[`question-${question.id}`];
      const isCorrect = parseInt(userAnswer) === correctAnswer;

      if (isCorrect) {
        score += question.value;
      }

      return {
        question: question.question,
        correctAnswer: question.options[correctAnswer],
        userAnswer: question.options[parseInt(userAnswer)],
        isCorrect,
      };
    });

    // Create a reference to the user's document
    const userQuery = query(collection(db, 'users'), where('uid', '==', req.session.user.uid));
    const userSnapshot = await getDocs(userQuery);
    if (userSnapshot.empty) {
      console.log(`User document not found for UID: ${req.session.user.uid}`);
      return res.status(404).send('User does not exist');
    }
    const userId = userSnapshot.docs[0].id;

    // Store the result in the results collection with a reference to the user's document ID
    await addDoc(collection(db, 'results'), {
      quizId: quizRef,
      userId: doc(db, 'users', userId),
      score,
      completed_at: new Date(),
    });

    // Update the user's score for the specific category
    const userData = userSnapshot.docs[0].data();
    const categoryScores = userData.categoryScores || {};
    const categoryId = quizData.categoryId.id;

    categoryScores[categoryId] = (categoryScores[categoryId] || 0) + score;

    await setDoc(doc(db, 'users', userId), { categoryScores }, { merge: true });

    res.render('quiz-result', { quiz: quizDoc.data(), results, score });
  } catch (error) {
    console.error('Napaka pri oddaji kviza:', error);
    res.status(500).send('Notranja napaka strežnika');
  }
});

app.post('/api/get-answer', async (req, res) => {
  const { question } = req.body;

  const API_KEY = process.env.OPENAI_API_KEY;
  const API_URL = 'https://zukijourney.xyzbot.net/v1/chat/completions';

  const requestBody = {
    stream: false,
    model: 'gpt-4',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'user',
        content: `${question}`,
      },
    ],
    max_tokens: 150,
  };

  try {
    console.log('Sending request to API with body:', requestBody);

    const fetch = (await import('node-fetch')).default; // Uporabi dinamični import

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json(); // Parse response as JSON

    if (!response.ok) {
      console.error('Error from API:', data);
      return res.status(response.status).json({ error: data });
    }

    console.log('Received response from API:', data);

    // Extract the answer from the response
    const answer = data.choices[0].message.content;

    res.json({ answer }); // Send the answer to the client
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error fetching the answer' });
  }
});


app.get('/profile/:uid', async (req, res) => {
  try {
    const uid = req.params.uid;

    // Najprej preverimo, ali je uporabnik prijavljen
    const sessionUser = req.session.user;
    if (!sessionUser) {
      return res.redirect('/login');
    }

    // Poiščemo uporabniški dokument glede na UID
    const userQuery = query(collection(db, 'users'), where('uid', '==', uid));
    const userSnapshot = await getDocs(userQuery);
    if (userSnapshot.empty) {
      return res.status(404).send('Uporabnik ne obstaja');
    }

    // Pridobimo podatke o uporabniku
    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();
    const categoryScores = userData.categoryScores || {};

    // Pridobimo podatke o kategorijah in izračunamo nivoje
    const categories = [];
    for (const categoryId in categoryScores) {
      const categoryRef = doc(db, 'categories', categoryId);
      const categoryDoc = await getDoc(categoryRef);
      if (categoryDoc.exists()) {
        const categoryData = categoryDoc.data();
        const score = categoryScores[categoryId];
        let level = 1;
        let pointsToNextLevel = 0;

        if (score < 100) {
          level = 1;
          pointsToNextLevel = 100 - score;
        } else if (score < 300) {
          level = 2;
          pointsToNextLevel = 300 - score;
        } else if (score < 500) {
          level = 3;
          pointsToNextLevel = 500 - score;
        } else {
          level = 4; // For scores 500 and above
          pointsToNextLevel = 0; // Assuming there's no next level beyond 3
        }

        categories.push({
          id: categoryId,
          name: categoryData.name,
          score,
          level,
          pointsToNextLevel,
        });
      }
    }

    res.render('profile', { user: userData, categories });
  } catch (error) {
    console.error('Napaka pri pridobivanju uporabnika:', error);
    res.status(500).send('Notranja napaka strežnika');
  }
});

server.listen(PORT, () => {
  console.log(`Strežnik posluša na portu ${PORT}`);
});
