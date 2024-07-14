const cookie = require('cookie');

function postToCommunity({e, document, setPosts, posts, id}) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const title = formData.get('title');
    const content = formData.get('content');
    console.log('Posting to community:', title, content);

    var cookies = cookie.parse(document.cookie);
    console.log(cookies);
    if (!cookies.session_id) return alert('Your authentication token is missing. Please try signing out and in again.');
    var [userId, dateCreated, hashedToken] = cookies.session_id.split('.');
    userId = atob(userId);

    try {
        fetch(`http://localhost:9000/community/${id}/post`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + cookies.session_id,
            },
            body: JSON.stringify({
                title: title,
                content: content,
                userId: userId,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                console.log('Posted to community:', data);
                setPosts(Array.isArray(posts) ? [...posts, data.post] : [data.post]);
            })
            .catch((error) => {
                console.error('Error posting to community:', error);
            });
    } catch (error) {
        console.error('Error:', error);
    }
}

export default postToCommunity;