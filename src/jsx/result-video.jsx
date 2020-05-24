/* eslint-disable import/first */
import React from 'react';
import PropTypes from "prop-types";

class ResultVideo extends React.Component {
  capitalizeFirstLetter(caption) {
    return caption.charAt(0).toUpperCase() + caption.slice(1);
  }

  render() {
    return (
      <div>
        {this.props.caption ? <p className='caption'>{this.capitalizeFirstLetter(this.props.caption)}</p> : null}
        <video src={this.props.src} className='result-item' autoPlay loop muted />
      </div>
    );
  }
}

ResultVideo.propTypes = {
  src: PropTypes.string.isRequired,
  caption: PropTypes.string,
}

export default ResultVideo