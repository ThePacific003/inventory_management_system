import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.NODE_MAILER_EMAIL,
    pass: process.env.NODE_MAILER_PASSWORD,
  },
});

if (process.env.NODE_ENV !== "production") {
  transporter.verify((error) => {
    if (error) {
      console.error(error);
    } else {
      console.log("Nodemailer ready");
    }
  });
}

// ✅ existing — untouched
export const sendEmail = async (to, text) => {
  const mailOptions = {
    from: process.env.NODE_MAILER_EMAIL,
    to,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

// ✅ NEW — for purchase orders
export const sendOrderEmail = async ({ supplierEmail, supplierName, order, items }) => {
  const itemRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px; border:1px solid #ddd;">${item.product_name}</td>
        <td style="padding:10px; border:1px solid #ddd; text-align:center;">${item.quantity}</td>
        <td style="padding:10px; border:1px solid #ddd; text-align:right;">$${parseFloat(item.unit_price).toFixed(2)}</td>
        <td style="padding:10px; border:1px solid #ddd; text-align:right;">$${(item.quantity * parseFloat(item.unit_price)).toFixed(2)}</td>
      </tr>`
    )
    .join("");

  const html = `
    <div style="font-family:Arial,sans-serif; max-width:650px; margin:auto; border:1px solid #e0e0e0; border-radius:8px; overflow:hidden;">

      <div style="background:#1a73e8; padding:24px 32px;">
        <h2 style="color:#fff; margin:0;">Purchase Order #${order.id}</h2>
        <p style="color:#cce0ff; margin:6px 0 0;">Date: ${new Date(order.order_date).toDateString()}</p>
      </div>

      <div style="padding:24px 32px;">
        <p style="font-size:15px;">Dear <strong>${supplierName}</strong>,</p>
        <p style="font-size:15px;">Please find below our purchase order. Kindly process it at your earliest convenience.</p>

        <table style="width:100%; border-collapse:collapse; margin-top:16px;">
          <thead>
            <tr style="background:#f5f5f5;">
              <th style="padding:10px; border:1px solid #ddd; text-align:left;">Product</th>
              <th style="padding:10px; border:1px solid #ddd; text-align:center;">Quantity</th>
              <th style="padding:10px; border:1px solid #ddd; text-align:right;">Unit Price</th>
              <th style="padding:10px; border:1px solid #ddd; text-align:right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding:10px; border:1px solid #ddd; text-align:right;"><strong>Total Amount</strong></td>
              <td style="padding:10px; border:1px solid #ddd; text-align:right;"><strong>$${parseFloat(order.total_amount).toFixed(2)}</strong></td>
            </tr>
          </tfoot>
        </table>

        <p style="margin-top:24px; font-size:14px; color:#555;">If you have any questions, please contact us directly.</p>
        <p style="font-size:14px; color:#555;">Thank you for your continued partnership.</p>
      </div>

      <div style="background:#f5f5f5; padding:16px 32px; text-align:center;">
        <p style="font-size:12px; color:#999; margin:0;">This is an automated email. Please do not reply directly.</p>
      </div>

    </div>
  `;

  const mailOptions = {
    from: process.env.NODE_MAILER_EMAIL,
    to: supplierEmail,
    subject: `Purchase Order #${order.id}`,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Order email sent to ${supplierEmail}`);
  } catch (error) {
    console.error("Error sending order email:", error);
  }
};

export default transporter;