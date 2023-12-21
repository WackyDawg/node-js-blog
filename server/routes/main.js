const express = require('express')
const router = express.Router();
const mongoose = require('mongoose');
const Post = require('../models/Post');



router.get('/', async (req, res) => {
    try {
        const locals = {
            title: "Groovy Blog",
            description: "This is my blog"
        };

        let perPage = 6;
        let page = req.query.page || 1;

        // Check if tags are provided in the query parameters
        const tags = req.query.tags ? req.query.tags.split(',') : [];

        // Use tags to filter posts
        const query = tags.length > 0 ? { tags: { $in: tags } } : {};

        const data = await Post.aggregate([
            { $match: query },
            { $sort: { createdAt: -1 } }
        ])
            .skip(perPage * page - perPage)
            .limit(perPage)
            .exec();

        const count = await Post.countDocuments(query);
        const totalPages = Math.ceil(count / perPage);
        const nextPage = parseInt(page) + 1;
        const latestPosts = await Post.find().sort({ createdAt: -1 }).limit(10);
        const hasNextPage = nextPage <= totalPages;
        const allTags = await Post.distinct('tags');


        res.render("index", {
            locals,
            data,
            latestPosts,
            current: page,
            nextPage: hasNextPage ? nextPage : null,
            totalPages: totalPages,
            allTags,
            selectedTags: tags
        });
    } catch (error) {
        console.log(error);
    }
});

router.post('/search', async (req, res) => {    
    try {
        const locals = {
            title: "Search",
            description: "",
        }

        let searchTerm = req.body.searchTerm;
        const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "")
        const latestPosts = await Post.find().sort({ createdAt: -1 }).limit(10);
        const allTags = await Post.distinct('tags');



        const data = await Post.find({
            $or: [
                { title: { $regex: new RegExp(searchNoSpecialChar, '') }},
                { body: { $regex: new RegExp(searchNoSpecialChar, '') }},
            ]
        });

        res.render("search", {
            data,
            locals,
            latestPosts,
            allTags,
            searchTerm
        });
    } catch (error) {
     console.log(error)   
    }
})



// function insertPostData() {
//     Post.insertMany([
//         {
//             "title": "The Future of Artificial Intelligence: Trends and Predictions",
//             "body": "Explore the latest trends and predictions in the field of artificial intelligence, covering advancements, applications, and potential impact on industries.",
//             "tags": ["AI", "Trends", "Predictions"]
//         },
//         {
//             "title": "Blockchain Beyond Cryptocurrency: Real-World Applications",
//             "body": "Dive into the real-world applications of blockchain technology beyond cryptocurrencies, discussing its potential in various industries such as finance, supply chain, and healthcare.",
//             "tags": ["AI", "Trends", "Predictions"]
//         },
//         {
//             "title": "The Rise of Edge Computing and its Impact on Technology",
//             "body": "Examine the rise of edge computing and its transformative impact on technology, exploring use cases, benefits, and challenges in a connected world.",
//             "tags": ["AI", "Trends", "Predictions"]
//         },
//         {
//             "title": "Exploring the Potential of Quantum Computing",
//             "body": "Delve into the world of quantum computing, discussing its potential applications, current developments, and the challenges it presents to traditional computing paradigms.",
//             "tags": ["AI", "Trends", "Predictions"]

//         },
//         {
//             "title": "The Role of 5G in Revolutionizing Connectivity",
//             "body": "Explore the revolutionary impact of 5G technology on connectivity, examining its implications for industries, IoT, and the overall digital landscape.",
//             "tags": ["AI", "Trends", "Predictions"]

//         },
//         {
//             "title": "Cybersecurity in the Age of Remote Work: Challenges and Solutions",
//             "body": "Address the challenges and solutions associated with cybersecurity in the era of remote work, covering best practices, emerging threats, and the importance of a secure digital environment.",
//             "tags": ["AI", "Trends", "Predictions"]

//         },
//         {
//             "title": "Augmented Reality vs. Virtual Reality: A Comparative Analysis",
//             "body": "Conduct a comparative analysis of augmented reality and virtual reality, exploring their differences, applications, and the evolving landscape of immersive technologies.",
//             "tags": ["AI", "Trends", "Predictions"]

//         },
//         {
//             "title": "The Evolution of Cloud Computing: Current State and Future Prospects",
//             "body": "Trace the evolution of cloud computing, discussing its current state, key trends, and future prospects in powering the digital infrastructure of businesses and organizations.",
//             "tags": ["AI", "Trends", "Predictions"]

//         },
//         {
//             "title": "Understanding the Internet of Things (IoT) Ecosystem",
//             "body": "Provide an in-depth understanding of the Internet of Things (IoT) ecosystem, covering devices, connectivity, and the transformative impact of IoT on industries and daily life.",
//             "tags": ["AI", "Trends", "Predictions"]

//         },
//         {
//             "title": "The Impact of Machine Learning on Healthcare",
//             "body": "Explore the impact of machine learning in healthcare, discussing applications such as diagnostics, personalized medicine, and the potential for improving patient outcomes.",
//             "tags": ["AI", "Trends", "Predictions"]

//         },
//         {
//             "title": "Eco-Friendly Tech: Innovations in Sustainable Technology",
//             "body": "Highlight innovations in eco-friendly technology, showcasing sustainable practices, green energy solutions, and the role of technology in addressing environmental challenges.",
//             "tags": ["AI", "Trends", "Predictions"]

//         },
//         {
//             "title": "The Battle of Virtual Assistants: Siri, Alexa, Google Assistant, and Beyond",
//             "body": "Examine the competition and advancements in virtual assistant technologies, comparing popular platforms like Siri, Alexa, and Google Assistant, and their impact on user interactions.",
//             "tags": ["AI", "Trends", "Predictions"]

//         },
//         {
//             "title": "The Growing Influence of DevOps in Software Development",
//             "body": "Discuss the growing influence of DevOps practices in software development, covering collaboration, automation, and the cultural shifts that contribute to efficient and agile development processes.",
//             "tags": ["AI", "Trends", "Predictions"]

//         }

//     ])
// }

// insertPostData();
function calculateReadTime(text) {
    if (!text) {
        return 0; 
    }

    const wordsPerMinute = 200;
    const wordCount = text.split(/\s+/).length;
    const readTimeMinutes = Math.ceil(wordCount / wordsPerMinute);
    return readTimeMinutes;
}

router.get('/article/:id', async (req, res) => {
    try {
        const slug = req.params.id;

        // Get the current post by ID
        const currentPost = await Post.findById(slug);

        if (!currentPost) {
            // Handle case where post is not found
            return res.status(404).send("Post not found");
        }
        
        currentPost.views = (currentPost.views || 0) + 1;
        await currentPost.save();

        // Get tags of the current post
        const currentPostTags = currentPost.tags || [];

        // Check if currentPostTags is an array before using $in
        const relatedPosts = currentPostTags.length > 0
            ? await Post.find({ tags: { $in: currentPostTags }, _id: { $ne: currentPost._id } })
                .limit(5) // Limit the number of related posts
            : [];

        const postUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
        const latestPosts = await Post.find().sort({ createdAt: -1 }).limit(10);
        const estimatedReadTime = calculateReadTime(currentPost.body, relatedPosts.body);
        const allTags = await Post.distinct('tags');


        // Pass the necessary data to the template
        res.render("post", { data: currentPost, postUrl, relatedPosts, latestPosts, estimatedReadTime,allTags, views: currentPost.views });
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
});

router.get('/category/:tag', async (req, res) => {
    try {
        const locals = {
            title: "Groovy Blog",
            description: "This is my blog"
        };

        let perPage = 10;
        let page = req.query.page || 1;
        const tag = req.params.tag;

        const relatedPostsPerPage = 5; // Number of related posts per page
        const relatedPosts = await Post.find({ tags: tag })
            .sort({ createdAt: -1 })
            .skip(relatedPostsPerPage * page - relatedPostsPerPage)
            .limit(relatedPostsPerPage)
            .exec();

        const totalPosts = relatedPosts.length;
        const count = await Post.countDocuments({ tags: tag });
        const totalPages = Math.ceil(count / relatedPostsPerPage);
        const nextPage = parseInt(page) + 1;
        const latestPosts = await Post.find().sort({ createdAt: -1 }).limit(10);
        const hasNextPage = nextPage <= totalPages;
        const allTags = await Post.distinct('tags');


        // Calculate estimated read times for each related post
        const estimatedReadTimes = relatedPosts.map(post => calculateReadTime(post.body));

        res.render("tag", {
            locals,
            tag,
            relatedPosts,
            totalPosts,
            latestPosts,
            allTags,
            estimatedReadTimes, // Pass the calculated read times to the template
            current: page,
            nextPage: hasNextPage ? nextPage : null,
            totalPages: totalPages,
            index: (start = relatedPostsPerPage * (page - 1)),
        });

    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
});






module.exports = router;