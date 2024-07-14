const cookie = require('cookie');


const postToProfile = async ({e, document, }) => {
    console.log(e)
    e.preventDefault();
    // Add logic to post to profile
    const formData = new FormData(e.target);
    const title = formData.get('title');
    const content = formData.get('content');
    console.log('Posting to profile:', title, content);

    var cookies = cookie.parse(document.cookie);
    console.log(cookies);
    if (!cookies.session_id) return alert('Your authentication token is missing. Please try signing out and in again.');
    var [id, dateCreated, hashedToken] = cookies.session_id.split('.');
    id = atob(id);
    const response = await fetch('http://localhost:9000/profile/post', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // no cors
            'mode': 'no-cors',
            'authorization': 'Bearer ' + cookies.session_id,
        },
        body: JSON.stringify({
            title: title,
            content: content,
            author: id,
        }),
    });

    const data = await response.json();
    if (!data.success) {
        console.error(data.error);
        alert(data.error)
        return;
    }
    console.log(data)
    // redirect to /profile/userId/posts/postId
    // 
    window.location.href = '/profile/' + id + '/posts/' + data.postId;
};

export default postToProfile;