import * as React from "react";

interface EmailTemplateProps {
  fullName: string;
  email: string;
  message: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  fullName,
  email,
  message,
}) => (
  <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
    <h1 style={{ color: '#333', fontSize: '24px', marginBottom: '20px' }}>
      New Contact Form Submission
    </h1>
    <div style={{ marginBottom: '20px' }}>
      <p style={{ margin: '5px 0' }}><strong>From:</strong> {fullName}</p>
      <p style={{ margin: '5px 0' }}><strong>Email:</strong> {email}</p>
    </div>
    <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '5px' }}>
      <h2 style={{ color: '#666', fontSize: '18px', marginBottom: '10px' }}>Message:</h2>
      <p style={{ color: '#333', whiteSpace: 'pre-wrap' }}>{message}</p>
    </div>
  </div>
);
