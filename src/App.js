import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    position: 'Torwart',
    jerseyNumber: '',
    nationality: '',
    age: ''
  });
  const [editingPlayer, setEditingPlayer] = useState(null);

  // Backend URL - ÄNDERE FALLS ANDERER PORT!
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Spieler laden
  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/players`);
      const data = await response.json();
      setPlayers(data);
    } catch (error) {
      console.error('Fehler beim Laden:', error);
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  };

  // Neuen Spieler hinzufügen
  const handleAddPlayer = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlayer)
      });
      
      if (response.ok) {
        const addedPlayer = await response.json();
        setPlayers([...players, addedPlayer]);
        setNewPlayer({
          name: '',
          position: 'Torwart',
          jerseyNumber: '',
          nationality: '',
          age: ''
        });
        alert('Spieler hinzugefügt!');
      }
    } catch (error) {
      console.error('Fehler:', error);
      alert('Fehler beim Hinzufügen');
    }
  };

  // Spieler löschen
  const handleDeletePlayer = async (id) => {
    if (!window.confirm('Spieler wirklich löschen?')) return;
    
    try {
      const response = await fetch(`${API_URL}/players/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setPlayers(players.filter(player => player._id !== id));
        alert('Spieler gelöscht!');
      }
    } catch (error) {
      console.error('Fehler:', error);
      alert('Fehler beim Löschen');
    }
  };

  // Spieler bearbeiten
  const handleUpdatePlayer = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/players/${editingPlayer._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPlayer)
      });
      
      if (response.ok) {
        const updatedPlayer = await response.json();
        setPlayers(players.map(p => 
          p._id === updatedPlayer._id ? updatedPlayer : p
        ));
        setEditingPlayer(null);
        alert('Spieler aktualisiert!');
      }
    } catch (error) {
      console.error('Fehler:', error);
      alert('Fehler beim Aktualisieren');
    }
  };

  // Nach Position filtern
  const [filterPosition, setFilterPosition] = useState('alle');

  const filteredPlayers = filterPosition === 'alle' 
    ? players 
    : players.filter(player => 
        player.position.toLowerCase().includes(filterPosition.toLowerCase())
      );

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Lade Bayern Spieler...</p>
      </div>
    );
  }

  return (
    <div className="App">
      {/* HEADER */}
      <header className="header">
        <h1>⚽ FC Bayern München Spieler-Datenbank</h1>
        <p>Verwaltung der Saison 2025/2026 mit MongoDB</p>
        <div className="stats">
          <span>📊 {players.length} Spieler im Kader</span>
          <span>📍 {API_URL}</span>
        </div>
      </header>

      {/* FILTER */}
      <div className="filter-section">
        <h3>Filter nach Position:</h3>
        <div className="filter-buttons">
          {['alle', 'Torwart', 'Abwehr', 'Mittelfeld', 'Sturm'].map(pos => (
            <button
              key={pos}
              className={filterPosition === pos ? 'active' : ''}
              onClick={() => setFilterPosition(pos)}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>

      {/* SPIELER LISTE */}
      <div className="players-grid">
        {filteredPlayers.map(player => (
          <div key={player._id} className="player-card">
            <div className="player-header">
              <span className="jersey-number">#{player.jerseyNumber}</span>
              <div className="player-actions">
                <button 
                  className="edit-btn"
                  onClick={() => setEditingPlayer({...player})}
                >
                  ✏️
                </button>
                <button 
                  className="delete-btn"
                  onClick={() => handleDeletePlayer(player._id)}
                >
                  🗑️
                </button>
              </div>
            </div>
            
            <h3 className="player-name">{player.name}</h3>
            
            <div className="player-details">
              <p><strong>Position:</strong> {player.position}</p>
              <p><strong>Nationalität:</strong> {player.nationality}</p>
              <p><strong>Alter:</strong> {player.age}</p>
              {player.since && <p><strong>Seit:</strong> {player.since}</p>}
              {player.note && <p><strong>Notiz:</strong> {player.note}</p>}
            </div>
            
            <div className={`position-badge ${player.position.toLowerCase()}`}>
              {player.position}
            </div>
          </div>
        ))}
      </div>

      {/* NEUER SPIELER FORMULAR */}
      <div className="form-section">
        <h2>➕ Neuen Spieler hinzufügen</h2>
        <form onSubmit={handleAddPlayer} className="player-form">
          <input
            type="text"
            placeholder="Name (z.B. Lennart Karl)"
            value={newPlayer.name}
            onChange={(e) => setNewPlayer({...newPlayer, name: e.target.value})}
            required
          />
          
          <select
            value={newPlayer.position}
            onChange={(e) => setNewPlayer({...newPlayer, position: e.target.value})}
          >
            <option value="Torwart">Torwart</option>
            <option value="Abwehr">Abwehr</option>
            <option value="Mittelfeld">Mittelfeld</option>
            <option value="Sturm">Sturm</option>
          </select>
          
          <input
            type="number"
            placeholder="Trikotnummer"
            value={newPlayer.jerseyNumber}
            onChange={(e) => setNewPlayer({...newPlayer, jerseyNumber: e.target.value})}
            min="1"
            max="99"
          />
          
          <input
            type="text"
            placeholder="Nationalität"
            value={newPlayer.nationality}
            onChange={(e) => setNewPlayer({...newPlayer, nationality: e.target.value})}
          />
          
          <input
            type="number"
            placeholder="Alter"
            value={newPlayer.age}
            onChange={(e) => setNewPlayer({...newPlayer, age: e.target.value})}
            min="16"
            max="50"
          />
          
          <button type="submit" className="add-button">
            Spieler hinzufügen
          </button>
        </form>
      </div>

      {/* BEARBEITUNGS MODAL */}
      {editingPlayer && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>✏️ Spieler bearbeiten: {editingPlayer.name}</h2>
            <form onSubmit={handleUpdatePlayer}>
              <input
                type="text"
                value={editingPlayer.name}
                onChange={(e) => setEditingPlayer({...editingPlayer, name: e.target.value})}
                required
              />
              
              <select
                value={editingPlayer.position}
                onChange={(e) => setEditingPlayer({...editingPlayer, position: e.target.value})}
              >
                <option value="Torwart">Torwart</option>
                <option value="Abwehr">Abwehr</option>
                <option value="Mittelfeld">Mittelfeld</option>
                <option value="Sturm">Sturm</option>
              </select>
              
              <div className="modal-buttons">
                <button type="submit">Speichern</button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setEditingPlayer(null)}
                >
                  Abbrechen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="footer">
        <p>🔗 Backend: {API_URL} | 🗄️ MongoDB Atlas | ⚛️ React Frontend</p>
        <p>ℹ️ {players.length} Spieler geladen | Letztes Update: {new Date().toLocaleTimeString()}</p>
        <button onClick={fetchPlayers} className="refresh-btn">
          🔄 Aktualisieren
        </button>
      </footer>
    </div>
  );
}

export default App;