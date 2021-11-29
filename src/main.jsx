import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import * as localForage from "localforage/dist/localforage"

window.localForage = localForage;

ReactDOM.render(<App />, document.getElementById('root'))
