const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');  // 添加这一行
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // 托管 public 文件夹中的静态文件

// 连接 MongoDB 数据库
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));

// 设置文件上传的配置
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');  // 上传目录（确保 Heroku 使用云存储代替本地）
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);  // 设置文件名
    }
});
const upload = multer({ storage: storage });  // 定义 `upload`

// 创建用户模型
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
});
const User = mongoose.model('User', userSchema);

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
    res.json({ success: true, username: user.username, token }); // 返回 token
});

// 上传花园图片路由
app.post('/upload-garden', upload.single('garden_photo'), async (req, res) => {
    const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;
    
    if (!token) {
        return res.status(401).send('No token provided');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).send('User not found');
        }

        const imgPath = `/uploads/${req.file.filename}`;
        const gardenPageContent = `
        <!DOCTYPE HTML>
        <html>
          <head>
            <title>Garden Photo</title>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
            <link rel="stylesheet" href="/main.css" />
          </head>
          <body class="is-preload">
        
            <!-- Header -->
            <section id="header">
              <header>
                <span class="image avatar"><img src="images/avatar.jpg" alt="" /></span>
                <h1 id="logo"><a href="#">${user.username}</a></h1>
                <p>I got reprogrammed by a rogue AI<br /> and now I'm totally cray</p>
              </header>
              <nav id="nav">
                <ul>
                  <li><a href="#one" class="active">About</a></li>
                  <li><a href="#two">Things I Can Do</a></li>
                  <li><a href="#three">Collaborative garden design</a></li>
                  <li><a href="#four">Generate your garden</a></li>
                </ul>
              </nav>
              <footer>
                <ul class="icons">
                  <li><a href="#" class="icon brands fa-twitter"><span class="label">Twitter</span></a></li>
                  <li><a href="#" class="icon brands fa-facebook-f"><span class="label">Facebook</span></a></li>
                  <li><a href="#" class="icon brands fa-instagram"><span class="label">Instagram</span></a></li>
                  <li><a href="#" class="icon brands fa-github"><span class="label">Github</span></a></li>
                  <li><a href="#" class="icon solid fa-envelope"><span class="label">Email</span></a></li>
                </ul>
              </footer>
            </section>
        
            <!-- Wrapper -->
            <div id="wrapper">
              <!-- Main -->
              <div id="main">
                <!-- One -->
                <section id="one">
                  <div class="container">
                    <header class="major">
                      <h2>Garden Photo</h2>
                      <p>Upload your garden photo and share your design.</p>
                    </header>
        
                    <!-- 用户上传的花园照片 -->
                    <div class="photo-display">
                        <img src="${imgPath}" alt="User's Garden Photo" style="max-width: 100%; height: auto;" />
                      </div>
                    </div>
                  </section>
        
        <!-- 评论区 -->
        <section id="comments">
            <div class="container">
              <h3>Comments</h3>
              <div class="comment-box">
                <textarea id="commentText" placeholder="Write your comment here..."></textarea>
                <button type="submit" class="button primary" onclick="submitComment()">Submit Comment</button>
              </div>
              <div class="existing-comments">
                <h4>Previous Comments</h4>
                <ul id="commentList">
                  <!-- 评论列表将在这里动态加载 -->
                </ul>
              </div>
            </div>
          </section>
              </div>
            </div>
            <!-- Footer -->
            <section id="footer">
                <div class="container">
                  <ul class="copyright">
                    <li>&copy; Untitled. All rights reserved.</li><li>Design: <a href="http://html5up.net">HTML5 UP</a></li>
                  </ul>
                </div>
              </section>
          
            </body>
          </html>
        `;

        const pagePath = `./public/pages/garden_page_${user._id}.html`;

        fs.writeFile(pagePath, gardenPageContent, (err) => {
            if (err) {
                console.error('Error generating page:', err);
                return res.status(500).send('Error generating page.');
            }

            // 返回生成的页面 URL
            res.json({ success: true, pageUrl: `/pages/garden_page_${user._id}.html` });
        });
    } catch (err) {
        res.status(401).send('Invalid token');
    }
});

// 监听端口
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
