const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send low attendance alert to student
const sendStudentAlert = async (studentEmail, studentName, percentage, subjectName) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: studentEmail,
      subject: `⚠️ Low Attendance Alert — ${subjectName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1a2a4a; padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: #fff; margin: 0; font-size: 24px;">AttendX</h1>
            <p style="color: #e63946; margin: 5px 0 0; font-size: 12px; letter-spacing: 2px;">BY CYBERSQUARE</p>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1a2a4a;">⚠️ Attendance Warning</h2>
            <p style="color: #333;">Dear <strong>${studentName}</strong>,</p>
            <p style="color: #333;">Your attendance for <strong>${subjectName}</strong> has dropped below 75%.</p>
            <div style="background: #fff; border: 2px solid #e63946; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
              <p style="margin: 0; font-size: 14px; color: #666;">Current Attendance</p>
              <p style="margin: 5px 0 0; font-size: 42px; font-weight: bold; color: #e63946;">${percentage}%</p>
            </div>
            <p style="color: #333;">Please make sure to attend your upcoming classes to improve your attendance.</p>
            <p style="color: #333;">Minimum required attendance is <strong>75%</strong>.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">This is an automated message from AttendX by CyberSquare. Please do not reply to this email.</p>
          </div>
        </div>
      `
    });
    console.log(`✅ Alert email sent to ${studentEmail}`);
    return true;
  } catch (err) {
    console.error('❌ Email error:', err.message);
    return false;
  }
};

// Send monthly report to teacher
const sendTeacherReport = async (teacherEmail, teacherName, atRiskStudents, className) => {
  try {
    const studentRows = atRiskStudents.map(s => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${s.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; font-family: monospace;">${s.rollNumber}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; color: #e63946; font-weight: bold;">${s.percentage}%</td>
      </tr>
    `).join('');

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: teacherEmail,
      subject: `📊 Monthly Attendance Report — ${className}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1a2a4a; padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: #fff; margin: 0; font-size: 24px;">AttendX</h1>
            <p style="color: #e63946; margin: 5px 0 0; font-size: 12px; letter-spacing: 2px;">BY CYBERSQUARE</p>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1a2a4a;">📊 Monthly Attendance Report</h2>
            <p style="color: #333;">Dear <strong>${teacherName}</strong>,</p>
            <p style="color: #333;">Here is the list of students with attendance below 75% for <strong>${className}</strong>:</p>
            ${atRiskStudents.length === 0 ? 
              '<p style="color: green; font-weight: bold;">🎉 All students have attendance above 75%!</p>' :
              `<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <thead>
                  <tr style="background: #1a2a4a; color: #fff;">
                    <th style="padding: 12px; text-align: left;">Student Name</th>
                    <th style="padding: 12px; text-align: left;">Roll No</th>
                    <th style="padding: 12px; text-align: left;">Attendance</th>
                  </tr>
                </thead>
                <tbody>${studentRows}</tbody>
              </table>`
            }
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">This is an automated monthly report from AttendX by CyberSquare.</p>
          </div>
        </div>
      `
    });
    console.log(`✅ Report email sent to ${teacherEmail}`);
    return true;
  } catch (err) {
    console.error('❌ Email error:', err.message);
    return false;
  }
};

module.exports = { sendStudentAlert, sendTeacherReport };