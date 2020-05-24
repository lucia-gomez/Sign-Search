/* eslint-disable import/first */
import React from 'react';
import PropTypes from "prop-types";

class ResultSection extends React.Component {
  render() {
    return (
      <section>
        <a className='section-title' href={this.props.link} target='_blank'>{this.props.title}</a>
        {this.props.children}
      </section>
    );
  }
}

ResultSection.propTypes = {
  link: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
}

export default ResultSection