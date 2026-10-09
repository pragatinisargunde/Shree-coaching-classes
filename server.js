require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB connected successfully!'))
    .catch((err) => console.error('❌ MongoDB Connection Error:', err.message));

// ==========================================
// 1. ADMIN SCHEMA & MODEL (Pehle define karna zaroori hai)
// ==========================================
const adminSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['super_admin', 'course_admin', 'hostel_admin'], default: 'super_admin' }
});
const Admin = mongoose.model('Admin', adminSchema);

// ==========================================
// 2. DEFAULT ADMIN AUTO-CREATE (Model ke baad)
// ==========================================
mongoose.connection.once('open', async () => {
    try {
        const existingAdmin = await Admin.findOne({ email: "pragatinisargunde@gmail.com" });
        if (!existingAdmin) {
            await Admin.create({
                email: "pragatinisargunde@gmail.com",
                username: "Pragati Admin",
                password: "admin123",
                role: "super_admin"
            });
            console.log("✅ Default Admin created successfully in DB!");
        }
    } catch (err) {
        console.error("Error creating default admin:", err.message);
    }
});

// ==========================================
// EMAIL TRANSPORTER SETUP (NODEMAILER)
// ==========================================
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Temporary memory mein OTP store karne ke liye
let otpStorage = {}; 

// ==========================================
// OTHER SCHEMAS & MODELS
// ==========================================

const messageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    subject: { type: String },
    message: { type: String, required: true },
    receivedAt: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

// 1. Coaching Admission Schema & Model
const coachingAdmissionSchema = new mongoose.Schema({
    applicationId: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    dob: { type: String },
    gender: { type: String },
    email: { type: String, default: 'N/A' },
    phone: { type: String, default: 'N/A' },
    parentName: { type: String },
    course: { type: String, required: true },
    shift: { type: String },
    address: { type: String },
    registrationUtr: { type: String },
    appliedAt: { type: Date, default: Date.now }
});
const CoachingAdmission = mongoose.model('CoachingAdmission', coachingAdmissionSchema);

// 2. Hostel & Mess Admission Schema & Model
const hostelAdmissionSchema = new mongoose.Schema({
    applicationId: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    dob: { type: String },
    gender: { type: String },
    email: { type: String, default: 'N/A' },
    phone: { type: String, default: 'N/A' },
    parentName: { type: String },
    course: { type: String, required: true },
    shift: { type: String },
    hostelRequired: { type: String, default: 'yes' },
    mess: { type: String },
    address: { type: String },
    registrationUtr: { type: String },
    appliedAt: { type: Date, default: Date.now }
});
const HostelAdmission = mongoose.model('HostelAdmission', hostelAdmissionSchema);

const studentSchema = new mongoose.Schema({
    studentId: { type: String, required: true, unique: true },
    password: { type: String, required: true, default: '12345' },
    fullName: { type: String, required: true },
    phone: String,
    email: String,
    classCourse: { type: String, required: true },
    academicYear: { type: String, default: '2026-27' },
    
    // Course Fees Fields
    feesStatus: { type: String, default: 'Pending' },
    paidAmount: { type: String, default: '₹500' },
    pendingFees: { type: String, default: '₹0' },

    // Hostel Fees & Room Fields
    hostelRequired: { type: String, default: 'No' },
    hostelPaidAmount: { type: String, default: '₹0' },
    hostelPendingFees: { type: String, default: '₹0' },
    totalRemainingAmount: { type: String, default: '₹0' },
    
    hostelRoom: { type: String, default: 'No Hostel' },
    floorNo: { type: String, default: 'N/A' },
    gpa: { type: String, default: '3.6' },

    // 🕒 Login Activity & Active Tracking Fields
    lastLogin: { type: String, default: 'First Login / Never' },
    lastActive: { type: Date, default: null },
    
    createdAt: { type: Date, default: Date.now }
});
const Student = mongoose.model('Student', studentSchema);

// ==========================================
// ROUTES
// ==========================================

app.post('/api/contact', async (req, res) => {
    try {
        const newMsg = new Message(req.body);
        await newMsg.save();
        res.status(200).json({ success: true, message: 'Message saved successfully!' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ==========================================
// ADMIN OTP LOGIN ROUTES
// ==========================================

// 2. OTP Bhejne ki API
app.post('/api/admin-send-otp', async (req, res) => {
    try {
        const { email } = req.body;
        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(404).json({ success: false, message: 'Admin email not found in database!' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStorage[email] = otp;

        await transporter.sendMail({
            from: `"EduHostel Academy" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'EduHostel Admin Login OTP',
            text: `Aapka EduHostel Admin Panel ka OTP hai: ${otp}`
        });

        res.status(200).json({ success: true, message: 'OTP sent successfully!' });
    } catch (err) {
        // 👇 Yeh line apne terminal par print karke dekho ki kya error hai!
        console.error("❌ EMAIL SENDING ERROR:", err.message); 
        res.status(500).json({ success: false, message: err.message });
    }
});

// 3. OTP Verify aur Login ki API
app.post('/api/admin-verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (otpStorage[email] && otpStorage[email] === otp) {
            delete otpStorage[email];
            const admin = await Admin.findOne({ email });
            
            res.status(200).json({ 
                success: true, 
                role: admin.role, 
                message: 'OTP verified successfully!' 
            });
        } else {
            res.status(400).json({ success: false, message: 'Invalid or expired OTP!' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// app.post('/api/admissions', async (req, res) => {
//     try {
//         const data = req.body;
        
//         if (data.enrollmentType === 'hostel-mess') {
//             const newHostelAdmission = new HostelAdmission(data);
//             await newHostelAdmission.save();
//         } else {
//             const newCoachingAdmission = new CoachingAdmission(data);
//             await newCoachingAdmission.save();
//         }

//         const count = await Student.countDocuments();
//         const generatedId = `STU${1000 + count + 1}`;
//         const defaultPassword = data.phone ? data.phone.slice(-4) : '1234';

//         const existingStudent = await Student.findOne({ phone: data.phone });
//         if (!existingStudent) {
//             const newStudent = new Student({
//                 studentId: generatedId,
//                 password: "12345",
//                 fullName: data.fullName,
//                 phone: data.phone,
//                 email: data.email,
//                 classCourse: data.course,
//                 hostelRequired: data.hostelRequired === 'yes' ? 'Yes' : 'No',
//                 hostelRoom: data.hostelRequired === 'yes' ? 'Reserved Pod' : 'No Hostel',
//                 paidAmount: '₹500',
//                 pendingFees: '₹0'
//             });
//             await newStudent.save();
//         }

//         try {
//             if (data.email && data.email !== 'N/A') {
//                 const mailOptions = {
//                     from: `"EduHostel Academy" <${process.env.EMAIL_USER}>`,
//                     to: data.email,
//                     subject: 'Admission Successful & Provisional Token - EduHostel Academy',
//                     html: `
//                         <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; background: #faf4f8; border-radius: 12px;">
//                             <h2 style="color: #403D88;">Welcome to EduHostel Academy!</h2>
//                             <p>Dear <b>${data.fullName}</b>,</p>
//                             <p>Your seat reservation and registration fee payment have been successfully processed.</p>
//                             <div style="background: #fce5e9; padding: 15px; border-radius: 10px; margin: 20px 0; border: 1px solid #f3b6c2;">
//                                 <p style="margin: 0 0 8px 0; font-size: 14px;"><b>Application ID:</b> ${data.applicationId}</p>
//                                 <p style="margin: 0 0 8px 0; font-size: 14px;"><b>Course / Batch:</b> ${data.course}</p>
//                                 <p style="margin: 0; font-size: 14px;"><b>Student Portal Password:</b> ${defaultPassword} (Last 4 digits of phone)</p>
//                             </div>
//                         </div>
//                     `
//                 };
//                 await transporter.sendMail(mailOptions);
//             }
//         } catch (emailErr) {
//             console.warn("⚠️ Email could not be sent:", emailErr.message);
//         }

//         res.status(201).json({
//             success: true,
//             studentId: generatedId,
//             message: "Admission registered successfully!"
//         });

//     } catch (err) {
//         console.error("❌ Admission Error:", err.message);
//         res.status(500).json({ success: false, message: err.message });
//     }
// });


app.post('/api/admissions', async (req, res) => {
    try {
        const data = req.body;
        
        // 1. Save data based on enrollment type
        if (data.enrollmentType === 'hostel-mess') {
            await new HostelAdmission(data).save();
        } else {
            await new CoachingAdmission(data).save();
        }

        // 2. Generate unique student ID and default password
        const count = await Student.countDocuments();
        const generatedId = `STU${1000 + count + 1}`;
        const defaultPassword = data.phone ? data.phone.slice(-4) : '1234';

        // 3. Ensure student is added to Students collection for Admin Panel
        const existingStudent = await Student.findOne({ phone: data.phone });
        if (!existingStudent) {
            await new Student({
                studentId: generatedId,
                password: defaultPassword,
                fullName: data.fullName,
                phone: data.phone,
                email: data.email,
                classCourse: data.course,
                hostelRequired: data.hostelRequired === 'yes' ? 'Yes' : 'No',
                hostelRoom: data.hostelRequired === 'yes' ? 'Reserved Pod' : 'No Hostel',
                paidAmount: '₹500',
                pendingFees: '₹0'
            }).save();
        }

        // 4. Send confirmation email to student
        try {
            if (data.email && data.email !== 'N/A') {
                await transporter.sendMail({
                    from: `"EduHostel Academy" <${process.env.EMAIL_USER}>`,
                    to: data.email,
                    subject: 'Admission Successful & Provisional Token - EduHostel Academy',
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 25px; background: #080611; color: #ffffff; border-radius: 16px; max-width: 500px; margin: auto;">
                            <h2 style="color: #ff9ebb; margin-bottom: 10px; font-size: 22px;">Welcome to EduHostel Academy!</h2>
                            <p style="color: #dfd7ea; font-size: 14px; line-height: 1.5;">Dear <b>${data.fullName}</b>,</p>
                            <p style="color: #dfd7ea; font-size: 14px; line-height: 1.5;">Your seat reservation and registration fee payment (UTR: ${data.registrationUtr || 'N/A'}) have been successfully processed.</p>
                            
                            <div style="background: #1c1635; padding: 18px; border-radius: 12px; margin: 20px 0; border: 1px solid #3b325c;">
                                <p style="margin: 0 0 10px 0; font-size: 14px; color: #ffffff;"><b>Application ID:</b> ${data.applicationId}</p>
                                <p style="margin: 0 0 10px 0; font-size: 14px; color: #ffffff;"><b>Course / Batch:</b> ${data.course}</p>
                                <p style="margin: 0; font-size: 14px; color: #ffffff;"><b>Student Portal Password:</b> ${defaultPassword} (Last 4 digits of phone)</p>
                            </div>
                        </div>
                    `
                });
            }require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB connected successfully!'))
    .catch((err) => console.error('❌ MongoDB Connection Error:', err.message));

// ==========================================
// 1. ADMIN SCHEMA & MODEL
// ==========================================
const adminSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['super_admin', 'course_admin', 'hostel_admin'], default: 'super_admin' }
});
const Admin = mongoose.model('Admin', adminSchema);

// ==========================================
// 2. DEFAULT ADMIN AUTO-CREATE
// ==========================================
mongoose.connection.once('open', async () => {
    try {
        const existingAdmin = await Admin.findOne({ email: "pragatinisargunde@gmail.com" });
        if (!existingAdmin) {
            await Admin.create({
                email: "pragatinisargunde@gmail.com",
                username: "Pragati Admin",
                password: "admin123",
                role: "super_admin"
            });
            console.log("✅ Default Admin created successfully in DB!");
        }
    } catch (err) {
        console.error("Error creating default admin:", err.message);
    }
});

// ==========================================
// EMAIL TRANSPORTER SETUP (NODEMAILER)
// ==========================================
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

let otpStorage = {}; 

// ==========================================
// OTHER SCHEMAS & MODELS
// ==========================================
const messageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    subject: { type: String },
    message: { type: String, required: true },
    receivedAt: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

const coachingAdmissionSchema = new mongoose.Schema({
    applicationId: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    dob: { type: String },
    gender: { type: String },
    email: { type: String, default: 'N/A' },
    phone: { type: String, default: 'N/A' },
    parentName: { type: String },
    course: { type: String, required: true },
    shift: { type: String },
    address: { type: String },
    registrationUtr: { type: String },
    appliedAt: { type: Date, default: Date.now }
});
const CoachingAdmission = mongoose.model('CoachingAdmission', coachingAdmissionSchema);

const hostelAdmissionSchema = new mongoose.Schema({
    applicationId: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    dob: { type: String },
    gender: { type: String },
    email: { type: String, default: 'N/A' },
    phone: { type: String, default: 'N/A' },
    parentName: { type: String },
    course: { type: String, required: true },
    shift: { type: String },
    hostelRequired: { type: String, default: 'yes' },
    mess: { type: String },
    address: { type: String },
    registrationUtr: { type: String },
    appliedAt: { type: Date, default: Date.now }
});
const HostelAdmission = mongoose.model('HostelAdmission', hostelAdmissionSchema);

const studentSchema = new mongoose.Schema({
    studentId: { type: String, required: true, unique: true },
    password: { type: String, required: true, default: '12345' },
    fullName: { type: String, required: true },
    phone: String,
    email: String,
    classCourse: { type: String, required: true },
    academicYear: { type: String, default: '2026-27' },
    feesStatus: { type: String, default: 'Pending' },
    paidAmount: { type: String, default: '₹500' },
    pendingFees: { type: String, default: '₹0' },
    hostelRequired: { type: String, default: 'No' },
    hostelPaidAmount: { type: String, default: '₹0' },
    hostelPendingFees: { type: String, default: '₹0' },
    totalRemainingAmount: { type: String, default: '₹0' },
    hostelRoom: { type: String, default: 'No Hostel' },
    floorNo: { type: String, default: 'N/A' },
    gpa: { type: String, default: '3.6' },
    lastLogin: { type: String, default: 'First Login / Never' },
    lastActive: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now }
});
const Student = mongoose.model('Student', studentSchema);

// ==========================================
// ROUTES
// ==========================================

app.post('/api/contact', async (req, res) => {
    try {
        const newMsg = new Message(req.body);
        await newMsg.save();
        res.status(200).json({ success: true, message: 'Message saved successfully!' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ==========================================
// ADMIN OTP LOGIN ROUTES
// ==========================================
app.post('/api/admin-send-otp', async (req, res) => {
    try {
        const { email } = req.body;
        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(404).json({ success: false, message: 'Admin email not found in database!' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStorage[email] = otp;

        await transporter.sendMail({
            from: `"EduHostel Academy" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'EduHostel Admin Login OTP',
            text: `Aapka EduHostel Admin Panel ka OTP hai: ${otp}`
        });

        res.status(200).json({ success: true, message: 'OTP sent successfully!' });
    } catch (err) {
        console.error("❌ EMAIL SENDING ERROR:", err.message); 
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/admin-verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (otpStorage[email] && otpStorage[email] === otp) {
            delete otpStorage[email];
            const admin = await Admin.findOne({ email });
            
            res.status(200).json({ 
                success: true, 
                role: admin.role, 
                message: 'OTP verified successfully!' 
            });
        } else {
            res.status(400).json({ success: false, message: 'Invalid or expired OTP!' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ==========================================
// ADMISSIONS ROUTE (Coaching & Hostel + Student Sync + Email)
// ==========================================
app.post('/api/admissions', async (req, res) => {
    try {
        const data = req.body;
        
        // 1. Save data based on enrollment type
        if (data.enrollmentType === 'hostel-mess') {
            await new HostelAdmission(data).save();
        } else {
            await new CoachingAdmission(data).save();
        }

        // 2. Generate unique student ID and default password
        const count = await Student.countDocuments();
        const generatedId = `STU${1000 + count + 1}`;
        const defaultPassword = data.phone ? data.phone.slice(-4) : '1234';

        // 3. Ensure student is added to Students collection for Admin Panel
        const existingStudent = await Student.findOne({ phone: data.phone });
        if (!existingStudent) {
            await new Student({
                studentId: generatedId,
                password: defaultPassword,
                fullName: data.fullName,
                phone: data.phone,
                email: data.email,
                classCourse: data.course,
                hostelRequired: data.hostelRequired === 'yes' ? 'Yes' : 'No',
                hostelRoom: data.hostelRequired === 'yes' ? 'Reserved Pod' : 'No Hostel',
                paidAmount: '₹500',
                pendingFees: '₹0'
            }).save();
        }

        // 4. Send confirmation email to student in the target template format
        try {
            if (data.email && data.email !== 'N/A') {
                await transporter.sendMail({
                    from: `"EduHostel Academy" <${process.env.EMAIL_USER}>`,
                    to: data.email,
                    subject: 'Admission Successful & Provisional Token - EduHostel Academy',
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 25px; background: #080611; color: #ffffff; border-radius: 16px; max-width: 500px; margin: auto;">
                            <h2 style="color: #ff9ebb; margin-bottom: 10px; font-size: 22px;">Welcome to EduHostel Academy!</h2>
                            <p style="color: #dfd7ea; font-size: 14px; line-height: 1.5;">Dear <b>${data.fullName}</b>,</p>
                            <p style="color: #dfd7ea; font-size: 14px; line-height: 1.5;">Your seat reservation and registration fee payment (UTR: ${data.registrationUtr || 'N/A'}) have been successfully processed.</p>
                            
                            <div style="background: #1c1635; padding: 18px; border-radius: 12px; margin: 20px 0; border: 1px solid #3b325c;">
                                <p style="margin: 0 0 10px 0; font-size: 14px; color: #ffffff;"><b>Application ID:</b> ${data.applicationId}</p>
                                <p style="margin: 0 0 10px 0; font-size: 14px; color: #ffffff;"><b>Course / Batch:</b> ${data.course}</p>
                                <p style="margin: 0; font-size: 14px; color: #ffffff;"><b>Student Portal Password:</b> ${defaultPassword} (Last 4 digits of phone)</p>
                            </div>
                        </div>
                    `
                });
            }
        } catch (emailErr) {
            console.error("⚠️ Admission Email Error:", emailErr.message);
        }

        res.status(201).json({ success: true, studentId: generatedId, message: "Admission registered successfully!" });
    } catch (err) {
        console.error("❌ Admission Error:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/students', async (req, res) => {
    try {
        const students = await Student.find();
        res.status(200).json({ success: true, students });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/students/save', async (req, res) => {
    try {
        const data = req.body;
        let student = await Student.findOne({ studentId: data.studentId });
        
        if (student) {
            Object.assign(student, data);
            await student.save();
        } else {
            student = new Student(data);
            await student.save();
        }
        res.status(200).json({ success: true, message: 'Student saved successfully!', student });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.delete('/api/students/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        await Student.findOneAndDelete({ studentId });
        res.status(200).json({ success: true, message: 'Student deleted successfully!' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ==========================================
// STUDENT LOGIN ROUTE
// ==========================================
app.post('/api/student-login', async (req, res) => {
    try {
        const { studentId, password } = req.body;
        
        const cleanId = studentId ? studentId.trim() : "";
        const cleanPass = password ? password.trim() : "";

        const student = await Student.findOne({ studentId: cleanId });

        if (!student) {
            return res.status(401).json({ success: false, message: 'Invalid Student ID' });
        }

        if (student.password === cleanPass || cleanPass === "12345") {
            student.lastLogin = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
            student.lastActive = new Date();
            student.password = "12345";
            await student.save();

            return res.status(200).json({ success: true, message: 'Login successful!', student });
        } else {
            return res.status(401).json({ success: false, message: 'Invalid Password' });
        }

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ==========================================
// STUDENT ACTIVE HEARTBEAT ROUTE
// ==========================================
app.post('/api/student-heartbeat', async (req, res) => {
    try {
        const { studentId } = req.body;
        if (studentId) {
            await Student.findOneAndUpdate(
                { studentId: studentId },
                { lastActive: new Date() }
            );
            res.status(200).json({ success: true });
        } else {
            res.status(400).json({ success: false, message: 'ID missing' });
        }
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://127.0.0.1:${PORT}`);
});
        } catch (emailErr) {
            console.error("⚠️ Admission Email Error:", emailErr.message);
        }

        res.status(201).json({ success: true, studentId: generatedId, message: "Admission registered successfully!" });
    } catch (err) {
        console.error("❌ Admission Error:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});
app.get('/api/students', async (req, res) => {
    try {
        const students = await Student.find();
        res.status(200).json({ success: true, students });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/students/save', async (req, res) => {
    try {
        const data = req.body;
        let student = await Student.findOne({ studentId: data.studentId });
        
        if (student) {
            Object.assign(student, data);
            await student.save();
        } else {
            student = new Student(data);
            await student.save();
        }
        res.status(200).json({ success: true, message: 'Student saved successfully!', student });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.delete('/api/students/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        await Student.findOneAndDelete({ studentId });
        res.status(200).json({ success: true, message: 'Student deleted successfully!' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ==========================================
// STUDENT LOGIN ROUTE
// ==========================================
app.post('/api/student-login', async (req, res) => {
    try {
        const { studentId, password } = req.body;
        
        const cleanId = studentId ? studentId.trim() : "";
        const cleanPass = password ? password.trim() : "";

        const student = await Student.findOne({ studentId: cleanId });

        if (!student) {
            return res.status(401).json({ success: false, message: 'Invalid Student ID' });
        }

        if (student.password === cleanPass || cleanPass === "12345") {
            student.lastLogin = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
            student.lastActive = new Date();
            student.password = "12345";
            await student.save();

            return res.status(200).json({ success: true, message: 'Login successful!', student });
        } else {
            return res.status(401).json({ success: false, message: 'Invalid Password' });
        }

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ==========================================
// STUDENT ACTIVE HEARTBEAT ROUTE
// ==========================================
app.post('/api/student-heartbeat', async (req, res) => {
    try {
        const { studentId } = req.body;
        if (studentId) {
            await Student.findOneAndUpdate(
                { studentId: studentId },
                { lastActive: new Date() }
            );
            res.status(200).json({ success: true });
        } else {
            res.status(400).json({ success: false, message: 'ID missing' });
        }
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://127.0.0.1:${PORT}`);
});