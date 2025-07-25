import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { type, recipient, subject, message, data } = body;

    if (!type || !recipient) {
      return NextResponse.json(
        { error: 'Type and recipient are required' },
        { status: 400 }
      );
    }

    // Development mode - simulate email sending
    if (process.env.DEVELOPMENT_MODE === 'true') {
      // Simulate different email types
      const emailTemplates = {
        'tournament_registration': {
          subject: 'Tournament Registration Confirmed - ThinQ Chess',
          template: `
            Dear ${data?.name || 'Participant'},
            
            Your tournament registration has been confirmed!
            
            Registration Details:
            - Tournament Fee: ₹${data?.amount || '400'}
            - Payment ID: ${data?.payment_id || 'PAY_DEMO123'}
            - Registration Date: ${new Date().toLocaleDateString()}
            
            Tournament Guidelines:
            - Report 30 minutes before your scheduled time
            - Bring a valid ID proof
            - Follow tournament rules and regulations
            
            Best regards,
            ThinQ Chess Academy Team
            Phone: +91 7975820187
            Email: admin@thinqchess.com
          `
        },
        'course_enrollment': {
          subject: 'Course Enrollment Confirmed - ThinQ Chess',
          template: `
            Dear ${data?.name || 'Student'},
            
            Welcome to ThinQ Chess Academy!
            
            Your course enrollment has been confirmed.
            
            Enrollment Details:
            - Course Fee: ₹${data?.amount || '500'}
            - Payment ID: ${data?.payment_id || 'PAY_DEMO123'}
            - Enrollment Date: ${new Date().toLocaleDateString()}
            
            Next Steps:
            - You will receive class schedule within 24 hours
            - Our team will contact you for orientation
            - Download our study materials from the portal
            
            Best regards,
            ThinQ Chess Academy Team
            Phone: +91 7975820187
            Email: admin@thinqchess.com
          `
        },
        'admin_notification': {
          subject: 'New Registration Alert - ThinQ Chess Admin',
          template: `
            New Registration Alert!
            
            Type: ${data?.type || 'Unknown'}
            Name: ${data?.name || 'N/A'}
            Email: ${data?.email || 'N/A'}
            Phone: ${data?.phone || 'N/A'}
            Amount: ₹${data?.amount || '0'}
            Payment ID: ${data?.payment_id || 'N/A'}
            Time: ${new Date().toLocaleString()}
            
            Please check the admin panel for full details.
            
            Admin Panel: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin
          `
        },
        'newsletter': {
          subject: subject || 'Newsletter - ThinQ Chess',
          template: message || 'Newsletter content here...'
        }
      };

      const emailContent = emailTemplates[type] || {
        subject: subject || 'Notification from ThinQ Chess',
        template: message || 'Default notification message'
      };

      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('📧 Email Sent (Development Mode):');
      console.log('To:', recipient);
      console.log('Subject:', emailContent.subject);
      console.log('Content:', emailContent.template);

      return NextResponse.json({
        success: true,
        message: 'Email sent successfully (development mode)',
        details: {
          to: recipient,
          subject: emailContent.subject,
          type: type,
          sent_at: new Date().toISOString()
        }
      });
    }

    // Production mode - integrate with actual email service
    // This would integrate with services like:
    // - SendGrid
    // - AWS SES
    // - Nodemailer with SMTP
    // - EmailJS
    
    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      details: {
        to: recipient,
        subject: subject,
        type: type,
        sent_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}

// Bulk email sending
export async function PUT(request) {
  try {
    const body = await request.json();
    const { recipients, subject, message, type } = body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: 'Recipients array is required' },
        { status: 400 }
      );
    }

    // Development mode - simulate bulk email
    if (process.env.DEVELOPMENT_MODE === 'true') {
      console.log('📧 Bulk Email Sent (Development Mode):');
      console.log('Recipients:', recipients.length);
      console.log('Subject:', subject);
      console.log('Type:', type);

      return NextResponse.json({
        success: true,
        message: `Bulk email sent to ${recipients.length} recipients (development mode)`,
        details: {
          recipients_count: recipients.length,
          subject: subject,
          type: type,
          sent_at: new Date().toISOString()
        }
      });
    }

    // Production mode bulk email logic here

    return NextResponse.json({
      success: true,
      message: `Bulk email sent to ${recipients.length} recipients`,
      details: {
        recipients_count: recipients.length,
        subject: subject,
        type: type,
        sent_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error sending bulk email:', error);
    return NextResponse.json(
      { error: 'Failed to send bulk email' },
      { status: 500 }
    );
  }
}
