import { DbService } from './supabase';

export const EmailNotificationService = {
  async triggerSellerLeadEmail(lead: any, files: { name: string; url: string; type: string }[] = []) {
    try {
      const subject = `🔔 New Seller Lead: ${lead.title} - AED ${Number(lead.price).toLocaleString()}`;
      
      const fileRows = files.length > 0
        ? files.map(f => `<li>📎 <strong>${f.name}</strong> (${f.type})</li>`).join('')
        : '<li>No files uploaded.</li>';

      const htmlContent = `
        <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #0b192c;">
          <div style="text-align: center; border-bottom: 2px solid #d4af37; padding-bottom: 20px; margin-bottom: 20px;">
            <span style="font-size: 24px; font-weight: bold; letter-spacing: 1px; color: #0b192c;">FAROOK PROPERTIES</span>
            <div style="font-size: 11px; color: #aa7c11; font-weight: bold; text-transform: uppercase; margin-top: 4px; letter-spacing: 2px;">Private Real Estate Lead Management</div>
          </div>
          
          <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #1e3e62; border-left: 4px solid #d4af37; padding-left: 10px;">New Seller Submission Received</h2>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
            <tr style="background-color: #f8f9fa;">
              <td style="padding: 10px; font-weight: bold; width: 35%;">Owner Name</td>
              <td style="padding: 10px;">${lead.full_name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold;">Phone Number</td>
              <td style="padding: 10px;"><a href="tel:${lead.phone}" style="color: #d4af37; text-decoration: none; font-weight: bold;">${lead.phone}</a></td>
            </tr>
            <tr style="background-color: #f8f9fa;">
              <td style="padding: 10px; font-weight: bold;">Email Address</td>
              <td style="padding: 10px;"><a href="mailto:${lead.email}" style="color: #1e3e62; text-decoration: underline;">${lead.email}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold;">Nationality</td>
              <td style="padding: 10px;">${lead.nationality || 'N/A'}</td>
            </tr>
          </table>

          <h3 style="font-size: 14px; font-weight: bold; margin-bottom: 10px; color: #1e3e62; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">Property Curation Details</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
            <tr style="background-color: #f8f9fa;">
              <td style="padding: 10px; font-weight: bold; width: 35%;">Title</td>
              <td style="padding: 10px; font-weight: bold;">${lead.title}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold;">Property Type</td>
              <td style="padding: 10px;">${lead.property_type}</td>
            </tr>
            <tr style="background-color: #f8f9fa;">
              <td style="padding: 10px; font-weight: bold;">Asking Price</td>
              <td style="padding: 10px; font-weight: bold; color: #d4af37; font-size: 15px;">AED ${Number(lead.price).toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold;">Location</td>
              <td style="padding: 10px;">${lead.community}, ${lead.city} ${lead.area ? `(${lead.area})` : ''}</td>
            </tr>
            <tr style="background-color: #f8f9fa;">
              <td style="padding: 10px; font-weight: bold;">Specs</td>
              <td style="padding: 10px;">${lead.bedrooms === 0 ? 'Studio' : `${lead.bedrooms} Bed`} | ${lead.bathrooms} Bath | ${lead.parking_spaces} Parking</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold;">Area Specs</td>
              <td style="padding: 10px;">BUA: ${lead.built_up_area || 'N/A'} SqFt ${lead.plot_area ? `| Plot: ${lead.plot_area} SqFt` : ''}</td>
            </tr>
            <tr style="background-color: #f8f9fa;">
              <td style="padding: 10px; font-weight: bold;">Status & Ready</td>
              <td style="padding: 10px;">${lead.ready_property ? 'Ready' : 'Off-plan'} | ${lead.condition || 'N/A'} | ${lead.furnished ? 'Furnished' : 'Unfurnished'}</td>
            </tr>
          </table>

          <div style="background-color: #f8f9fa; border: 1px dashed #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 20px; font-size: 13px;">
            <strong style="display: block; margin-bottom: 5px; color: #1e3e62;">Description Remarks:</strong>
            <p style="margin: 0; line-height: 1.5; color: #4a5568; font-style: italic;">"${lead.description}"</p>
          </div>

          <h3 style="font-size: 14px; font-weight: bold; margin-bottom: 10px; color: #1e3e62;">Attached Files</h3>
          <ul style="padding-left: 20px; font-size: 13px; margin-bottom: 25px; line-height: 1.6; color: #4a5568;">
            ${fileRows}
          </ul>

          <div style="text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 25px;">
            <a href="http://localhost:3000/admin-login" style="display: inline-block; padding: 12px 25px; background-color: #0b192c; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 13px; border: 1px solid #d4af37;">
              Log In to CRM Dashboard
            </a>
          </div>
          
          <p style="text-align: center; font-size: 10px; color: #a0aec0; margin-top: 25px; border-top: 1px solid #f1f2f6; pt-4">
            This is a confidential message generated by your website's private lead matchmaking portal. Only authorized admins have database authorization.
          </p>
        </div>
      `;

      const settings = await DbService.getSettings();

      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          subject, 
          htmlContent,
          clientSettings: {
            email_notifications_enabled: settings?.email_notifications_enabled,
            resend_api_key: settings?.resend_api_key,
            recipient_email: settings?.recipient_email,
            sender_email: settings?.sender_email
          }
        })
      });

    } catch (err) {
      console.error('Email Notification Error:', err);
    }
  },

  async triggerBuyerLeadEmail(lead: any, files: { name: string; url: string; type: string }[] = []) {
    try {
      const subject = `🔔 New Buyer Requirement: ${lead.property_type_needed} - Max AED ${Number(lead.max_budget).toLocaleString()}`;
      
      const fileRows = files.length > 0
        ? files.map(f => `<li>📎 <strong>${f.name}</strong> (${f.type})</li>`).join('')
        : '<li>No mandate documents uploaded.</li>';

      const htmlContent = `
        <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #0b192c;">
          <div style="text-align: center; border-bottom: 2px solid #d4af37; padding-bottom: 20px; margin-bottom: 20px;">
            <span style="font-size: 24px; font-weight: bold; letter-spacing: 1px; color: #0b192c;">FAROOK PROPERTIES</span>
            <div style="font-size: 11px; color: #aa7c11; font-weight: bold; text-transform: uppercase; margin-top: 4px; letter-spacing: 2px;">Private Real Estate Lead Management</div>
          </div>
          
          <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #1e3e62; border-left: 4px solid #d4af37; padding-left: 10px;">New Buyer Mandate Received</h2>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
            <tr style="background-color: #f8f9fa;">
              <td style="padding: 10px; font-weight: bold; width: 35%;">Buyer Name</td>
              <td style="padding: 10px;">${lead.full_name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold;">Phone Number</td>
              <td style="padding: 10px;"><a href="tel:${lead.phone}" style="color: #d4af37; text-decoration: none; font-weight: bold;">${lead.phone}</a></td>
            </tr>
            <tr style="background-color: #f8f9fa;">
              <td style="padding: 10px; font-weight: bold;">Email Address</td>
              <td style="padding: 10px;"><a href="mailto:${lead.email}" style="color: #1e3e62; text-decoration: underline;">${lead.email}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold;">Nationality</td>
              <td style="padding: 10px;">${lead.nationality || 'N/A'}</td>
            </tr>
          </table>

          <h3 style="font-size: 14px; font-weight: bold; margin-bottom: 10px; color: #1e3e62; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">Mandate Specifications</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
            <tr style="background-color: #f8f9fa;">
              <td style="padding: 10px; font-weight: bold; width: 35%;">Property Needed</td>
              <td style="padding: 10px; font-weight: bold;">${lead.property_type_needed}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold;">Budget Range</td>
              <td style="padding: 10px; font-weight: bold; color: #d4af37;">
                AED ${lead.min_budget ? Number(lead.min_budget).toLocaleString() : '0'} to AED ${Number(lead.max_budget).toLocaleString()}
              </td>
            </tr>
            <tr style="background-color: #f8f9fa;">
              <td style="padding: 10px; font-weight: bold;">Preferred Location</td>
              <td style="padding: 10px;">${lead.preferred_community || 'Any'}, ${lead.preferred_city}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold;">Bedrooms Required</td>
              <td style="padding: 10px;">${lead.bedrooms_required === 0 ? 'Studio' : `${lead.bedrooms_required}+ Bed`} | ${lead.bathrooms_required} Bath</td>
            </tr>
            <tr style="background-color: #f8f9fa;">
              <td style="padding: 10px; font-weight: bold;">Purpose & Funding</td>
              <td style="padding: 10px;">${lead.purpose} | ${lead.preferred_completion} | ${lead.payment_method}</td>
            </tr>
          </table>

          <div style="background-color: #f8f9fa; border: 1px dashed #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 20px; font-size: 13px;">
            <strong style="display: block; margin-bottom: 5px; color: #1e3e62;">Additional Mandate Notes:</strong>
            <p style="margin: 0; line-height: 1.5; color: #4a5568; font-style: italic;">"${lead.additional_requirements || 'No additional notes provided.'}"</p>
          </div>

          <h3 style="font-size: 14px; font-weight: bold; margin-bottom: 10px; color: #1e3e62;">Attached Documents</h3>
          <ul style="padding-left: 20px; font-size: 13px; margin-bottom: 25px; line-height: 1.6; color: #4a5568;">
            ${fileRows}
          </ul>

          <div style="text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 25px;">
            <a href="http://localhost:3000/admin-login" style="display: inline-block; padding: 12px 25px; background-color: #0b192c; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 13px; border: 1px solid #d4af37;">
              Log In to CRM Dashboard
            </a>
          </div>
        </div>
      `;

      const settings = await DbService.getSettings();

      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          subject, 
          htmlContent,
          clientSettings: {
            email_notifications_enabled: settings?.email_notifications_enabled,
            resend_api_key: settings?.resend_api_key,
            recipient_email: settings?.recipient_email,
            sender_email: settings?.sender_email
          }
        })
      });

    } catch (err) {
      console.error('Email Notification Error:', err);
    }
  }
};
