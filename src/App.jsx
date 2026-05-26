import Card from "./components/card";
import Button from "./components/buttom";
import Contador from "./components/contador";
import Notas from "./components/notas";
import Lista from "./components/listas";

function App() {

  const usuarios = [
    {
      id: 1,
      nome: "Igor",
      status: false,
      idade: 19
    },
    {
      id: 2,
      nome: "Jão de Barro",
      status: false,
      idade: 20
    }
  ];

  return (
    <div>
      {/* <Contador ></Contador> */}
      <Lista></Lista>
    </div>
  );
}

export default App;