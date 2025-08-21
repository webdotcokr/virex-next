import { NextResponse } from 'next/server';

export async function GET() {
  console.log('🟢 TEST API CALLED - SERVER IS WORKING!');
  return NextResponse.json({ message: 'Test API working', timestamp: new Date().toISOString() });
}