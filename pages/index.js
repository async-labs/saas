// Add these imports at the top of index.js
import { useRouter } from 'next/router';
import { getFirestore, setDoc, doc } from 'firebase/firestore';

// Add this near your other state declarations
const [error, setError] = useState('');
const router = useRouter();

const handleLogin = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setError('');
  try {
    const email = e.target.email.value;
    const password = e.target.password.value;
    await signInWithEmailAndPassword(auth, email, password);
    router.push('/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    setError(error.message);
  }
  setIsLoading(false);
};

const handleRegister = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setError('');
  try {
    const email = e.target['register-email'].value;
    const password = e.target['register-password'].value;
    const confirmPassword = e.target['confirm-password'].value;
    
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Initialize user document in Firestore
    const db = getFirestore();
    await setDoc(doc(db, 'users', user.uid), {
      email,
      uid: user.uid,
      role: 'user',
      createdAt: new Date().toISOString(),
    });

    router.push('/dashboard');
  } catch (error) {
    console.error('Registration error:', error);
    setError(error.message);
  }
  setIsLoading(false);
};