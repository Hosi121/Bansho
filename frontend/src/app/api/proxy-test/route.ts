import { NextResponse } from 'next/server';

export async function GET() {
  const response = await fetch('http://localhost:8080/api/v1/documents', {
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    }
  });

  if (!response.ok) {
    return NextResponse.json({ error: 'Backend error' }, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data);
}