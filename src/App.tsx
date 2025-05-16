import { useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './App.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const [nome, setNome] = useState('');
  const [nome1, setNome1] = useState('');
  const [nome2, setNome2] = useState('');
  const [uf, setUf] = useState('');
  const [dadosNome, setDadosNome] = useState<any>(null);
  const [dadosComparacao, setDadosComparacao] = useState<any>(null);
  const [dadosLocalidade, setDadosLocalidade] = useState<any>(null);

  const fetchNome = async () => {
    const res = await fetch(`http://localhost:3000/ibge/nome?nome=${nome}`);
    const json = await res.json();
    setDadosNome(json[0].res);
  };

  const fetchComparacao = async () => {
    const res = await fetch(`http://localhost:3000/ibge/comparar?nome1=${nome1}&nome2=${nome2}`);
    const json = await res.json();
    setDadosComparacao(json);
  };

  const fetchLocalidade = async () => {
    const res = await fetch(`http://localhost:3000/ibge/localidade?uf=${uf}`);
    const json = await res.json();
    setDadosLocalidade(json);
  };

  const renderGraficoNome = () => {
    if (!dadosNome) return null;
    const labels = dadosNome.map((e: any) => e.periodo);
    const data = dadosNome.map((e: any) => e.frequencia);

    return <Line data={{
      labels,
      datasets: [
        {
          label: `Popularidade de ${nome}`,
          data,
          borderColor: 'blue',
          backgroundColor: 'lightblue'
        }
      ]
    }} />
  };

  const renderComparacao = () => {
    if (!dadosComparacao) return null;
    const nome1Data = dadosComparacao[0].res;
    const nome2Data = dadosComparacao[1].res;
    const labels = nome1Data.map((e: any) => e.periodo);

    return <Line data={{
      labels,
      datasets: [
        {
          label: nome1,
          data: nome1Data.map((e: any) => e.frequencia),
          borderColor: 'green'
        },
        {
          label: nome2,
          data: nome2Data.map((e: any) => e.frequencia),
          borderColor: 'orange'
        }
      ]
    }} />
  };

  const renderTabelaLocalidade = () => {
    if (!dadosLocalidade) return null;
    return (
      <table>
        <thead>
          <tr>
            <th>Década</th>
            <th>1º Nome</th>
            <th>2º Nome</th>
            <th>3º Nome</th>
          </tr>
        </thead>
        <tbody>
          {dadosLocalidade.map((entry: any, i: number) => (
            <tr key={i}>
              <td>{entry.periodo}</td>
              {entry.ranking.slice(0, 3).map((r: any, j: number) => (
                <td key={j}>{r.nome} ({r.frequencia})</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="App">
      <h1>Sistema SOA - Tendência de Nomes</h1>

      <section>
        <h2>Evolução de um nome</h2>
        <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Digite um nome" />
        <button onClick={fetchNome}>Buscar</button>
        {renderGraficoNome()}
      </section>

      <section>
        <h2>Comparar dois nomes</h2>
        <input value={nome1} onChange={(e) => setNome1(e.target.value)} placeholder="Nome 1" />
        <input value={nome2} onChange={(e) => setNome2(e.target.value)} placeholder="Nome 2" />
        <button onClick={fetchComparacao}>Comparar</button>
        {renderComparacao()}
      </section>

      <section>
        <h2>Ranking por Localidade</h2>
        <input value={uf} onChange={(e) => setUf(e.target.value)} placeholder="UF (ex: 35)" />
        <button onClick={fetchLocalidade}>Buscar</button>
        {renderTabelaLocalidade()}
      </section>
    </div>
  );
}

export default App;
