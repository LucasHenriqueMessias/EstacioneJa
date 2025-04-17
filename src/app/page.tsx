"use client";

/*
Colunas recomendadas:
- ID do veículo - Um identificador único para cada veículo, como placa ou número de registro.
- Marca/Modelo - Detalhes do carro, como fabricante e modelo.
- Cor - A cor do veículo.
- Hora de entrada - Registro do momento exato de entrada.
- Hora de saída - Registro do momento exato de saída.
- Duração da estadia - Tempo total de permanência (calculado a partir da entrada e saída).
- Preço por hora - Tarifa aplicada por hora de uso do estacionamento.
- Valor total - Cálculo do valor final a ser pago.
- Método de pagamento - Tipo de pagamento (dinheiro, cartão, etc.).
- Status da vaga - Indicação de vaga ocupada ou disponível.
- Observações - Campo para anotações específicas, como necessidades especiais.
*/

import styles from '../styles/page.module.scss';
import { database } from '../../services/firebase';
import { push, ref, onValue, set } from 'firebase/database';
import { useEffect, useState } from 'react';

type Carro = {
  id: string;
  carro: string;
  placa: string;
  entrada: string;
  saida: string;
  tempoPermanencia: string;
};

export default function Home() {

  const [carro, setCarro] = useState('');
  const [placa, setPlaca] = useState('');
  const [entrada, setEntrada] = useState('');
  const [saida, setSaida] = useState('');
  const [tempoPermanencia, setTempoPermanencia] = useState('');
  const [carros, setCarros] = useState<Carro[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    const refCarros = ref(database, 'carros');

    onValue(refCarros, (snapshot) => {
      const data = Object.entries(snapshot.val() || {}).map(([key, value]: [string, any]) => {
        return {
          'id': key,
          'carro': value.carro,
          'placa': value.placa,
          'entrada': value.entrada,
          'saida': value.saida,
          'tempoPermanencia': value.tempoPermanencia
        };
      });
      setCarros(data);
    }, (error) => {
      console.error('Erro ao ler os dados do Firebase:', error);
    });
  }, []);

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const formattedDate = `${now.getHours()}:${now.getMinutes()} ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
    setEntrada(formattedDate);

    const carroData = {
      carro,
      placa,
      entrada: formattedDate,
      saida,
      tempoPermanencia
    };

    const carroRef = ref(database, 'carros');
    push(carroRef, carroData); // Envia os dados ao Firebase
    alert('Veículo adicionado com sucesso!');

    // Limpa os valores do formulário
    setCarro('');
    setPlaca('');
    setEntrada('');
    setSaida('');
    setTempoPermanencia('');
  };

  const handleBaixar = (carro: Carro) => {
    const now = new Date();
    const formattedDate = `${now.getHours()}:${now.getMinutes()} ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;

    // Converte a entrada para um objeto Date
    const [entradaHora, entradaData] = carro.entrada.split(' ');
    const [entradaHoras, entradaMinutos] = entradaHora.split(':').map(Number);
    const [entradaDia, entradaMes, entradaAno] = entradaData.split('/').map(Number);
    const entradaDate = new Date(entradaAno, entradaMes - 1, entradaDia, entradaHoras, entradaMinutos);

    // Calcula o tempo de permanência em minutos
    const diffMs = now.getTime() - entradaDate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    // Atualiza o objeto com a nova saída e tempo de permanência
    const updatedCarro = {
        ...carro, // Mantém todos os dados existentes
        saida: formattedDate, // Atualiza o campo 'saida'
        tempoPermanencia: `${diffMinutes} minutos` // Adiciona o tempo de permanência
    };

    // Atualiza no Firebase
    const carroRef = ref(database, `carros/${carro.id}`);
    set(carroRef, updatedCarro)
      .then(() => {
        alert('Saída registrada com sucesso!');
      })
      .catch((error) => {
        console.error('Erro ao registrar a saída:', error);
    
      });
    };
  const filteredCarros = carros.filter((carro) =>
    carro.carro.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <main className={styles.container}>
        <form>
          <input type="text" placeholder="Carro" value={carro} onChange={e => setCarro(e.target.value)}></input>
          <input type="text" placeholder="Placa" value={placa} onChange={e => setPlaca(e.target.value)}></input>
          <button type="submit" onClick={handleAddVehicle}>{editMode ? "Salvar Alterações" : "Adicionar Veículo"}</button>
        </form>
        <div className={styles.tableCars}>
          <input
            type="text"
            placeholder="Pesquisar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          ></input>
          {filteredCarros.map((carro) => {
            return (
              <div key={carro.id} className={styles.carCard}>
                <div className={styles.titleBox}>
                <div>
                    <a onClick={() => handleBaixar(carro)}>Baixar</a>
                  </div>
                  <p className={styles.nomeCarro}>{carro.carro} / {carro.placa}</p>
                </div>
                <div className={styles.infoBox}>
                  
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
