import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '@/lib/db';
import { createToken } from '@/server/middleware/auth';
import { registerUser } from '@/server/services/authService';
export async function POST(req:NextRequest){try{const body=await req.json();await connectDb();const user=await registerUser(String(body.name||''),String(body.email||''),String(body.password||''));const res=NextResponse.json({user:{id:user.id,name:user.name,email:user.email}},{status:201});res.cookies.set('iv_session',createToken({userId:user.id,email:user.email}),{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',path:'/',maxAge:60*60*24*7});return res;}catch(e){const message=e instanceof Error?e.message:'Could not create account.';return NextResponse.json({error:message},{status:message.includes('MongoDB')?503:400});}}
