/* eslint-disable import/first */
import React from 'react';
import PropTypes from "prop-types";

class ResultIFrame extends React.Component {
  render() {
    return (
      <iframe src={this.props.src} />
    );
  }
}

ResultIFrame.propTypes = {
  src: PropTypes.string.isRequired
}

export default ResultIFrame