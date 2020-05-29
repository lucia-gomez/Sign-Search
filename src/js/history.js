import _regeneratorRuntime from 'babel-runtime/regenerator';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/* eslint-disable import/first */
/* eslint default-case: "off", no-fallthrough: "off", no-loop-func: "off" */
/* global chrome */
import React from 'react';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';
import { search } from '../js/search.js';
import NothingGIF from '../assets/nothing.gif';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';

var History = function (_React$Component) {
  _inherits(History, _React$Component);

  function History(props) {
    _classCallCheck(this, History);

    var _this2 = _possibleConstructorReturn(this, (History.__proto__ || Object.getPrototypeOf(History)).call(this, props));

    _this2.key = 'search_history';
    _this2.maxLength = 100;
    _this2.numDisplay = 5;
    _this2.state = { open: false, searches: [] };
    _this2.clear = _this2.clear.bind(_this2);
    _this2.click = _this2.click.bind(_this2);
    _this2.growDiv = _this2.growDiv.bind(_this2);
    _this2.remove = _this2.remove.bind(_this2);
    _this2.search = search;
    _this2.init();
    return _this2;
  }

  _createClass(History, [{
    key: 'init',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee() {
        var hist;
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return chrome.storage.local.get(this.key, function (hist) {
                  if (!hist.search_history) chrome.storage.local.set({ search_history: [] });
                });

              case 2:
                _context.next = 4;
                return this.get();

              case 4:
                hist = _context.sent;

                this.setState({ searches: hist });

              case 6:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function init() {
        return _ref.apply(this, arguments);
      }

      return init;
    }()
  }, {
    key: 'clear',
    value: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2() {
        return _regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                chrome.storage.local.set({ search_history: [] });
                this.setState({ searches: [] });

              case 2:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function clear() {
        return _ref2.apply(this, arguments);
      }

      return clear;
    }()
  }, {
    key: 'get',
    value: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee3() {
        return _regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                return _context3.abrupt('return', new Promise(function (resolve, _) {
                  chrome.storage.local.get('search_history', function (hist) {
                    resolve(hist.search_history);
                  });
                }));

              case 1:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function get() {
        return _ref3.apply(this, arguments);
      }

      return get;
    }()
  }, {
    key: 'add',
    value: function () {
      var _ref4 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee4(query) {
        var hist;
        return _regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if (!(query.length === 0)) {
                  _context4.next = 2;
                  break;
                }

                return _context4.abrupt('return');

              case 2:
                _context4.next = 4;
                return this.get();

              case 4:
                hist = _context4.sent;

                if (hist.length === this.maxLength) hist.shift();
                hist.unshift(query);
                this.setState({ searches: hist });
                chrome.storage.local.set(_defineProperty({}, this.key, hist));

              case 9:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function add(_x) {
        return _ref4.apply(this, arguments);
      }

      return add;
    }()
  }, {
    key: 'remove',
    value: function () {
      var _ref5 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee5(index) {
        var item, _this;

        return _regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                item = document.getElementById('list-group-item-flex-' + index);

                item.classList.add('remove');
                _this = this;

                setTimeout(function () {
                  var hist = _this.state.searches;
                  hist.splice(index, 1);
                  _this.setState({ searches: hist });
                  try {
                    item.classList.remove('remove');
                  } catch (err) {}
                  _this.growDiv();
                  chrome.storage.local.set(_defineProperty({}, _this.key, hist));
                }, 400);

              case 4:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function remove(_x2) {
        return _ref5.apply(this, arguments);
      }

      return remove;
    }()
  }, {
    key: 'click',
    value: function () {
      var _ref6 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee6() {
        return _regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                this.setState(function (prevState) {
                  return {
                    open: !prevState.open
                  };
                });

              case 1:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function click() {
        return _ref6.apply(this, arguments);
      }

      return click;
    }()
  }, {
    key: 'close',
    value: function close() {
      this.setState({ open: false });
    }
  }, {
    key: 'growDiv',
    value: function growDiv() {
      var growDiv = document.getElementById('grow');
      if (!this.state.open) {
        growDiv.style.height = 0;
      } else {
        var wrapper = document.getElementById('measuringWrapper');
        growDiv.style.height = Math.floor(wrapper.offsetHeight) + "px";
      }
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      this.growDiv();
    }
  }, {
    key: 'render',
    value: function render() {
      var _this3 = this;

      var noHistory = React.createElement('img', { src: NothingGIF, onLoad: this.growDiv, style: { width: '100%' } });
      return React.createElement(
        'div',
        null,
        React.createElement(
          'div',
          { id: 'grow' },
          React.createElement(
            'div',
            { id: 'measuringWrapper' },
            this.state.searches.length === 0 ? noHistory : React.createElement(
              ListGroup,
              { id: 'search-list' },
              this.state.searches.map(function (search, key) {
                return React.createElement(
                  'div',
                  { className: 'list-group-item-flex', id: 'list-group-item-flex-' + key },
                  React.createElement(
                    ListGroup.Item,
                    { key: key, onClick: function onClick() {
                        document.querySelector('input').value = search;
                        _this3.search(_this3);
                      } },
                    search
                  ),
                  React.createElement(FontAwesomeIcon, { icon: faTimesCircle, onClick: function onClick() {
                      return _this3.remove(key);
                    }, className: 'icon' })
                );
              })
            ),
            React.createElement(
              Button,
              { onClick: this.clear, id: 'clear-btn', variant: 'secondary' },
              'Clear'
            )
          )
        )
      );
    }
  }]);

  return History;
}(React.Component);

export default History;