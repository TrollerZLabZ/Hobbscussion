import { parse } from 'cookie';
import { fetch } from 'cross-fetch';

//TODO
const createCommunity = async ({e, document, closeModal}) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const name = formData.get('name');
    const description = formData.get('description');
    console.log('Creating community:', name, description);

    var cookies = parse(document.cookie);
    console.log(cookies);
    if (!cookies.session_id) return alert('Your authentication token is missing. Please try signing out and in again.');
    var [id, dateCreated, hashedToken] = cookies.session_id.split('.');
    id = atob(id);

    try {
        const response = await fetch('http://localhost:9000/community/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // no cors
                'mode': 'no-cors',
                // authentication
                'authorization': 'Bearer ' + cookies.session_id,
            },
            body: JSON.stringify({
                name: name,
                description: description,
                owner: id,
            }),
        });

        if (!response.ok) throw new Error('Network response was not ok');
        // Handle success
        closeModal(); // Close the modal on success
    } catch (error) {
        console.error('Error:', error);
    }
};

export default createCommunity;