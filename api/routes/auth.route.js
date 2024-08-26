import express from 'express';
import {
  googleSignIn,
  signOut,
  signin,
  singup,
  forgotPassword,
  verifyOtp
} from '../controllers/auth.controller.js';

const route = express.Router();

route.post('/signup', singup);
route.post('/signin', signin);
route.post('/google', googleSignIn);
route.post('/forgot-password', forgotPassword); 
route.post('/verify-otp', verifyOtp); 
route.get('/signout', signOut);

export default route;
