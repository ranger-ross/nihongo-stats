import { useState } from 'react'
import logo from './logo.svg'
import './App.css'
import AppNav from './nav/AppNav'
import AppHeader from './header/AppHeader'
import ApiService from './ApiService'



function App() {
  const [count, setCount] = useState(0)

  let token = '';

  ApiService.getRecentItems(token)
    .then(response => response.json())
    .then(data => {
      console.log(data);
    })
    .catch(console.error);

  return (
    <div className="App">
      <AppHeader />
      <AppNav />

      <header className="App-header">

        <img src={logo} className="App-logo" alt="logo" />
        <p>Hello Vite + React!</p>
        <p>
          <button type="button" onClick={() => setCount((count) => count + 1)}>
            count is: {count}
          </button>
        </p>
        <p>
          Edit <code>App.jsx</code> and save to test HMR updates.
        </p>
        <p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
          {' | '}
          <a
            className="App-link"
            href="https://vitejs.dev/guide/features.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Vite Docs
          </a>
        </p>
      </header>
    </div>
  )
}

export default App
