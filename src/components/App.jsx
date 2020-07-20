import React from 'react'
import HighScore from './HighScore.jsx'

window.onscroll = function () {
  scrollFunction()
}

function scrollFunction () {
  if (document.body.scrollTop >= 1 || document.documentElement.scrollTop >= 1) {
    document.getElementById('logo').style.width = '10px'
    document.getElementById('logo').style.visibility = 'hidden'
  } else {
    document.getElementById('logo').style.visibility = 'visible'
    document.getElementById('logo').style.width = '900px'
  }
}

export default class App extends React.Component {
  render () {
    console.log(window.scrollY)
    return (
      <div style={{ textAlign: 'center' }}>
        {/* <h1>Hello World</h1> */}
        <div id="logoContainer">
          <img id="logo" src="/assets/Game/eda-quest-logo.png" alt="Quest Logo" />
          <img id="scroll" src="/assets/Game/scroll-to-start.png" alt="scroll to start"/>
        </div>
        <HighScore />
      </div>
    )
  }
}
