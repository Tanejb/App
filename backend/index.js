const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const firebaseAdmin = require('firebase-admin');
const session = require('express-session');
const {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} = require('firebase/auth');

app.use(
  session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Uporabite true za HTTPS
  })
);
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});
app.set('view engine', 'ejs');

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
} = require('firebase/firestore');
const firebaseConfig = require('./firebaseConfig');

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

// Firebase Admin configuration
const serviceAccount = require('./serviceAccountKey.json');

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

app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
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

    let score = 0;
    const results = questions.map((question) => {
      const correctAnswer = question.correct_answer;
      const userAnswer = userAnswers[`question-${question.id}`];
      const isCorrect = parseInt(userAnswer) === correctAnswer;

      if (isCorrect) {
        score += 10;
      }

      return {
        question: question.question,
        correctAnswer: question.options[correctAnswer],
        userAnswer: question.options[parseInt(userAnswer)],
        isCorrect,
      };
    });

    await addDoc(collection(db, 'results'), {
      quizId: quizRef,
      score,
      completed_at: new Date(),
    });

    res.render('quiz-result', { quiz: quizDoc.data(), results, score });
  } catch (error) {
    console.error('Napaka pri oddaji kviza:', error);
    res.status(500).send('Notranja napaka strežnika');
  }
});

app.listen(3000, () => {
  console.log(`Strežnik posluša na portu 3000`);
});
