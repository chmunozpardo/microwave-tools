import React from 'react';
//import './App.css';
import NavTop from './NavTop';
import { BrowserRouter} from 'react-router-dom';
import LocalRouter from './LocalRouter';

function App() {

  return (
    <BrowserRouter>
      <NavTop/>
      <LocalRouter/>
    </BrowserRouter>
  );
}

export default App;
