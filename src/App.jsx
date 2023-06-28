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
          return {
            name: pokemon.name,
            photo: data.sprites.front_default,
            types: data.types.map((type) => type.type.name),
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
      <Table data={filteredPokemons} onPokemonClick={handlePokemonClick} />
      {selectedPokemon && (
        <PokemonCard
          name={selectedPokemon.name}
          photo={selectedPokemon.photo}
          types={selectedPokemon.types}
          onClose={() => setSelectedPokemon(null)}
        />
      )}
      <Pagination pokemonsPerPage={pokemonsPerPage} totalPokemons={pokemonList.length} currentPage={currentPage} paginate={paginate} />
    </div>
  );
}

const Table = ({ data, onPokemonClick }) => {
  return (
    <table className='min-w-full divide-y divide-darkblue-200 justify-center rounded-lg'>
      <thead>
        <tr>
          <th className='py-3 px-6 text-center'>Name</th>
        </tr>
      </thead>
      <tbody className='bg-white divide-y divide-gray-200'>
        {data.map((pokemon) => (
          <tr key={pokemon.name} onClick={() => onPokemonClick(pokemon)}>
            <td className='py-4 px-6 text-center cursor-pointer capitalize'>{pokemon.name.toUpperCase()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const PokemonCard = ({ name, photo, types, onClose }) => {
  return (
    <div className='fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-80'>
      <div className='bg-white rounded-lg p-8 max-w-sm'>
        <h2 className='text-xl font-bold mb-4'>{name}</h2>
        <div className='flex flex-col items-center mb-4'>
          <img src={photo} alt={name} className='w-48 h-48 mb-4' />
          <div className='flex'>
            {types.map((type) => (
              <span
                key={type}
                className={`rounded-full text-white capitalize text-xs py-1 px-2 mx-1 ${
                  type === 'grass'
                    ? 'bg-green-500'
                    : type === 'fire'
                    ? 'bg-red-500'
                    : type === 'water'
                    ? 'bg-blue-500'
                    : type === 'electric'
                    ? 'bg-yellow-500'
                    : type === 'normal'
                    ? 'bg-gray-500'
                    : type === 'flying'
                    ? 'bg-indigo-500'
                    : type === 'poison'
                    ? 'bg-purple-500'
                    : type === 'bug'
                    ? 'bg-green-500'
                    : type === 'ground'
                    ? 'bg-yellow-900'
                    : 'bg-pink-500'
                }`}
              >
                {type}
              </span>
            ))}
          </div>
        </div>
        <button className='text-sm bg-red-500 text-white px-4 py-2 rounded' onClick={onClose}>
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
    <div className='flex justify-center mt-8'>
      <nav>
        <ul className='flex space-x-2'>
          {pageNumbers.map((number) => (
            <li key={number}>
              <button
                className={`bg-gray-200 text-black hover:bg-blue-500 hover:text-white py-2 px-4 rounded ${
                  number === currentPage ? 'bg-blue-500 text-white' : ''
                }`}
                onClick={() => paginate(number)}
              >
                {number}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default App;




