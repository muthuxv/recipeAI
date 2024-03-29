import React, { useState, useEffect } from 'react';
import { Typography, List, ListItem, ListItemButton, ListItemText, TextField, Button, Stack, CircularProgress, Grid } from '@mui/material';
import SpeechRecognition , { useSpeechRecognition } from 'react-speech-recognition';
import InputAdornment from '@mui/material/InputAdornment';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';

import { Link } from 'react-router-dom';

const App = () => {
  const [search, setSearch] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const userId = localStorage.getItem('userId');
  const { transcript, resetTranscript, browserSupportsSpeechRecognition, finalTranscript} = useSpeechRecognition();
  const [isListening, setIsListening] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await fetch('http://' + process.env.REACT_APP_PATH_API + '/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ search, userId }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      setRecipes(data.output);
      console.log(data.output);
    } catch (error) {
      console.error('Error during fetch:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setSearch(transcript);

    if (finalTranscript !== '') {
      setIsListening(false);
      handleSearch({ preventDefault: () => {} });
    }

  }, [transcript, finalTranscript]);

  if (!browserSupportsSpeechRecognition) {
    return null
  }

  const handleVoice = () => {
    setIsListening(true);
    SpeechRecognition.startListening({ language: 'fr-FR' });
    resetTranscript();
  }

  return (

    <Grid container spacing={3} justifyContent="center" alignItems="center">
    <Grid item xs={12} sm={6}>
      <Typography variant="h4" align="center" style={{ marginBottom: "40px" }}>
        Rechercher une recette
      </Typography>
      <form onSubmit={handleSearch}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems="center"
          justifyContent="center"
          spacing={1}
          sx={{ mt: 1 }}
        >
          <TextField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Donne moi une recette sans gluten..."
            sx={{ width: '100%' }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <KeyboardVoiceIcon onClick={handleVoice} color={isListening ? 'primary' : 'disabled'} />
                </InputAdornment>
              ),
              sx: { cursor: 'pointer' },
            }}
          />
          <Button type="submit" variant="contained">
            Rechercher
          </Button>
        </Stack>
      </form>
      {isLoading ? (
        <CircularProgress  style={{ marginTop: "30px" }}/>
      ) : (
        <List  style={{ marginTop: "30px" }} sx={{ maxHeight: '40vh', overflow: 'auto' }}>
          {Array.isArray(recipes) && recipes.length > 0 ? (
            recipes.map((recipe) => (
              <ListItem key={recipe} component={Link} to={`/recette/${recipe}`}>
                <ListItemButton>
                  <ListItemText primary={recipe} secondary="Cliquez pour en savoir plus" />
                </ListItemButton>
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText primary={Array.isArray(recipes) ? "" : "Une erreur est survenue, veuillez réessayer"} />
            </ListItem>
          )}
        </List>
      )}
    </Grid>
  </Grid>
  );
};

export default App;

