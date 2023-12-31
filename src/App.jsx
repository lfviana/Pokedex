
import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [pokemonList, setPokemonList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pokemonsPerPage] = useState(50);
  const [selectedType, setSelectedType] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [hoveredPokemon, setHoveredPokemon] = useState(null);

  useEffect(() => {
    fetchPokemonList();
  }, []);

  const fetchPokemonList = async () => {
    try {
      const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=600');
      if (!response.ok) {
        throw new Error('Failed to fetch Pokémon list');
      }
      const data = await response.json();
      const pokemonData = await Promise.all(
        data.results.map(async (pokemon) => {
          const response = await fetch(pokemon.url);
          const data = await response.json();
          const speciesResponse = await fetch(data.species.url);
          const speciesData = await speciesResponse.json();
          const evolutionChainResponse = await fetch(speciesData.evolution_chain.url);
          const evolutionChainData = await evolutionChainResponse.json();
          const abilities = data.abilities.map((ability) => ability.ability.name);
          const evolutions = getEvolutions(evolutionChainData.chain);

          return {
            id: data.id,
            name: pokemon.name,
            photo: data.sprites.front_default,
            types: data.types.map((type) => type.type.name),
            abilities: abilities,
            evolutions: evolutions,
          };
        })
      );
      setPokemonList(pokemonData);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
  };

  const getEvolutions = (evolutionChain) => {
    const evolutions = [];

    const traverseChain = (chain) => {
      evolutions.push(chain.species.name);

      if (chain.evolves_to.length > 0) {
        chain.evolves_to.forEach((evolution) => {
          traverseChain(evolution);
        });
      }
    };

    traverseChain(evolutionChain);

    return evolutions;
  };

  const indexOfLastPokemon = currentPage * pokemonsPerPage;
  const indexOfFirstPokemon = indexOfLastPokemon - pokemonsPerPage;
  const currentPokemons = pokemonList.slice(indexOfFirstPokemon, indexOfLastPokemon);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const filterByType = (type) => {
    setSelectedType(type);
    setCurrentPage(1);
  };

  const filterByText = (text) => {
    setSearchText(text);
    setCurrentPage(1);
  };

  const handlePokemonClick = (pokemon) => {
    setSelectedPokemon(pokemon);
  };

  const handlePokemonMouseEnter = (pokemon) => {
    setHoveredPokemon(pokemon);
  };

  const handlePokemonMouseLeave = () => {
    setHoveredPokemon(null);
  };

  const filteredPokemons = currentPokemons.filter((pokemon) => {
    if (selectedType && !pokemon.types.includes(selectedType)) {
      return false;
    }
    if (searchText && !pokemon.name.toLowerCase().includes(searchText.toLowerCase())) {
      return false;
    }
    return true;
  });

  if (loading) {
    return <p className='text-center h-screen flex items-center justify-center'>Loading pokémons...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className='container'>
      <h1 className='text-3xl font-pokemon font-bold text-black flex items-center mb-10 justify-center'>
        POKÉDEX
        <img src='https://img.freepik.com/icones-gratis/pokebola_318-196468.jpg' className='w-8 h-8 ml-2' alt='Pokebola' />
      </h1>
      <div className='flex mb-4 justify-center font-pokemon font-bold text-black'>
        <div>
          <label htmlFor='searchInput'>Name: </label>
          <input
            id='searchInput'
            type='text'
            value={searchText}
            onChange={(e) => filterByText(e.target.value)}
            className='border border-black-300 rounded px-2 py-1'
            placeholder='Search a pokémon...'
          />
        </div>
        <div className='ml-4'>
          <label htmlFor='typeFilter'> Type: </label>
          <select
            id='typeFilter'
            value={selectedType}
            onChange={(e) => filterByType(e.target.value)}
            className='border border-black-300 rounded px-2 py-1 '
          >
            <option value='' className='text-black'>
              All
            </option>
            <option value='grass' className='text-black'>
              Grass
            </option>
            <option value='fire' className='text-black'>
              Fire
            </option>
            <option value='water' className='text-black'>
              Water
            </option>
            <option value='electric' className='text-black'>
              Electric
            </option>
            <option value='normal' className='text-black'>
              Normal
            </option>
            <option value='flying' className='text-black'>
              Flying
            </option>
            <option value='poison' className='text-black'>
              Poison
            </option>
            <option value='bug' className='text-black'>
              Bug
            </option>
            <option value='ground' className='text-black'>
              Ground
            </option>
            <option value='psychic' className='text-black'>
              Psychic
            </option>
          </select>
        </div>
      </div>
      <Table
        data={filteredPokemons}
        onPokemonClick={handlePokemonClick}
        onPokemonMouseEnter={handlePokemonMouseEnter}
        onPokemonMouseLeave={handlePokemonMouseLeave}
        hoveredPokemon={hoveredPokemon}
      />
      {selectedPokemon && (
        <PokemonCard
          name={selectedPokemon.name}
          photo={selectedPokemon.photo}
          types={selectedPokemon.types}
          abilities={selectedPokemon.abilities}
          evolutions={selectedPokemon.evolutions}
          onClose={() => setSelectedPokemon(null)}
        />
      )}
      <Pagination pokemonsPerPage={pokemonsPerPage} totalPokemons={pokemonList.length} currentPage={currentPage} paginate={paginate} />
    </div>
  );
}

const Table = ({ data, onPokemonClick, onPokemonMouseEnter, onPokemonMouseLeave, hoveredPokemon }) => {
  return (
    <table className='min-w-full divide-y divide-darkblue-200 justify-center rounded-lg'>
      <thead>
        <tr>
          <th className='py-3 px-6 text-center'>Name</th>
        </tr>
      </thead>
      <tbody className='bg-white divide-y divide-gray-200'>
        {data.map((pokemon) => (
          <tr
            key={pokemon.name}
            onClick={() => onPokemonClick(pokemon)}
            onMouseEnter={() => onPokemonMouseEnter(pokemon)}
            onMouseLeave={() => onPokemonMouseLeave()}
          >
            <td
              className={`py-4 px-6 text-center cursor-pointer capitalize ${
                hoveredPokemon === pokemon ? 'text-blue-500 font-bold' : ''
              }`}
            >
              {pokemon.name.toUpperCase()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const PokemonCard = ({ name, photo, types, abilities, evolutions, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-80">
      <div className="bg-white rounded-lg p-8 max-w-md shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-pokemon font-bold text-black capitalize mb-4">{name}</h2>
          <img src={photo} alt={name} className="w-40 h-40 mx-auto rounded-full mb-4" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-pokemon font-bold text-black mb-2">Types:</h3>
          <ul className="flex justify-center">
            {types.map((type) => (
              <li
                key={type}
                className="text-sm px-3 py-1 mx-1 mb-2 rounded-full bg-blue-500 text-white font-semibold"
              >
                {type}
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-pokemon font-bold text-black mb-2">Abilities:</h3>
          <ul className="text-base font-pokemon">
            {abilities.map((ability) => (
              <li key={ability} className="capitalize">
                {ability}
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-pokemon font-bold text-black mb-2">Evolutions:</h3>
          <ul className="text-base font-pokemon">
            {evolutions.map((evolution) => (
              <li key={evolution} className="capitalize">
                {evolution}
              </li>
            ))}
          </ul>
        </div>
        <button
          onClick={onClose}
          className="mt-6 py-2 px-4 font-pokemon font-bold text-white bg-red-500 hover:bg-red-600 focus:bg-red-700 rounded-full w-full"
        >
          Close
        </button>
      </div>
    </div>
  );
};


const Pagination = ({ pokemonsPerPage, totalPokemons, currentPage, paginate }) => {
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(totalPokemons / pokemonsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className='mt-8 flex justify-center'>
      <ul className='pagination flex flex-wrap'>
        {pageNumbers.map((number) => (
          <li
            key={number}
            className={`cursor-pointer mx-1 px-3 py-1 rounded-lg ${number === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'} md:mx-2 md:px-4 md:py-2 md:rounded-xl md:text-base`}
            onClick={() => paginate(number)}
          >
            {number}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default App;





