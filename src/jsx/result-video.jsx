/* eslint-disable import/first */
import React from 'react';
import PropTypes from "prop-types";

class ResultVideo extends React.Component {
  render() {
    return (
      <video src={this.props.src} className='result-item' autoPlay loop muted />
    );
  }
}

ResultVideo.propTypes = {
  src: PropTypes.string.isRequired
}

export default ResultVideo