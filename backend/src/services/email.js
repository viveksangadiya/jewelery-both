const nodemailer = require('nodemailer');

let _transporter = null;

function getTransporter() {
  if (_transporter) return _transporter;
  if (!process.env.SMTP_HOST) return null;
  _transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return _transporter;
}

function formatPrice(n) {
  return '₹' + parseFloat(n).toLocaleString('en-IN');
}

function orderConfirmationHtml(order, items, customerName) {
  const rows = items.map(i => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:14px;color:#1c1c1c">${i.product_name}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:14px;color:#6b6b6b;text-align:center">${i.quantity}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:14px;color:#1c1c1c;text-align:right">${formatPrice(parseFloat(i.price) * i.quantity)}</td>
    </tr>`).join('');

  const shippingFree = parseFloat(order.shipping_charge || 0) === 0;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Inter,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;max-width:560px;width:100%">

        <!-- Header -->
        <tr><td style="background:#1c1c1c;padding:28px 32px;text-align:center">
          <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px">HastKala</p>
          <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.5);letter-spacing:2px;text-transform:uppercase">Handcrafted with Love</p>
        </td></tr>

        <!-- Status banner -->
        <tr><td style="background:#f5f5f5;padding:20px 32px;text-align:center;border-bottom:1px solid #e8e8e8">
          <p style="margin:0;font-size:13px;font-weight:600;color:#1c1c1c;text-transform:uppercase;letter-spacing:1px">✓ Order Confirmed</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px">
          <p style="margin:0 0 8px;font-size:15px;color:#1c1c1c">Hi ${customerName || 'there'},</p>
          <p style="margin:0 0 24px;font-size:14px;color:#6b6b6b;line-height:1.6">
            Thank you for your order! We've received it and will begin processing shortly.
          </p>

          <!-- Order number -->
          <div style="background:#f5f5f5;padding:16px 20px;margin-bottom:24px">
            <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#9b9b9b">Order Number</p>
            <p style="margin:6px 0 0;font-size:18px;font-weight:700;font-family:monospace;color:#1c1c1c">${order.order_number}</p>
          </div>

          <!-- Items table -->
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8e8e8;margin-bottom:20px">
            <thead>
              <tr style="background:#f5f5f5">
                <th style="padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#9b9b9b;font-weight:600">Item</th>
                <th style="padding:10px 12px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#9b9b9b;font-weight:600">Qty</th>
                <th style="padding:10px 12px;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#9b9b9b;font-weight:600">Price</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>

          <!-- Totals -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px">
            <tr>
              <td style="padding:5px 0;font-size:13px;color:#6b6b6b">Subtotal</td>
              <td style="padding:5px 0;font-size:13px;color:#1c1c1c;text-align:right">${formatPrice(order.subtotal)}</td>
            </tr>
            ${parseFloat(order.discount || 0) > 0 ? `<tr>
              <td style="padding:5px 0;font-size:13px;color:#6b6b6b">Discount</td>
              <td style="padding:5px 0;font-size:13px;color:#1c1c1c;text-align:right">−${formatPrice(order.discount)}</td>
            </tr>` : ''}
            <tr>
              <td style="padding:5px 0;font-size:13px;color:#6b6b6b">Shipping</td>
              <td style="padding:5px 0;font-size:13px;color:#1c1c1c;text-align:right">${shippingFree ? 'Free' : formatPrice(order.shipping_charge)}</td>
            </tr>
            <tr style="border-top:1px solid #e8e8e8">
              <td style="padding:10px 0 0;font-size:15px;font-weight:700;color:#1c1c1c">Total</td>
              <td style="padding:10px 0 0;font-size:15px;font-weight:700;color:#1c1c1c;text-align:right">${formatPrice(order.total)}</td>
            </tr>
          </table>

          <!-- Payment method -->
          <p style="margin:0;font-size:13px;color:#6b6b6b">
            Payment: <strong style="color:#1c1c1c">${order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</strong>
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f5f5f5;padding:20px 32px;text-align:center;border-top:1px solid #e8e8e8">
          <p style="margin:0;font-size:12px;color:#9b9b9b">Questions? Email us at hello@hastkala.in</p>
          <p style="margin:6px 0 0;font-size:12px;color:#9b9b9b">© 2025 HastKala · Made with love in India</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

async function sendOrderConfirmation(order, items, toEmail, customerName) {
  try {
    const t = getTransporter();
    if (!t) {
      console.log(`📧 [EMAIL - no SMTP] Order confirmation → ${toEmail} | ${order.order_number}`);
      return;
    }
    await t.sendMail({
      from: `${process.env.SMTP_FROM_NAME || 'HastKala'} <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `✓ Order Confirmed: ${order.order_number} — HastKala`,
      html: orderConfirmationHtml(order, items, customerName),
    });
    console.log(`📧 Order confirmation sent → ${toEmail}`);
  } catch (err) {
    console.error('Email send failed:', err.message);
  }
}

module.exports = { sendOrderConfirmation };
