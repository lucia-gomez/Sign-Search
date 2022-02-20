/* eslint-disable import/first */
import React from 'react';
import PropTypes from "prop-types";

class ResultIFrame extends React.Component {
  capitalizeFirstLetter(caption) {
    return caption.charAt(0).toUpperCase() + caption.slice(1);
  }

  render() {
    return (
      <div>
        {this.props.caption ? <p className='caption'>{this.capitalizeFirstLetter(this.props.caption)}</p> : null}
        <iframe src={this.props.src} className='result-item' />
      </div>
    );
  }
}

ResultIFrame.propTypes = {
  src: PropTypes.string.isRequired
}

export default ResultIFrame