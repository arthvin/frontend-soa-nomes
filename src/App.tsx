import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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
  Title,
  Tooltip,
  Legend
);

function App() {
  const [nome, setNome] = useState('');
  const [nome1, setNome1] = useState('');
  const [nome2, setNome2] = useState('');
  const [uf, setUf] = useState('');
  const [dadosNome, setDadosNome] = useState<any[]>([]);
  const [dadosComparacao, setDadosComparacao] = useState<any[]>([]);
  const [dadosLocalidade, setDadosLocalidade] = useState<any[]>([]);

  const fetchNome = async () => {
    setDadosNome([]);
    try {
      const res = await fetch(`http://localhost:3000/ibge/name-evolution?name=${nome}`);
      const json = await res.json();
      if (json.length > 0) {
        setDadosNome(json[0].res);
      } else {
        setDadosNome([]);
      }
    } catch (error) {
      console.error(error);
      setDadosNome([]);
    }
  };

  const fetchComparacao = async () => {
    setDadosComparacao([]);
    try {
      const res = await fetch(`http://localhost:3000/ibge/compare-names?name1=${nome1}&name2=${nome2}`);
      const json = await res.json();
      setDadosComparacao(json);
    } catch (error) {
      console.error(error);
      setDadosComparacao([]);
    }
  };

  const fetchLocalidade = async () => {
    setDadosLocalidade([]);
    try {
      const res = await fetch(`http://localhost:3000/ibge/top3-by-location?locationId=${uf}`);
      const json = await res.json();

      if (Array.isArray(json)) {
        setDadosLocalidade(json);
      } else if (json && Array.isArray(json.data)) {
        setDadosLocalidade(json.data);
      } else {
        console.warn('Formato inesperado dos dados de localidade:', json);
        setDadosLocalidade([]);
      }
    } catch (error) {
      console.error(error);
      setDadosLocalidade([]);
    }
  };


  const renderGraficoNome = () => {
    if (!dadosNome || dadosNome.length === 0) return <p>Sem dados para exibir.</p>;

    const labels = dadosNome.map((e) => e.periodo);
    const data = dadosNome.map((e) => e.frequencia);

    return (
      <Line
        data={{
          labels,
          datasets: [
            {
              label: `Popularidade de ${nome}`,
              data,
              borderColor: 'blue',
              backgroundColor: 'lightblue',
              fill: false,
            },
          ],
        }}
        options={{ responsive: true }}
      />
    );
  };

  const renderComparacao = () => {
    if (!dadosComparacao || dadosComparacao.length === 0) return <p>Sem dados para exibir.</p>;

    const labels = dadosComparacao.map((item) => item.periodo);
    const dataNome1 = dadosComparacao.map((item) => item[nome1] || 0);
    const dataNome2 = dadosComparacao.map((item) => item[nome2] || 0);

    return (
      <Line
        data={{
          labels,
          datasets: [
            {
              label: nome1,
              data: dataNome1,
              borderColor: 'green',
              backgroundColor: 'rgba(0,128,0,0.3)',
              fill: false,
            },
            {
              label: nome2,
              data: dataNome2,
              borderColor: 'orange',
              backgroundColor: 'rgba(255,165,0,0.3)',
              fill: false,
            },
          ],
        }}
        options={{ responsive: true }}
      />
    );
  };

  const renderTabelaLocalidade = () => {
    if (!dadosLocalidade || !Array.isArray(dadosLocalidade)) return null;

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
              <td>{entry.decade}</td>
              {entry.top3.map((r: any, j: number) => (
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
        <button onClick={fetchNome} disabled={!nome.trim()}>
          Buscar
        </button>
        {renderGraficoNome()}
      </section>

      <section>
        <h2>Comparar dois nomes</h2>
        <input value={nome1} onChange={(e) => setNome1(e.target.value)} placeholder="Nome 1" />
        <input value={nome2} onChange={(e) => setNome2(e.target.value)} placeholder="Nome 2" />
        <button onClick={fetchComparacao} disabled={!nome1.trim() || !nome2.trim()}>
          Comparar
        </button>
        {renderComparacao()}
      </section>

      <section>
        <h2>Ranking por Localidade</h2>
        <input value={uf} onChange={(e) => setUf(e.target.value)} placeholder="UF (ex: 35)" />
        <button onClick={fetchLocalidade} disabled={!uf.trim()}>
          Buscar
        </button>
        {renderTabelaLocalidade()}
      </section>
    </div>
  );
}

export default App;
