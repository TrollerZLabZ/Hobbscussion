"use client"
import { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCog, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
const cookie = require('cookie');

import Modal from '@/components/Modal';

import createCommunity from '@/utils/createCommunity';

import postToCommunity from '@/utils/postToCommunity';

import HeaderDropdown from '@/components/HeaderDropdown';

export default function Page({ params }) {

    // community id
    const { communityId: id } = params;
    const [community, setCommunity] = useState({});
    const [posts, setPosts] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [userData, setUserData] = useState(null);
    const [communities, setCommunities] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);
    const cookies = cookie.parse(document.cookie);
    // useEffect to fetch data
    useEffect(() => {
        // Fetch data
        fetch(`http://localhost:9000/community/${id}`)
            .then((res) => res.json())
            .then((data) => {
                console.log('Community data:')
                console.log(data);
                setCommunity(data.community);
                setPosts(data.community.posts || []);
            })
            .catch((error) => {
                console.error('Error fetching community data:', error);
            });
    }, []);

    useEffect(() => {

        (async () => {
            // Fetch user

            // get cookie
            var cookies = cookie.parse(document.cookie);
            console.log(cookies);
            if (!cookies.session_id) {
                console.log("No session_id cookie found")
                window.location.href = '/'
            }
            if (cookies.session_id) {
                console.log("Attempting Remember Me")
                var [id, dateCreated, hashedToken] = cookies.session_id.split('.');
                id = atob(id);
                dateCreated = atob(dateCreated);

                // get user from database
                const response = await fetch('http://localhost:9000/profile/self', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + cookies.session_id,
                    },
                });

                const data = await response.json();
                if (!data.success) {
                    console.error(data.error);
                    alert("There was an error when trying to fetch user data, try logging in again: " + data.error);
                    window.location.href = '/'
                    return () => { };
                }
                if (data.success) {
                    console.log(data);
                    setUserData(data.user);
                    return () => { };
                }
            }
        })();
    }, []);

    // Dummy data for communities and posts
    useEffect(() => {
        fetch('http://localhost:9000/home/communities', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + cookies.session_id,
            },
        })
            .then((res) => res.json())
            .then((data) => {
                setCommunities(data.communities || []);
            })
            .catch((error) => {
                console.error('Error fetching communities:', error);
            })
    }, []);

    const joinCommunity = async () => {
        const cookies = cookie.parse(document.cookie);
        // Fetch data
        fetch(`http://localhost:9000/community/join`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + cookies.session_id,
            },
            body: JSON.stringify({
                userId: userData.id,
                communityId: community.id,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                console.log('Joined community:', data);
                setCommunity(data.community);
            })
            .catch((error) => {
                console.error('Error joining community:', error);
            });

    }

    const leaveCommunity = async () => {
        const cookies = cookie.parse(document.cookie);
        // Fetch data
        fetch(`http://localhost:9000/community/leave`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + cookies.session_id,
            },
            body: JSON.stringify({
                userId: userData.id,
                communityId: community.id,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                console.log('Leave community:', data);
                setCommunity(data.community);
            })
            .catch((error) => {
                console.error('Error leaving community:', error);
            });

    }

    return (<>
        <div className="mx-auto">
            <header className="flex justify-center p-4">
                <div className="flex justify-between w-full">
                    {/* Add a Home Button */}
                    <a href="/home">
                        <button className="text-white rounded">
                            <img src="/hobbscussion.png" alt="Logo" className='w-32' />
                        </button>
                    </a>
                    {/* Add a search bar */}
                    <div className="flex">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    // Redirect to search page
                                    window.location.href = `/search?query=${searchQuery}`;
                            }}}
                            className="border border-gray-300 rounded px-2 py-1"
                        />
                        <button className="bg-blue-500 text-white px-4 py-2 rounded ml-2">Search</button>
                    </div>
                    <div className="relative flex items-center">
                        <div className="flex items-center mr-4">
                            {userData && userData.avatar ? (
                                <img src={userData.avatar} alt="User" className="w-8 h-8 rounded-full" />
                            ) : (
                                <FontAwesomeIcon icon={faUser} className="w-8 h-8 rounded-full" />
                            )}
                            <span className="ml-2">{userData ? userData.username : 'Placeholder'}</span>
                        </div>
                        <HeaderDropdown signOut={() => {
                            // clear cookie
                            document.cookie = '';
                            window.location.href = '/';
                        }} />
                    </div>
                </div>
            </header>


            <aside className="flex-1 border-gray-300 p-4 fixed h-screen transition-transform -translate-x-full sm:translate-x-0">
                <ul>
                    {
                        communities && communities.length > 0 ? (
                            communities.map((community) => (
                                <a href={`/community/${community.id}`} className='hover:underline'>
                                    <div key={community.id} className='bg-gray-300 rounded-lg p-4 my-4'>
                                        <h2>{community.name}</h2> {/* Correctly accessing the name property */}
                                    </div>
                                </a>
                            ))
                        ) : (

                            /* Add a placeholder */
                            Array.from({ length: 5 }).map((_, index) => (
                                <div key={index} className="mb-2 bg-gray-300 rounded-lg p-4">
                                    <div className="w-1/2 h-6 bg-gray-400 mb-2 animate-pulse"></div>
                                </div>
                            ))

                        )
                    }

                    <button onClick={openModal} className="bg-blue-500 text-white px-4 py-2 rounded">Create Community</button>
                </ul>
            </aside>

            <Modal isOpen={isModalOpen} onClose={closeModal}>
                <form onSubmit={createCommunity}>
                    <input name="name" type="text" placeholder="Community Name" className="border border-gray-300 rounded px-4 py-2 mb-4 w-full" />
                    <textarea name="description" placeholder="Description" className="border border-gray-300 rounded px-4 py-2 mb-4 w-full" rows="4"></textarea>
                    <button type="submit">Submit</button>
                </form>
            </Modal>

            <div className="flex flex-col items-center mt-8">
                <FontAwesomeIcon icon={faUser} className="text-4xl mb-2" />
                {
                    community ? (
                        <h1 className="text-2xl font-bold">{community.name}</h1>
                    ) : (
                        <div className="w-full h-12 bg-gray-300 animate-pulse"></div>
                    )
                }
            </div>

            {/* Add a bar that contains a button aligned to the right that either says join community or leave community based on whether the user is in the community or not */}
            <div className="flex justify-end p-4 mx-56">
                {
                    community && userData && community.members && community.members.includes(userData.id) ? (
                        <button onClick={leaveCommunity} className="bg-red-500 text-white px-4 py-2 rounded">Leave Community</button>
                    ) : (
                        <button onClick={joinCommunity} className="bg-blue-500 text-white px-4 py-2 rounded">Join Community</button>
                    )
                }
            </div>

            {/* Add a Line Break */}
            <br className="my-4" />

            <div className="flex-1 flex justify-center"> {/* Add flex justify-center to center the form horizontally */}
                <form className="w-full max-w-md" onSubmit={(e) => postToCommunity({ e, document, setPosts, posts, id })}> {/* Adjust max-w-md as needed to control form width */}
                    <input name="title" type="text" placeholder="Title" className="border border-gray-300 rounded px-4 py-2 mb-4 w-full" />
                    <textarea name="content" placeholder="Content" className="border border-gray-300 rounded px-4 py-2 mb-4 w-full" rows="4"></textarea>
                    <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full transition duration-150 ease-in-out">
                        Publish to the community
                    </button>
                </form>
            </div>

            <br className="my-4" />
            {/* Add a Main Section */}



            <div className="flex flex-row justify-start bg-blue-200 rounded-lg p-4 mx-56">
                <main className="w-full">
                    {
                        posts && posts.length > 0 ? (
                            posts.map((post) => (
                                <article key={post.id} className="mb-4 bg-sky-950 rounded-lg p-4">
                                    <a href={`/community/${id}/posts/${post.id}`} className="text-blue-500 hover:underline"> {/* Add hover:underline to make the link underlined on hover */}
                                        <h2 className="text-xl font-bold">{post.title}</h2>
                                    </a>
                                    <p>{post.content}</p>
                                </article>
                            ))
                        ) : (
                            Array.from({ length: 5 }).map((_, index) => ( // Assuming you want 5 placeholders
                                <div key={index} className="mb-4 bg-gray-300 rounded-lg p-4">
                                    <div className="w-1/2 h-6 bg-gray-400 mb-2 animate-pulse"></div>
                                    <div className="w-3/4 h-4 bg-gray-400 animate-pulse"></div>
                                    <div className="w-3/4 h-4 bg-gray-400 animate-pulse"></div>
                                    <div className="w-3/4 h-4 bg-gray-400 animate-pulse"></div>
                                </div>
                            ))
                        )
                    }
                </main>
            </div>
        </div>
    </>)
}