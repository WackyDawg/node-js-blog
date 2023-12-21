const express = require('express')
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const stripTags = require('strip-tags');
const fs = require('fs');
const path = require('path');
const mongoose  = require('mongoose')



var multer = require('multer');



const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

  
const jwtSecret = process.env.JWT_SECRET;


const adminLayout = '../views/layouts/admin'

//multer Configuration 

router.get('/admin', async (req, res) => {
    try {
        const locals = {
            title: "",
            description: ""
        }
        const allTags = await Post.distinct('tags');
        const latestPosts = await Post.find().sort({ createdAt: -1 }).limit(10);


        res.render('admin/index', { locals, allTags, latestPosts, layout: adminLayout })
    } catch (error) {
        console.log(error);
    }
})

// router.get('/my-profile/:id', async (req, res) => {
//     try {
//         const allTags = await Post.distinct('tags');
//         const latestPosts = await Post.find().sort({ createdAt: -1 }).limit(10);

//         const userId = req.params.id.trim();
//         if (!mongoose.Types.ObjectId.isValid(userId)) {
//             // Handle the case where the id is not a valid ObjectId
//             return res.status(400).send('Invalid user ID');
//         }

//         const data = await Post.findOne({ _id: userId });
//         res.render('admin/edit-post', {
//             data,
//             allTags,
//             latestPosts,
//         });
//     } catch (error) {
//         console.log(error);
//         // Handle the error as needed
//         res.status(500).send('Internal Server Error');
//     }
// });
  

//check Login
const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorised' })
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.userId = decoded.userId;
        next()
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorised' })
    }
}

// Add a new route for user profile
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const userId = req.userId; 
        const allTags = await Post.distinct('tags');
        const latestPosts = await Post.find().sort({ createdAt: -1 }).limit(10);

        // Retrieve the user information from the database
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send('User not found');
        }

        
        res.render('admin/profile', { user, allTags,latestPosts });
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});


router.get('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
        const allTags = await Post.distinct('tags');
        const latestPosts = await Post.find().sort({ createdAt: -1 }).limit(10);

        const postId = req.params.id.trim();
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            // Handle the case where the id is not a valid ObjectId
            return res.status(400).send('Invalid post ID');
        }

        const data = await Post.findOne({ _id: postId });
        res.render('admin/edit-post', {
            data,
            allTags,
            latestPosts,
        });
    } catch (error) {
        console.log(error);
        // Handle the error as needed
        res.status(500).send('Internal Server Error');
    }
});

router.put('/edit-post/:id', authMiddleware, upload.array('images', 5), async (req, res) => {
    try {
        const postId = req.params.id.trim();
        console.log('Trimmed Post ID:', postId);

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            console.log('Invalid Post ID:', postId);
            return res.status(400).send('Invalid post ID');
        }

        // Extract file paths directly from req.files
        const images = req.files ? req.files.map((file) => `/uploads/${file.filename}`) : [];

        // Use req.body to get other form fields
        const { title, insertMedia } = req.body;

        const updatedPost = await Post.findByIdAndUpdate(postId, {
            title: title,
            images: images,
            insertMedia: insertMedia,
            updatedAt: Date.now(),
        }, { new: true }); // Ensure you get the updated document

        console.log('Updated Post:', updatedPost);

        res.redirect(`/edit-post/${postId}`);
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});


 


// Login Check
router.post('/admin', async (req, res) => {
    try {
        const { username, password } = req.body;
        //const allTags = await Post.distinct('tags');
        //const latestPosts = await Post.find().sort({ createdAt: -1 }).limit(10);

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid Credentials' })
        }
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid Credentials' })
        }
        const token = jwt.sign({ userId: user._id }, jwtSecret);
        res.cookie('token', token, { httpOnly: true })
        res.redirect('/dashboard',)
    } catch (error) {
        console.log(error);
    }
})

router.get('/dashboard', authMiddleware, async (req, res) => {
    const allTags = await Post.distinct('tags');
    const latestPosts = await Post.find().sort({ createdAt: -1 }).limit(10);
    const data = await Post.find();
    res.render('admin/dashboard', { data, allTags, latestPosts })
})

router.post('/add-post', authMiddleware, upload.array('images', 5), async (req, res) => {
    try {
        // Extract file paths directly from req.files
        const images = req.files ? req.files.map((file) => `/uploads/${file.filename}`) : [];
        // Use a default empty array for tags if it's not provided in the request body
        const tags = req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [];

        // Use destructuring to get specific form fields
        const { title, insertMedia } = req.body;

        

        //const tagsArray = tags ? tags : [];

        const newPost = new Post({
            title: title,
            tags: tags,
            images: images,
            insertMedia: insertMedia,
        });

        await Post.create(newPost);
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
        // Handle errors appropriately
        res.status(500).send("Internal Server Error");
    }
});



router.get('/add-post', authMiddleware, async (req, res) => {
    const allTags = await Post.distinct('tags');
    const latestPosts = await Post.find().sort({ createdAt: -1 }).limit(10);
    const data = await Post.find();
    res.render('admin/add-post', { data, allTags, latestPosts })
})





// Login Check
// router.post('/admin', async (req, res) => {
//     try {
//       const { username, password } = req.body;
//     if (req.body.username === 'admin' && req.body.password === 'password') {
//         res.send('Login sucessfull')
//     }
//     else {
//        res.send('wrong credentials')
//     }

//       res.redirect('/admin');
//     } catch (error) {
//         console.log(error);
//     }
// })

//admin register
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const user = await User.create({ username, password: hashedPassword })
            res.status(201).json({ message: "User Created Successfully", user })
        } catch (error) {
            if (error.code === 11000) {
                res.status(409).json({ message: 'User already exists' })
            } else {
                res.status(500).json({ message: "Internal server error " })
            }
        }
        res.redirect('/admin');
    } catch (error) {
        console.log(error);
    }
})

module.exports = router;