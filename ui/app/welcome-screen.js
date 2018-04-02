import EventEmitter from 'events'
import h from 'react-hyperscript'
import { Component } from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import { withRouter } from 'react-router-dom'
import { compose } from 'recompose'
import {closeWelcomeScreen} from './actions'
import Mascot from './components/mascot'
import { INITIALIZE_CREATE_PASSWORD_ROUTE } from './routes'

class WelcomeScreen extends Component {
  static propTypes = {
    closeWelcomeScreen: PropTypes.func.isRequired,
    history: PropTypes.object,
  }

  constructor (props) {
    super(props)
    this.animationEventEmitter = new EventEmitter()
  }

  componentWillMount () {
    const { history, welcomeScreenSeen } = this.props

    if (welcomeScreenSeen) {
      console.log('SEENT', welcomeScreenSeen)
      history.push(INITIALIZE_CREATE_PASSWORD_ROUTE)
    }
  }

  initiateAccountCreation = () => {
    this.props.closeWelcomeScreen()
    this.props.history.push(INITIALIZE_CREATE_PASSWORD_ROUTE)
  }

  render () {
    return h('div.welcome-screen', [

        h('div.welcome-screen__info', [

          h(Mascot, {
            animationEventEmitter: this.animationEventEmitter,
            width: '225',
            height: '225',
          }),

          h('div.welcome-screen__info__header', 'Welcome to MetaMask Beta'),

          h('div.welcome-screen__info__copy', 'MetaMask is a secure identity vault for Ethereum.'),

          h('div.welcome-screen__info__copy', `It allows you to hold ether & tokens,
            and serves as your bridge to decentralized applications.`),

          h('button.welcome-screen__button', {
            onClick: this.initiateAccountCreation,
          }, 'Continue'),

        ]),

    ])
  }
}

const mapStateToProps = ({ metamask: { welcomeScreenSeen } }) => {
  return {
    welcomeScreenSeen,
  }
}

export default compose(
  withRouter,
  connect(
    mapStateToProps,
    dispatch => ({
      closeWelcomeScreen: () => dispatch(closeWelcomeScreen()),
    })
  )
)(WelcomeScreen)
