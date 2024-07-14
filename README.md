
# Hobbscussion

A simple networking app for people to come together, discuss, and collaborate on projects!


## Deployment

To deploy this project:

1. Download the zip file
2. Unzip
3. Open command prompt in the unzipped folder
4. ``npm install``
5. Open a command prompt in both my-app and express-app
6. run ``npm i`` in my-app, then run ``npm dev`` in my-app
7. run ``node .`` in express-app

Now, the react website should be running at localhost:3000, and the api should be running at localhost:9000


## Dependencies Used
- React
- NextJS
- Tailwind
- Font Awesome
- NPM
  - bcrypt: for hashing passwords
  - cookie: for parsing and handling browser cookies
  - cors: for enabling communication between the React app and the server
  - cross-fetch: to make sure fetch is possible in all environments
  - express: handling server requests
  - mongodb: for storing user data, community data, and posts
  - uuid: for creating unique ids for data

## Future Improvements

- Change MongoDB format
  - Currently, the MongoDB has posts nested within the communities and profiles. I'd like to later change this so that all posts are contained within one table, and so that posts are fetched based on community / user
- Add email verification
- Add settings
- Add different sorting methods for posts in profiles and communities
- Add a commenting feature
- Make UI more user friendly

## Acknowledgements

 - Discord
 - Twitter
 - Reddit
 - Threads
 - [João Henrique from FreeCodeCamp](https://www.freecodecamp.org/news/create-a-react-frontend-a-node-express-backend-and-connect-them-together-c5798926047c/)
 - [Scott Arciszewski via Stack Exchange](https://security.stackexchange.com/questions/44/how-to-securely-implement-a-remember-me-feature/109439#109439)


## API Reference
These are the API routes for the server located at PORT:3000

### `GET /`
Redirects to the React app's homepage.

### `POST /register`
Registers a new user.

| Parameter           | Type    | Description                          | Required |
|---------------------|---------|--------------------------------------|----------|
| `username`          | string  | The username of the new user.        | Yes      |
| `email`             | string  | The email of the new user.           | Yes      |
| `password`          | string  | The password of the new user.        | Yes      |
| `confirmedPassword` | string  | Confirmation of the password.        | Yes      |
| `tos`               | boolean | Agreement to the terms of service.   | Yes      |

### `POST /login`
Authenticates a user and returns a session cookie.

| Parameter    | Type    | Description                     | Required |
|--------------|---------|---------------------------------|----------|
| `username`   | string  | The username of the user.       | Yes      |
| `password`   | string  | The password of the user.       | Yes      |
| `rememberMe` | boolean | Whether to remember the user.   | No       |

### `POST /verifyCookie`
Verifies if a session cookie is valid.

| Parameter   | Type   | Description                               | Required |
|-------------|--------|-------------------------------------------|----------|
| `session_id`| string | The session cookie to verify.             | Yes      |
| `id`        | string | The user ID to verify against the cookie. | Yes      |

### `POST /community/create`
Creates a new community.

| Parameter     | Type    | Description                       | Required |
|---------------|---------|-----------------------------------|----------|
| `name`        | string  | The name of the community.        | Yes      |
| `icon`        | string  | The icon of the community.        | No       |
| `description` | string  | The description of the community. | Yes      |
| `owner`       | string  | The ID of the user creating the community. | Yes |

### `POST /community/join`
Allows a user to join a community.

| Parameter     | Type    | Description                       | Required |
|---------------|---------|-----------------------------------|----------|
| `communityId` | string  | The ID of the community to join.  | Yes      |

### `POST /community/leave`
Allows a user to leave a community.

| Parameter     | Type    | Description                        | Required |
|---------------|---------|------------------------------------|----------|
| `communityId` | string  | The ID of the community to leave.  | Yes      |

### `GET /community/:communityId/posts/:postId`
Retrieves a specific post from a community.

| Parameter     | Type    | Description                       | Required |
|---------------|---------|-----------------------------------|----------|
| `communityId` | string  | The ID of the community.          | Yes      |
| `postId`      | string  | The ID of the post.               | Yes      |

### `POST /community/:id/post`
Creates a new post in a community.

| Parameter  | Type    | Description                       | Required |
|------------|---------|-----------------------------------|----------|
| `id`       | string  | The ID of the community.          | Yes      |
| `title`    | string  | The title of the post.            | Yes      |
| `content`  | string  | The content of the post.          | Yes      |
| `userId`   | string  | The ID of the user creating the post. | Yes |

### `GET /community/:id`
Gets info on a community

| Parameter  | Type    | Description                       | Required |
|------------|---------|-----------------------------------|----------|
| `id`       | string  | The ID of the community.          | Yes      |

### `GET /profile/self`
Gets the profile corresponding to the authorization token provided

| Parameter  | Type    | Description                       | Required |
|------------|---------|-----------------------------------|----------|
| `authorization (via headers)`       | string  | The User's Session ID          | Yes      |

### `POST /profile/post`
Create a new post in a user's profile

| Parameter  | Type    | Description                       | Required |
|------------|---------|-----------------------------------|----------|
| `author`       | string  | The post's author          | Yes      |
| `title`       | string  | The post's title          | Yes      |
| `content`       | string  | The post's content          | Yes      |
| `authorization (via headers)`       | string  | The User's Session ID          | Yes      |

### `GET /profile/:userId/posts`
Gets a user's profile's posts

| Parameter  | Type    | Description                       | Required |
|------------|---------|-----------------------------------|----------|
| `userId`       | string  | The ID of the user.          | Yes      |

### `GET /profile/:userId/posts/:postId`
Gets a specific post from a user

| Parameter  | Type    | Description                       | Required |
|------------|---------|-----------------------------------|----------|
| `userId`       | string  | The ID of the user.          | Yes      |
| `postId`       | string  | The ID of the post.          | Yes      |

### `GET /profile/:id`
Gets a specific user

| Parameter  | Type    | Description                       | Required |
|------------|---------|-----------------------------------|----------|
| `id`       | string  | The ID of the user.          | Yes      |

### `GET /posts/popular`
Gets posts currently popular and sorted via a popularity function

| Parameter  | Type    | Description                       | Required |
|------------|---------|-----------------------------------|----------|

### `GET community/popular`
Gets communities currently popular and sorted via a popularity function

| Parameter  | Type    | Description                       | Required |
|------------|---------|-----------------------------------|----------|

### `GET /home/communities`
Gets a list of communities for the home page

| Parameter  | Type    | Description                       | Required |
|------------|---------|-----------------------------------|----------|
| `authorization (via headers)`       | string  | The User's Session ID          | Yes      |

### `GET /search`
Searches users' profiles, communities, and posts for a specific keyword

| Parameter  | Type    | Description                       | Required |
|------------|---------|-----------------------------------|----------|
| `q`       | string  | The query of the search          | Yes      |