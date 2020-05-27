var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/* eslint-disable import/first */
import React from 'react';
import HandGIF from '../assets/hand-loop.gif';

var ResultList = function (_React$Component) {
  _inherits(ResultList, _React$Component);

  function ResultList(props) {
    _classCallCheck(this, ResultList);

    var _this = _possibleConstructorReturn(this, (ResultList.__proto__ || Object.getPrototypeOf(ResultList)).call(this, props));

    _this.state = {
      children: [],
      done: false,
      relatedSigns: [],
      tryingNewSearch: false,
      currentQuery: ""
    };
    return _this;
  }

  _createClass(ResultList, [{
    key: 'addChild',
    value: function addChild(child) {
      this.setState(function (prevState) {
        return {
          children: [].concat(_toConsumableArray(prevState.children), [child])
        };
      });
    }
  }, {
    key: 'addRelatedSign',
    value: function addRelatedSign(sign, relatedQuery) {
      if (relatedQuery === this.state.currentQuery) this.setState(function (prevState) {
        return { relatedSigns: [].concat(_toConsumableArray(prevState.relatedSigns), [sign]) };
      });
    }
  }, {
    key: 'reset',
    value: function reset() {
      this.setState({
        children: [],
        done: false,
        relatedSigns: [],
        tryingNewSearch: false,
        currentQuery: ""
      });
    }
  }, {
    key: 'finishedLoading',
    value: function finishedLoading() {
      this.setState({ done: true });
    }
  }, {
    key: 'isEmpty',
    value: function isEmpty() {
      return this.state.children.length === 0;
    }
  }, {
    key: 'renderRelatedSigns',
    value: function renderRelatedSigns() {
      return React.createElement(
        'p',
        { id: 'related-signs' },
        'Related signs:',
        React.createElement('br', null),
        this.state.relatedSigns.map(function (sign, i) {
          return React.createElement(
            'span',
            { className: 'related-sign' },
            sign
          );
        })
      );
    }
  }, {
    key: 'setCurrentQuery',
    value: function setCurrentQuery(query) {
      this.setState({ currentQuery: query });
    }
  }, {
    key: 'getCurrentQuery',
    value: function getCurrentQuery() {
      return this.state.currentQuery;
    }
  }, {
    key: 'newSearch',
    value: function newSearch(query) {
      this.setCurrentQuery(query);
      this.setState({ tryingNewSearch: true });
    }
  }, {
    key: 'renderNewSearch',
    value: function renderNewSearch() {
      if (!this.state.tryingNewSearch) return null;
      if (!this.state.done && this.isEmpty()) return React.createElement(
        'p',
        { className: 'new-search' },
        'No results. Searching for ',
        React.createElement(
          'span',
          null,
          this.state.currentQuery
        ),
        ' instead...'
      );
      if (this.state.done && !this.isEmpty()) return React.createElement(
        'p',
        { className: 'new-search' },
        'Showing results for ',
        React.createElement(
          'span',
          null,
          this.state.currentQuery
        )
      );
    }
  }, {
    key: 'render',
    value: function render() {
      var spinner = React.createElement('img', { id: 'spinner', src: HandGIF, style: { width: '100px' } });
      var noResults = React.createElement(
        'p',
        { id: 'no-results' },
        'No results'
      );
      return React.createElement(
        'div',
        { id: 'results' },
        this.renderNewSearch(),
        !this.state.done && this.isEmpty() ? spinner : null,
        !this.isEmpty() ? React.createElement(
          'div',
          null,
          this.state.children
        ) : null,
        this.state.done && this.isEmpty() ? noResults : null,
        this.state.relatedSigns.length > 0 ? this.renderRelatedSigns() : null
      );
    }
  }]);

  return ResultList;
}(React.Component);

export default ResultList;