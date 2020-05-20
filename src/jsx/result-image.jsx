/* eslint-disable import/first */
import React from 'react';
import PropTypes from "prop-types";

class ResultImage extends React.Component {
  render() {
    return (
      <img src={this.props.src} />
    );
  }
}

ResultImage.propTypes = {
  src: PropTypes.string.isRequired
}

export default ResultImage