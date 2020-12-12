import './App.css';
import Header from '../components/layout/Header';
import PropertyTrackBody from '../components/layout/PropertyTrackBody';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Header />
        <PropertyTrackBody />
      </header>
    </div>
  );
}

export default App;
