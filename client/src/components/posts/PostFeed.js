import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PostItems from './PostItems';

class PostFeed extends Component {
  render() {
    const { posts } = this.props;
    return (
      // map Through each of them and displaythem throguth postitem
      posts.map(post => <PostItems key={post._id} post={post} />)
    );
  }
}

PostFeed.propTypes = {
  posts: PropTypes.array.isRequired
};

export default PostFeed;
