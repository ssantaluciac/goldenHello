import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Your Typeform signing key (you can store this in environment variables)
const signingKey = process.env.TYPEFORM_SIGNING_KEY || 'your-signing-key';

export async function POST(req: NextRequest) {
  try {
    // Retrieve the signature and the raw body for verification
    const signatureHeader = req.headers.get('typeform-signature');
    const signature = signatureHeader?.replace('sha256=', ''); // Extract the signature part

    const rawBody = await req.text(); // get the raw text body for hashing
    

    // Hash the raw body with the Typeform signing key using SHA-256
    const hash = crypto
      .createHmac('sha256', signingKey)
      .update(rawBody)
      .digest('hex');

    console.log('Received Signature:', signature);
    console.log('Generated Hash:', hash);
    // Compare the computed hash with the signature
    if (hash !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // If the signature is valid, process the form data
    const formData = JSON.parse(rawBody); // parse the raw body as JSON
    console.log('Valid form submission received:', formData);

    // Respond with success
    return NextResponse.json({ message: 'Data received and verified' }, { status: 200 });
  } catch (error) {
    console.error('Error processing the request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
