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
  tipo: string;
  observacoes: string;
  entrada: string;
  saida: string;
  tempoPermanencia: string;
  valorTotal: string;
};

export default function Homecopy() {

  const [carro, setCarro] = useState('');
  const [placa, setPlaca] = useState('');
  const [tipo, setTipo] = useState('horista');
  const [observacoes, setObservacoes] = useState('');
  const [entrada, setEntrada] = useState('');
  const [saida, setSaida] = useState('');
  const [tempoPermanencia, setTempoPermanencia] = useState('');
  const [valorTotal, setValorTotal] = useState('');
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
          'tipo': value.tipo,
          'observacoes': value.observacoes,
          'entrada': value.entrada,
          'saida': value.saida,
          'tempoPermanencia': value.tempoPermanencia,
          'valorTotal': value.valorTotal
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
      tipo,
      observacoes,
      entrada: formattedDate, // Inclui a hora atual no JSON
      saida,
      tempoPermanencia,
      valorTotal
    };

    const carroRef = ref(database, 'carros');
    push(carroRef, carroData); // Envia os dados ao Firebase
    alert('Veículo adicionado com sucesso!');

    // Limpa os valores do formulário
    setCarro('');
    setPlaca('');
    setTipo('horista');
    setObservacoes('');
    setEntrada('');
    setSaida('');
    setTempoPermanencia('');
    setValorTotal('');
  };

  const handleBaixar = () => {
    const now = new Date();
    const formattedDate = `${now.getHours()}:${now.getMinutes()} ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
    setSaida(formattedDate);
  };

  const handleEdit = (carro: Carro) => {
    setEditMode(true);
    setEditId(carro.id);
    setCarro(carro.carro);
    setPlaca(carro.placa);
    setTipo(carro.tipo);
    setObservacoes(carro.observacoes);
    setEntrada(carro.entrada);
    setSaida(carro.saida);
    setTempoPermanencia(carro.tempoPermanencia);
    setValorTotal(carro.valorTotal);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;

    const updatedCarro = {
      carro,
      placa,
      tipo,
      observacoes,
      entrada,
      saida,
      tempoPermanencia,
      valorTotal,
    };

    const carroRef = ref(database, `carros/${editId}`);
    set(carroRef, updatedCarro) // Atualiza os dados no Firebase
      .then(() => {
        alert("Veículo atualizado com sucesso!");
      })
      .catch((error) => {
        console.error("Erro ao atualizar o veículo:", error);
      });

    // Limpa os valores do formulário e sai do modo de edição
    setEditMode(false);
    setEditId(null);
    setCarro('');
    setPlaca('');
    setTipo('horista');
    setObservacoes('');
    setEntrada('');
    setSaida('');
    setTempoPermanencia('');
    setValorTotal('');
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
          <select value={tipo} onChange={e => setTipo(e.target.value)} >
            <option value="horista">Horista</option>
            <option value="mensalista">Mensalista</option>
            <option value="convenio">Convênio</option>
          </select>
          <textarea placeholder="Observações" value={observacoes} onChange={e => setObservacoes(e.target.value)}></textarea>
          <button type="submit" onClick={editMode ? handleSaveEdit : handleAddVehicle}>{editMode ? "Salvar Alterações" : "Adicionar Veículo"}</button>
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
                  <p className={styles.nomeCarro}>{carro.carro}</p>
                  <div>
                    <a onClick={() => handleBaixar()}>Baixar</a>
                    <a onClick={() => handleEdit(carro)}>Editar</a>
                  </div>
                </div>
                <div className={styles.infoBox}>
                  <p>{carro.placa}</p>
                  <p>Entrada: {carro.entrada} Saída: {carro.saida} Tempo de Permanência: {carro.tempoPermanencia}</p>
                  <p>{carro.tipo}</p>
                  <p> Valor Total: R$ {carro.valorTotal}</p>
                  <p>Observações: {carro.observacoes}</p>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
