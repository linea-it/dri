import React from 'react';

function App() {
  return (
    <div className="App">
      <h1>DRI Home</h1>
      <h1><a href={`${window.location.protocol}//${window.location.host}/sky/`}>Sky Viwer</a></h1>
      <h1><a href={`${window.location.protocol}//${window.location.host}/target/`}>Target Viwer</a></h1>
      <h1><a href={`${window.location.protocol}//${window.location.host}/userquery/`}>User Query</a></h1>
      <h1><a href={`${window.location.protocol}//${window.location.host}/eyeballing/`}>Tile Inspection</a></h1>
    </div>
  );
}


export default App;
