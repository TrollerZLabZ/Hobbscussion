// An express app that functions as the backend of a react app
require('dotenv').config();

const express = require('express');
const app = express();
const { MongoClient } = require('mongodb');
const cors = require('cors');

/**
 * setup the database
 */
const uri = process.env.MONGODB_URI;
const dbClient = new MongoClient(uri);
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: 'http://localhost:3000'
}));

app.get('/', (req, res) => {
    res.redirect('localhost:3000');
});

app.post('/register', async (req, res) => {
    console.log("hi")
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const confirmedPassword = req.body.confirmedPassword;
    const tos = req.body.tos;

    if (password !== confirmedPassword) {
        console.log(password, confirmedPassword)
        return res.send({
            success: false,
            error: 'Passwords do not match',
        });
    }

    if (tos === false) {
        return res.send({
            success: false,
            error: 'You must agree to the terms of service',
        });
    }
    const database = dbClient.db('userData');
    const userData = database.collection('users');

    // check if a user with the same username or email already exists
    const usernameQuery = {
        username: username,
    }
    const userWithSameUsername = await userData.findOne(usernameQuery);
    if (userWithSameUsername) {
        return res.send({
            success: false,
            error: 'A user with that username already exists',
        });
    }
    const emailQuery = {
        email: email,
    };
    const userWithSameEmail = await userData.findOne(emailQuery);
    if (userWithSameEmail) {
        return res.send({
            success: false,
            error: 'A user with that email already exists',
        });
    };

    const user = {
        username: username,
        email: email,
        hashedPassword: bcrypt.hashSync(password, 12),
        id: uuidv4(),
        timestampCreated: Date.now(),
        sessionCookies: []
    };

    await userData.insertOne(user);

    function toBase64(string) {
        return Buffer.from(string).toString('base64');
    }

    const sessionCookie = toBase64(user.id) + '.' + toBase64(String(Date.now())) + '.' + uuidv4(); // Basically a Discord Token
    user.sessionCookies.push({ cookie: sessionCookie, timestampCreated: Date.now() });
    await userData.updateOne({ id: user.id }, {
        $set: { sessionCookies: user.sessionCookies }
    });
    res.cookie('session_id', sessionCookie, { /* httpOnly: false, secure: true, */ maxAge: 1209600000 }); // Use secure: true in production

    console.log(user)

    return res.send({
        success: true,
        cookie: sessionCookie,
    });
});

app.post('/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const rememberMe = req.body.rememberMe;

    const database = dbClient.db('userData');
    const userData = database.collection('users');
    const user = await userData.findOne({ username: username });
    if (!user) {
        return res.send({
            success: false,
            error: 'No user with that username',
        });
    }

    if (!bcrypt.compareSync(password, user.hashedPassword)) {
        return res.send({
            success: false,
            error: 'Incorrect password',
        });
    }

    function toBase64(string) {
        return Buffer.from(string).toString('base64');
    }

    const sessionCookie = toBase64(user.id) + '.' + toBase64(String(Date.now())) + '.' + uuidv4(); // Basically a Discord Token
    user.sessionCookies.push({ cookie: sessionCookie, timestampCreated: Date.now() });
    await userData.updateOne({ id: user.id }, {
        $set: { sessionCookies: user.sessionCookies }
    });

    return res.send({
        success: true,
        cookie: sessionCookie,
    });
});

app.post('/verifyCookie', async (req, res) => {
    const session_id = req.body.session_id;
    const id = req.body.id;

    const database = dbClient.db('userData');
    const userData = database.collection('users');
    console.log(session_id)
    const user = await userData.findOne({ id: id });
    if (!user) {
        return res.send({
            success: false,
            error: 'No user with that id',
        });
    }
    console.log(user);

    const sessionCookie = user.sessionCookies.find(cookie => {
        console.log(cookie.cookie)
        console.log(session_id)
        return cookie.cookie === session_id;
    });
    if (!sessionCookie) {
        return res.send({
            success: false,
            error: 'No session with that token',
        });
    }

    return res.send({
        success: true,
    });
});

app.post('/community/create', async (req, res) => {
    // Get Authorization Header
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.send({
            success: false,
            error: 'No authorization token provided',
        });
    }
    const token = authorization.split(' ')[1];
    const database = dbClient.db('userData');
    const userData = database.collection('users');
    const user = await userData.findOne({ sessionCookies: { $elemMatch: { cookie: token } } });
    if (!user) {
        return res.send({
            success: false,
            error: 'Invalid authorization token. Try signing out and signing in again.',
        });
    }

    const name = req.body.name;
    const icon = req.body.icon || undefined;
    const description = req.body.description;
    const owner = req.body.owner;

    // Check if the user is the owner
    if (user.id !== owner) {
        return res.send({
            success: false,
            error: 'The user\'s ids do not match with the authorization header.',
        });
    }

    const communities = database.collection('communities');

    const community = {
        name: name,
        id: uuidv4(),
        description: description,
        icon: icon,
        owner: owner,
        posts: [],
        dateCreated: Date.now(),
        members: [owner],
    };
    try {
        await communities.insertOne(community);
    } catch (e) {
        console.error(e);
        return res.send({
            success: false,
            error: 'An error occurred while creating the community',
        });

    }

    console.log(community
    )
    console.log("community creation success")

    return res.send({
        success: true,
        id: community.id,
    });
});

app.post('/community/join', async (req, res) => {
    const communityId = req.body.communityId;
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.send({
            success: false,
            error: 'No authorization token provided',
        });
    }
    const token = authorization.split(' ')[1];
    const database = dbClient.db('userData');
    const userData = database.collection('users');
    const user = await userData.findOne({ sessionCookies: { $elemMatch: { cookie: token } } });
    if (!user) {
        return res.send({
            success: false,
            error: 'Invalid authorization token',
        });
    }


    const communities = database.collection('communities');
    const community = await communities.findOne({ id: communityId });
    if (!community) {
        return res.send({
            success: false,
            error: 'No community with that id',
        });
    }

    if (community.members.includes(user.id)) {
        return res.send({
            success: false,
            error: 'User is already a member of that community',
        });
    }

    community.members.push(user.id);
    await communities.updateOne({ id: community.id }, {
        $set: { members: community.members }
    });

    return res.send({
        success: true,
    });
});

app.post('/community/leave', async (req, res) => {
    const communityId = req.body.communityId;
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.send({
            success: false,
            error: 'No authorization token provided',
        });
    }
    const token = authorization.split(' ')[1];
    const database = dbClient.db('userData');
    const userData = database.collection('users');
    const user = await userData.findOne({ sessionCookies: { $elemMatch: { cookie: token } } });
    if (!user) {
        return res.send({
            success: false,
            error: 'Invalid authorization token',
        });
    }

    const communities = database.collection('communities');
    const community = await communities.findOne({ id: communityId });
    if (!community) {
        return res.send({
            success: false,
            error: 'No community with that id',
        });
    }

    if (!community.members.includes(user.id)) {
        return res.send({
            success: false,
            error: 'User is not a member of that community',
        });
    }

    // check if the user is the owner
    if (community.ownerId === user.id) {
        return res.send({
            success: false,
            error: 'The user is the owner of the community',
        });
    }

    community.members = community.members.filter(member => member !== user.id);
    await communities.updateOne({ id: community.id }, {
        $set: { members: community.members }
    });

    return res.send({
        success: true,
    });
}
);

app.get('/community/:communityId/posts/:postId', async (req, res) => {
    const communityId = req.params.communityId;
    const postId = req.params.postId;
    const database = dbClient.db('userData');
    const communities = database.collection('communities');
    const community = await communities.findOne({ id: communityId });
    if (!community) {
        return res.send({
            success: false,
            error: 'No community with that id',
        });
    }

    const post = community.posts.find(post => post.id === postId);
    if (!post) {
        return res.send({
            success: false,
            error: 'No post with that id',
        });
    }

    return res.send({
        success: true,
        post: post,
    });
})

app.post('/community/:id/post', async (req, res) => {
    const communityId = req.params.id;
    const title = req.body.title;
    const content = req.body.content;
    const userId = req.body.userId;
    const authorization = req.headers.authorization;

    if (!authorization) {
        return res.send({
            success: false,
            error: 'No authorization token provided',
        });
    }
    const token = authorization.split(' ')[1];
    const database = dbClient.db('userData');
    const userData = database.collection('users');
    const user = await userData.findOne({ sessionCookies: { $elemMatch: { cookie: token } } });
    if (!user) {
        return res.send({
            success: false,
            error: 'Invalid authorization token',
        });
    }

    const communities = database.collection('communities');
    const community = await communities.findOne({ id: communityId });
    if (!community) {
        return res.send({
            success: false,
            error: 'No community with that id',
        });
    }

    if (!community.members.includes(user.id)) {
        return res.send({
            success: false,
            error: 'User is not a member of that community',
        });
    }

    const post = {
        id: uuidv4(),
        title: title,
        content: content,
        // photo: photo,
        author: user.id,
        timestampCreated: Date.now(),
    };

    if (!community.posts) community.posts = [];
    community.posts.push(post);

    await communities.updateOne({ id: community.id }, {
        $set: { posts: community.posts }
    });

    return res.send({
        success: true,
        post: post
    });
});

app.get('/community/:id', async (req, res) => {
    const id = req.params.id;
    const database = dbClient.db('userData');
    const communities = database.collection('communities');
    const community = await communities.findOne({ id: id });
    if (!community) {
        return res.send({
            success: false,
            error: 'No community with that id',
        });
    }

    return res.send({
        success: true,
        community: community,
    });
});

app.get('/profile/self', async (req, res) => {
    // return the database entry of the user that is logged in, without the session cookies and posts limited to 10
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.send({
            success: false,
            error: 'No authorization token provided',
        });
    }
    const token = authorization.split(' ')[1];
    let [id, dateCreated, hashedToken] = token.split('.'); // [id, dateCreated, hashedToken
    id = atob(id);
    const database = dbClient.db('userData');
    const userData = database.collection('users');
    const user = await userData.findOne({ sessionCookies: { $elemMatch: { cookie: token } } });
    if (!user) {
        return res.send({
            success: false,
            error: 'Invalid authorization token',
        });
    }

    const userWithoutSessionCookies = { ...user };
    delete userWithoutSessionCookies.sessionCookies;
    delete userWithoutSessionCookies.hashedPassword;
    if (userWithoutSessionCookies.posts && Array.isArray(userWithoutSessionCookies.posts)) userWithoutSessionCookies.posts = userWithoutSessionCookies.posts.slice(0, 10);


    return res.send({
        success: true,
        user: userWithoutSessionCookies,
    });
});

app.post('/profile/post', async (req, res) => {
    const author = req.body.author;
    const title = req.body.title;
    const content = req.body.content;
    // const photo = req.body.photo; TODO
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.send({
            success: false,
            error: 'No authorization token provided',
        });
    }
    const token = authorization.split(' ')[1];
    const database = dbClient.db('userData');
    const userData = database.collection('users');
    const user = await userData.findOne({ sessionCookies: { $elemMatch: { cookie: token } } });
    if (!user) {
        return res.send({
            success: false,
            error: 'Invalid authorization token',
        });
    }

    console.log(user.id)
    console.log(author)
    if (user.id !== author) {
        return res.send({
            success: false,
            error: 'The Authentication Token doesn\'t match the author of the post',
        });
    }

    const post = {
        id: uuidv4(),
        title: title,
        content: content,
        photo: undefined,
        author: user.id,
        timestampCreated: Date.now(),
    };
    // create posts array if it doesn't exist
    if (!user.posts) {
        user.posts = [];
    }
    user.posts.push(post);

    await userData.updateOne({ id: author }, {
        $set: { posts: user.posts }
    });

    return res.send({
        success: true,
        postId: post.id
    });
});

app.get('/profile/:userId/posts', async (req, res) => {
    const userId = req.params.userId;
    const database = dbClient.db('userData');
    const userData = database.collection('users');
    const user = await userData.findOne({ id: userId });
    if (!user) {
        return res.send({
            success: false,
            error: 'No user with that id',
        });
    }

    // sort posts by popularity factor

    const posts = user.posts.sort((a, b) => {
        const aPopularity = (1 / ((Date.now() - a.timestampCreated) / (1000 * 60 * 60 * 24))) * (a.comments.length + a.likes.length + a.views * 0.04);
        const bPopularity = (1 / ((Date.now() - b.timestampCreated) / (1000 * 60 * 60 * 24))) * (b.comments.length + b.likes.length + b.views * 0.04);
        return bPopularity - aPopularity;
    });

    return res.send({
        success: true,
        posts: posts.slice(0, 10)
    });
});

app.get('/profile/:userId/posts/:postId', async (req, res) => {
    const userId = req.params.userId;
    const postId = req.params.postId;
    console.log(req.params)
    console.log(userId, postId)
    const database = dbClient.db('userData');
    const userData = database.collection('users');
    const user = await userData.findOne({ id: userId });
    if (!user) {
        return res.send({
            success: false,
            error: 'No user with that id',
        });
    }

    const post = user.posts.find(post => post.id === postId);
    if (!post) {
        return res.send({
            success: false,
            error: 'No post with that id',
        });
    }

    return res.send({
        success: true,
        post: post,
    });
});

app.get('/profile/:id', async (req, res) => {
    const id = req.params.id;
    const database = dbClient.db('userData');
    const userData = database.collection('users');
    const user = await userData.findOne({ id: id });
    if (!user) {
        return res.send({
            success: false,
            error: 'No user with that id',
        });
    }

    return res.send({
        success: true,
        user: user,
    });
});

let popularPosts = [];
let timeOfLastUpdate;

app.get('/posts/popular', async (req, res) => {
    // Check if popularPosts is empty or if the last update was more than an hour ago
    if (popularPosts.length === 0 || (Date.now() - timeOfLastUpdate) > (60 * 60 * 1000)) {
        // use popularityFactor = 1/(number of days since post was created) * (number of comments + number of likes + number of views*0.04)

        // First get all posts from all communities and users
        const database = dbClient.db('userData');
        const userData = database.collection('users');
        const communities = database.collection('communities');
        const users = await userData.find().toArray();
        const allPosts = [];
        for (const user of users) {
            if (user.posts && typeof user.posts[Symbol.iterator] === 'function') {
                allPosts.push(...user.posts);
            }
        }
        if (communities) { // probably can be removed after a community is actually made
            for (const community of await communities.find().toArray()) {
                if (community.posts && typeof community.posts[Symbol.iterator] === 'function') {
                    allPosts.push(...community.posts);
                }
            }
        }

        // if (allPosts.length === 0) return res.send({
        //     success: false,
        //     error: 'No posts found',
        // }); Change this in production

        allPosts.sort((a, b) => {
            const aPopularity = (1 / ((Date.now() - a.timestampCreated) / (1000 * 60 * 60 * 24)));
            const bPopularity = (1 / ((Date.now() - b.timestampCreated) / (1000 * 60 * 60 * 24)));
            return bPopularity - aPopularity;
        });

        popularPosts = [...allPosts];

        timeOfLastUpdate = Date.now();
    }

    var responseArray = [];
    // if (popularPosts.length === 0) return res.send({
    //     success: false,
    //     error: 'No posts found',
    // }); Change this in production
    const placeholderPosts = [
        { id: 1, title: 'Post 1', content: 'Content of post 1' },
        { id: 2, title: 'Post 2', content: 'Content of post 2' },
        { id: 3, title: 'Post 3', content: 'Content of post 3' },
    ];
    if (popularPosts.length === 0) return res.send({
        success: true,
        posts: placeholderPosts,
    })



    if (req.body.limit) {
        responseArray = popularPosts.slice(0, req.body.limit
        );
    }

    if (!req.body.limit) {
        responseArray = popularPosts.slice(0, 10);
    }



    return res.send({
        success: true,
        posts: responseArray,
    });
});

app.get('/community/popular', async (req, res) => {
    const database = dbClient.db('userData');
    const communities = database.collection('communities');
    const allCommunities = await communities.find().toArray();
    allCommunities.sort((a, b) => {
        const aPopularity = a.members.length;
        const bPopularity = b.members.length;
        return bPopularity - aPopularity;
    });

    var responseArray = [];
    if (req.body.limit) {
        responseArray = allCommunities.slice(0, req.body.limit
        );
    }

    if (!req.body.limit) {
        responseArray = allCommunities.slice(0, 10);
    }

    return res.send({
        success: true,
        communities: responseArray,
    });
});

/**
 * Gets communities specific to the user
 * Combines both popular communities and the user's communities, but prioritiezes the user's communities
 */
app.get('/home/communities', async (req, res) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.send({
            success: false,
            error: 'No authorization token provided',
        });
    }
    const token = authorization.split(' ')[1];
    const database = dbClient.db('userData');
    const userData = database.collection('users');
    const user = await userData.findOne({ sessionCookies: { $elemMatch: { cookie: token } } });
    if (!user) {
        return res.send({
            success: false,
            error: 'Invalid authorization token',
        });
    }

    const communities = database.collection('communities');
    const allCommunities = await communities.find().toArray();
    allCommunities.sort((a, b) => {
        const aPopularity = a.members.length;
        const bPopularity = b.members.length;
        if (aPopularity === bPopularity) {
            return a.timestampCreated - b.timestampCreated;
        }
        return bPopularity - aPopularity;
    });

    const userCommunities = allCommunities.filter(community => community.members.includes(user.id));
    const popularCommunities = allCommunities.filter(community => !community.members.includes(user.id));

    var responseArray = [...userCommunities, ...popularCommunities].slice(0, 10);

    return res.send({
        success: true,
        communities: responseArray,
    });
});

app.get('/search', async (req, res) => {
    const query = req.query.q;
    const database = dbClient.db('userData');
    const communities = database.collection('communities');
    const users = database.collection('users');
    const allCommunities = await communities.find().toArray();
    const allUsers = await users.find().toArray();

    const communityResults = allCommunities.filter(community => community.name.includes(query) || community.description.includes(query));
    const userResults = allUsers.filter(user => user.username.includes(query));

    // get all the posts from the communities and users, and filter them by the query
    const allPosts = [];

    for (const community of allCommunities) {
        if (community.posts && typeof community.posts[Symbol.iterator] === 'function') {
            var posts = [...community.posts];
            posts.forEach(post => {
                post.inAProfile = false;
                post.inACommunity = true;
                post.communityId = community.id;
            });
            allPosts.push(...posts);
        }
    }

    for (const user of allUsers) {
        if (user.posts && typeof user.posts[Symbol.iterator] === 'function') {
            var posts = [...user.posts];
            posts.forEach(post => {
                post.inAProfile = true;
                post.inACommunity = false;
            });
            allPosts.push(...posts);
        }
    }

    console.log(allPosts)

    const postResults = allPosts.filter(post => post.title.toLowerCase().includes(query.toLowerCase()) || post.content.toLowerCase().includes(query.toLowerCase()));


    return res.send({
        success: true,
        results: {
            communities: communityResults,
            users: userResults,
            posts: postResults,
        }
    });
});

app.listen(9000, () => {
    console.log('Server is running on http://localhost:9000');
});
