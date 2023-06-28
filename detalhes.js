import React from 'react';

function PokemonDetails({ pokemon }) {
  return (
    <div>
      <h2>{pokemon.name}</h2>
      <img src={pokemon.photo} alt={pokemon.name} />
      <p>Height: {pokemon.height}</p>
      <p>Weight: {pokemon.weight}</p>
    </div>
  );
}

export default PokemonDetails;
