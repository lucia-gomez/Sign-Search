/* eslint-disable import/first */
import React from 'react';
import HandGIF from '../assets/hand-loop.gif'

class ResultList extends React.Component {
  constructor(props) {
    super(props)
    this.state = { children: [], done: false, relatedSigns: [] }
  }

  addChild(child) {
    this.setState(prevState => ({
      children: [...prevState.children, child]
    }))
  }

  addRelatedSign(sign) {
    this.setState(prevState => ({ relatedSigns: [...prevState.relatedSigns, sign] }))
  }

  reset() {
    this.setState({ children: [], done: false, relatedSigns: [] })
  }

  finishedLoading() {
    this.setState({ done: true })
  }

  isEmpty() {
    return this.state.children.length === 0
  }

  renderRelatedSigns() {
    return <p id='related-signs'>Related signs:<br />{this.state.relatedSigns.map((sign, i) => (
      <span className='related-sign'>{sign}</span>))}
    </p>
  }

  render() {
    const spinner = <img id='spinner' src={HandGIF} style={{ width: '100px' }} />
    const noResults = <p id='no-results'>No results</p>
    return (
      <div id='results'>
        {!this.state.done && this.isEmpty() ? spinner : null}
        {!this.isEmpty() ? <div>{this.state.children}</div> : null}
        {this.state.done && this.isEmpty() ? noResults : null}
        {this.state.relatedSigns.length > 0 ? this.renderRelatedSigns() : null}
      </div>
    );
  }
}

export default ResultList