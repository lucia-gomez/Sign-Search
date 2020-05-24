var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/* eslint-disable import/first */
import React from 'react';
import PropTypes from "prop-types";

var ResultVideo = function (_React$Component) {
  _inherits(ResultVideo, _React$Component);

  function ResultVideo() {
    _classCallCheck(this, ResultVideo);

    return _possibleConstructorReturn(this, (ResultVideo.__proto__ || Object.getPrototypeOf(ResultVideo)).apply(this, arguments));
  }

  _createClass(ResultVideo, [{
    key: 'render',
    value: function render() {
      return React.createElement(
        'div',
        null,
        this.props.caption ? React.createElement(
          'p',
          { className: 'caption' },
          this.props.caption
        ) : null,
        React.createElement('video', { src: this.props.src, className: 'result-item', autoPlay: true, loop: true, muted: true })
      );
    }
  }]);

  return ResultVideo;
}(React.Component);

ResultVideo.propTypes = {
  src: PropTypes.string.isRequired,
  caption: PropTypes.string
};

export default ResultVideo;