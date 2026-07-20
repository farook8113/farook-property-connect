import { NextResponse } from 'next/server';
import { DbService } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { subject, htmlContent } = body;

    // Load configurations from DB settings
    const settings = await DbService.getSettings();
    
    // Check if email notifications are enabled and configured
    const enabled = settings?.email_notifications_enabled || false;
    const apiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.NOTIFICATION_EMAIL || 'farookshaji246@gmail.com';
    const fromEmail = process.env.SENDER_EMAIL || 'onboarding@resend.dev';

    console.log('--- EMAIL DISPATCH TRIGGERED ---');
    console.log('Enabled:', enabled);
    console.log('API Key configured:', !!apiKey);
    console.log('Recipient:', toEmail);
    console.log('Sender:', fromEmail);

    if (!enabled) {
      console.log('Dispatch aborted: Email notifications are disabled in Settings.');
      return NextResponse.json({ success: false, message: 'Email notifications are disabled in settings.' });
    }

    if (!apiKey) {
      console.log('Dispatch aborted: Resend API Key is missing.');
      return NextResponse.json({ success: false, message: 'Resend API Key is missing. Please configure it in Settings.' });
    }

    // Call Resend API using standard HTTP fetch
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: `Farook Property Connect <${fromEmail}>`,
        to: [toEmail],
        subject: subject,
        html: htmlContent,
      }),
    });

    const data = await response.json();
    console.log('Resend Response Status:', response.status);
    console.log('Resend Response Data:', data);

    if (!response.ok) {
      console.log('Dispatch failed via Resend API.');
      return NextResponse.json({ 
        success: false, 
        message: data.message || 'Failed to dispatch email via Resend API.' 
      }, { status: response.status });
    }

    return NextResponse.json({ success: true, message: 'Email dispatched successfully.', id: data.id });

  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Internal server error.' }, { status: 500 });
  }
}
