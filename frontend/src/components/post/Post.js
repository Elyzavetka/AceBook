import React, { useEffect, useState } from 'react';
import './Post.css'
import LikeButton from '../likeButton/likeButton';
import ProfileImageThumbnail from '../profileImageThumbnail/ProfileImageThumbnail';

const Post = ({ post }) => {
  const [author, setAuthor] = useState(null);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(post.comments || []);
  const [token, setToken] = useState(window.localStorage.getItem("token"));

  useEffect(() => {
    if (token) {
      console.log("Displaying post");
      console.log(post);
      console.log("Using effect");
      console.log(post.author);
      fetch(`/users/${post.author}`, {
        // NOTE: This may have to be changed to post.author.id
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(async result => {
        console.log("Setting author");
        console.log(result);
        setAuthor(result.user);
      })
      .catch(err => console.error(err));
    } else {
      console.log("No token set (in Post component)");
    }
  }, [token, post, post.author]);

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (comment.trim() !== '') {
      console.log(comments);
      setComments([...comments, {comment_message: comment, date: Date.now(),
        displayName: (author.displayName ? author.displayName : "Loading...")
      }]);
      setComment('');
    } else {
      console.log("User tried to leave a blank comment");
      setComment('');
      return;
    }
    fetch(`/posts/${post._id}`, {
      method: 'put',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ comment: comment })
    })
      .then(async response => {
          let data = await response.json();
          // console.log("token", data)
          window.localStorage.setItem("token", data.token);
      })
    };
    const formatDate = (dateString) => {
      const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false, };
      const formattedDate = new Date(dateString).toLocaleDateString(undefined, options);
      return formattedDate;
  };

  return (
    <div className='postcontainer' data-cy="post">
      <div data-cy="author-info" className="author-info">
              { author ? (
                <>
                  <ProfileImageThumbnail user={ author }/>
                  <p className='authorline'><strong>{`Posted by ${author.displayName} on ${ formatDate(post.date) }`}</strong></p>
                </>
              ) : "Loading..."
              }
      </div>

      <div className='postcontentandlikebutton'>
          <article data-cy="post" key={ post._id }>
                <div className='post'>
                <img src={`data:image/png;base64, ${post.image}`} alt="Post" />
            <br />
                <div>{ post.message }</div>
              <small className="smallText">{formatDate(post.date)}</small></div>
            <div className='likebutton'>
              <LikeButton post_id={ post._id }/>
            </div>
          </article>
      </div>

    
      <div className='comments' >
            {comments.map((comment, index) => (
              <div key={index}>{comment.comment_message}
              <br />
              {comment.date && 
                <small className="smallText">{formatDate(comment.date)}</small>
              }
              <small className="smallText">{comment.displayName}</small>    
              </div>
            ))}

              <form onSubmit={handleSubmitComment}>
                <p>
                  Comment:
                </p>
                  <input
                    type="text"
                    value={comment}
                    onChange={handleCommentChange}
                    placeholder="Add a comment..."
                    />
                
                <button className='commentbutton' type="submit">Add Comment</button>
              </form>
      </div>

    </div>
  );
};


export default Post;