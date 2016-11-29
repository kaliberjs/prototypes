const React = getReact()

class App extends React.Component {

  static childContextTypes = {
    history: React.PropTypes.any
  }

  getChildContext() {
    return { history: this.props.history }
  }

  state = {
    text: 'static text'
  }

  render() {
    const { matches, isHit } = this.props.route

    const toRoot = <Link href='/'>to root route</Link>
    const toRoute1 = <Link href='/route1'>to route 1</Link>
    const toRoute2 = <Link href='/route2'>to route 2</Link>

    return (
      <div>
        { this.state.text }<br />
        {
          matches('/')
          ? <div>at root<br />{ toRoute1 }<br />{ toRoute2 }</div>
          : matches('/route1')
          ? <div>at route 1<br />{ toRoot }<br />{ toRoute2 }</div>
          : matches('/route2')
          ? <div>at route 2<br />{ toRoot }<br />{ toRoute1 }</div>
          : isHit
          ? <div>at unknown route<br />{ toRoot }</div>
          : <div>not route for location</div>
        }
      </div>
    )
  }

  componentDidMount() {
    setTimeout(() => this.setState({ text: 'dynamic text' }), 1)
  }
}

Link.contextTypes = { history: React.PropTypes.any }
function Link({ href, children }, { history }) {

  return <a href={href} onClick={handleClick}>{ children }</a>

  function handleClick(event) {
    if (event.defaultPrevented) return
    if (shouldHandleClick(event)) {
      event.preventDefault()
      history.push(href)
    }
  }

  function shouldHandleClick({ button, ctrlKey, shiftKey, metaKey }) {
    return button === 0 /* left */ && !(ctrlKey || shiftKey || metaKey)
  }
}

module.exports = App

function getReact() {
  try { return require('react') }
  catch (e) { return React }
}
