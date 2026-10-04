import bcrypt from 'bcryptjs';
import User from '@/server/models/User';
export async function registerUser(name:string,email:string,password:string) {
  const normalized=email.trim().toLowerCase();
  if (!name.trim() || !/^\S+@\S+\.\S+$/.test(normalized) || password.length<8) throw new Error('Enter a name, valid email, and password with at least 8 characters.');
  if (await User.exists({email:normalized})) throw new Error('An account with this email already exists.');
  const passwordHash=await bcrypt.hash(password,12); return User.create({name:name.trim(),email:normalized,passwordHash,profile:{skills:[],preferredRoles:[]}});
}
export async function authenticateUser(email:string,password:string) {
  const user=await User.findOne({email:email.trim().toLowerCase()}).select('+passwordHash');
  if (!user || !await bcrypt.compare(password,user.passwordHash)) throw new Error('Email or password is incorrect.');
  return user;
}
