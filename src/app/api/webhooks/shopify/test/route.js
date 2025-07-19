import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ 
    message: "Shopify webhook endpoint is accessible",
    timestamp: new Date().toISOString(),
    status: "ok"
  });
}

export async function POST(request) {
  const body = await request.text();
  
  return NextResponse.json({ 
    message: "Test webhook received",
    body: body,
    headers: Object.fromEntries(request.headers.entries()),
    timestamp: new Date().toISOString()
  });
} 