/* eslint-disable import/first */
import React from 'react';
import Spinner from 'react-bootstrap/Spinner'

class ResultList extends React.Component {
  constructor(props) {
    super(props)
    this.state = { children: [], done: false }
  }

  addChild(child) {
    this.setState(prevState => ({
      children: [...prevState.children, child]
    }))
  }

  reset() {
    this.setState({ children: [], done: false })
  }

  finishedLoading() {
    this.setState({ done: true })
  }

  isEmpty() {
    return this.state.children.length === 0
  }

  render() {
    const spinner = <Spinner animation="border" role="status" />
    const text = <p id='no-results'>No results</p>
    return (
      <div id='results'>
        {!this.state.done && this.isEmpty() ? spinner : null}
        {!this.isEmpty() ? <div>{this.state.children}</div> : null}
        {this.state.done && this.isEmpty() ? text : null}
      </div>
    );
  }
}

export default ResultList