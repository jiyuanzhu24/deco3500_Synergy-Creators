const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer'); // 用于处理文件上传
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // 托管 public 文件夹中的静态文件

// 连接 MongoDB 数据库
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));

// 创建用户模型
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
});
const User = mongoose.model('User', userSchema);

// 创建图片上传模型
const uploadSchema = new mongoose.Schema({
    username: String,
    subject: String,
    imagePath: String,
    timestamp: { type: Date, default: Date.now }
});
const Upload = mongoose.model('Upload', uploadSchema);

// 设置 multer 存储配置
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads'); // 上传的图片将存储在 public/uploads 文件夹中
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // 使用时间戳避免文件名冲突
    }
});
const upload = multer({ storage });

// 注册路由
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.redirect('/login.html'); // 注册成功后重定向到登录页面
});

// 登录路由
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
        return res.status(400).json({ success: false, message: 'User not found' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Incorrect password' });
    }
    // 生成 token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // 返回登录成功的 JSON 响应
    res.json({ success: true, username: user.username, token });
});

// 上传图片路由
app.post('/upload', upload.single('image'), async (req, res) => {
    const { username, subject } = req.body;
    const imagePath = `/uploads/${req.file.filename}`;

    // 存储图片及信息到数据库
    const newUpload = new Upload({
        username,
        subject,
        imagePath
    });
    await newUpload.save();

    res.json({ success: true, imagePath, subject, username });
});

// 获取所有上传的图片及信息
app.get('/uploads', async (req, res) => {
    const uploads = await Upload.find().sort({ timestamp: -1 });
    res.json(uploads);
});

// 评论提交路由 (确保用户已经登录)
app.post('/submit-comment', async (req, res) => {
    const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;
    
    if (!token) {
        return res.status(401).send('No token provided');
    }

    const { comment } = req.body;

    // 验证用户 token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).send('User not found');
        }

        // 创建并保存评论
        const newComment = new Comment({
            username: user.username,
            comment
        });
        await newComment.save();

        res.status(200).send('Comment submitted');
    } catch (err) {
        res.status(401).send('Invalid token');
    }
});

// 获取所有评论的路由
app.get('/comments', async (req, res) => {
    const comments = await Comment.find().sort({ timestamp: -1 });
    res.json(comments);
});

// 监听端口
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
