//  ARQUIVO CRIADO PARA TENTAR FAZER UMA NOVA PÁGINA DE DETALHES PARA O POKÉMON (pokedex/pikachu);
//Porém não consegui criar, então deixarei o arquivo aqui.

import { useEffect, useState } from 'react';

const Detalhes = ({ match }) => {
  const [pokemonData, setPokemonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPokemonData();
  }, []);

  const fetchPokemonData = async () => {
    const pokemonName = match.params.name;

    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
      if (!response.ok) {
        throw new Error('Failed to fetch Pokémon data');
      }
      const data = await response.json();
      setPokemonData(data);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  if (loading) {
    return <p>Loading Pokémon data...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }
  

  return (
    <div>
      {pokemonData && (
        <div className="pokemon-card">
          <h2 className="pokemon-name">{pokemonData.name}</h2>
          <img src={pokemonData.sprites.front_default} alt={pokemonData.name} className="pokemon-image" />
          <div className="pokemon-details">
            <div>
              <h3>Height:</h3>
              <p>{pokemonData.height}</p>
            </div>
            <div>
              <h3>Weight:</h3>
              <p>{pokemonData.weight}</p>
            </div>
            <div>
              <h3>Abilities:</h3>
              <ul>
                {pokemonData.abilities.map((ability) => (
                  <li key={ability.ability.name}>{ability.ability.name}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Types:</h3>
              <ul>
                {pokemonData.types.map((type) => (
                  <li key={type.slot}>{type.type.name}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Detalhes;
