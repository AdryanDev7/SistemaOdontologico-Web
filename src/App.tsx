import './App.css'
import { Header } from './components/header';

function App() {
  return (
    <div>
      <Header />
      <main className="main-content">
        <h1>Painel da Recepção</h1>
        <p>Aguardando dados da API...</p>
      </main>
    </div>
  )
}

export default App