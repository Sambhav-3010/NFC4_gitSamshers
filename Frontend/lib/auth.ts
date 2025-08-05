// lib/auth.ts
"use client"
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from './firebase';

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    localStorage.setItem('user', JSON.stringify(user));
    console.log('Logged in:', user);
    return user;
  } catch (err) {
    console.error('Login error:', err);
    return null;
  }
};