var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/* eslint-disable import/first */
import React from 'react';
import PropTypes from "prop-types";

var ResultIFrame = function (_React$Component) {
  _inherits(ResultIFrame, _React$Component);

  function ResultIFrame() {
    _classCallCheck(this, ResultIFrame);

    return _possibleConstructorReturn(this, (ResultIFrame.__proto__ || Object.getPrototypeOf(ResultIFrame)).apply(this, arguments));
  }

  _createClass(ResultIFrame, [{
    key: 'capitalizeFirstLetter',
    value: function capitalizeFirstLetter(caption) {
      return caption.charAt(0).toUpperCase() + caption.slice(1);
    }
  }, {
    key: 'render',
    value: function render() {
      return React.createElement(
        'div',
        null,
        this.props.caption ? React.createElement(
          'p',
          { className: 'caption' },
          this.capitalizeFirstLetter(this.props.caption)
        ) : null,
        React.createElement('iframe', { src: this.props.src, className: 'result-item' })
      );
    }
  }]);

  return ResultIFrame;
}(React.Component);

ResultIFrame.propTypes = {
  src: PropTypes.string.isRequired
};

export default ResultIFrame;