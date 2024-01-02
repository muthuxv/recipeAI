import React, { useState, useEffect } from "react";
import { useParams, Link } from 'react-router-dom';
import { Stack, Typography, CircularProgress, List, ListItem, ListItemButton, ListItemText, Button } from '@mui/material';
import { FaStar, FaWhatsapp , FaTwitter, FaCopy, FaEnvelope } from 'react-icons/fa'; // Import des icônes

const Recette = () => {
    const { recipe } = useParams();
    const [recette, setRecette] = useState({});
    const [recommendations, setRecommendations] = useState([]);
    const [sideSuggestions, setSideSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isClicked, setIsClicked] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:3004/recette/${recipe}`);
                const data = await response.json();
                setRecette(data.output);
                setIsLoading(false);

                const checkFavoriteResponse = await fetch(`http://localhost:3004/api/recipes/name/${recipe}`);
                const existingRecipe = await checkFavoriteResponse.json();

                const checkFavoriteRecipesResponse = await fetch(`http://localhost:3004/api/favorite-recipes/${userId}`);
                const favoriteRecipesData = await checkFavoriteRecipesResponse.json();
                console.log(favoriteRecipesData);

                for (const favRecipe of favoriteRecipesData.favoriteRecipes) {
                    const checkRecipeExistsResponse = await fetch(`http://localhost:3004/api/recipes/${favRecipe.recipeId}`);
                    const existingRecipe = await checkRecipeExistsResponse.json();

                    if (existingRecipe.recipe && existingRecipe.recipe.name === recipe) {
                        setIsFavorite(true);
                        break;
                    }
                }
            } catch (error) {
                console.error('Error:', error);
                setIsLoading(false);
            }
        };

        fetchData();
    }, [recipe, userId]);

    useEffect(() => {
        const fetchRecommendationsData = async () => {
            try {
                const response = await fetch(`http://localhost:3004/recommendations/${recipe}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                const data = await response.json();
                setRecommendations(data.output);
            } catch (error) {
                console.error('Error:', error);
            }
        };

        fetchRecommendationsData();
    }, [recipe]);

    const fetchSideSuggestionsData = async () => {
        try {
            const response = await fetch(`http://localhost:3004/side-suggestions/${recipe}`);
            const data = await response.json();
            setSideSuggestions(data);
            setIsClicked(true);
            console.log(data);
        } catch (error) {
            console.error('Error fetching side suggestions data:', error);
        }
    };

    useEffect(() => {
   
    }, [sideSuggestions]);

    const shareOnWhatsapp = () => {
        const text = `Voici la liste d'ingrédients : ${recette.ingredients}`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    const shareOnTwitter = () => {
        const shareUrl = `https://twitter.com/intent/tweet?text=Regardez%20ma%20liste%20de%20course%20pour%20la%20recette%20${recipe}:%20${recette.ingredients}`;
        window.open(shareUrl, '_blank');
    };

    const copyToClipboard = () => {
        const recipeLink = recette.ingredients;
        navigator.clipboard.writeText(recipeLink)
            .then(() => alert('Recette copiée dans le presse-papier'))
            .catch(err => console.error('Erreur lors de la copie : ', err));
    };

    const sendByEmail = () => {
        const recipeLink = recette.ingredients;
        window.location.href = `mailto:?subject=Liste de course&body=Voici la liste de course pour cette recette : ${recipeLink}`;
    };

    const handleAddToFavorite = async () => {
        try {
            const checkRecipeExistsResponse = await fetch(`http://localhost:3004/api/recipes/name/${recipe}`);
            const existingRecipe = await checkRecipeExistsResponse.json();

            let recipeIdToAdd = existingRecipe.recipe.id;

            if (recipeIdToAdd) {
                if (userId) {
                    await fetch(`http://localhost:3004/api/favorite-recipes`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            userId: userId,
                            recipeId: recipeIdToAdd,
                        }),
                    });
                    setIsFavorite(true);
                }
            }
        } catch (error) {
            console.error('Error adding recipe to favorites:', error);
        }
    };

    return (
        <Stack spacing={3}>
            <Typography variant="h4" gutterBottom>
                Recette : {recipe}
            </Typography>
            {isLoading ? (
                <CircularProgress />
            ) : (
                <>
                    <Typography variant="body1" paragraph>
                        Temps de préparation : {recette.duration}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Ingrédients : {recette.ingredients}
                    </Typography>
                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="outlined"
                            startIcon={<FaWhatsapp />}
                            onClick={shareOnWhatsapp}
                        >
                            WhatsApp
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<FaTwitter />}
                            onClick={shareOnTwitter}
                        >
                            Twitter
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<FaCopy />}
                            onClick={copyToClipboard}
                        >
                            Copier
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<FaEnvelope />}
                            onClick={sendByEmail}
                        >
                            Email
                        </Button>
                    </Stack>
                    <Typography variant="body1" paragraph>
                        Instructions : {recette.instructions}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Nombre de portions : {recette.servings}
                    </Typography>

                    <Button
                        type="button"
                        variant="contained"
                        sx={{ alignSelf: "center" }}
                        onClick={fetchSideSuggestionsData}
                    >
                        Proposition d’accompagnement
                    </Button>

                    <Button
                        variant="contained"
                        color='success'
                        onClick={handleAddToFavorite}
                        startIcon={<FaStar />}
                        disabled={isFavorite}
                    >
                        {isFavorite ? 'Ajouté aux favoris' : 'Ajouter aux favoris'}
                    </Button>
                    {isClicked && (
                        <>
                            <List sx={{ maxHeight: '40vh', overflow: 'auto' }}>
                                {sideSuggestions.output.map((recipe, index) => (
                                    <ListItem key={index}>
                                        <ListItemButton>
                                            <ListItemText primary={recipe} />
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                            </List>
                        </>
                    )}
                </>
            )}

            <Typography variant="h4" gutterBottom>
                Recommandations pour : {recipe}
            </Typography>

            {isLoading ? (
                <CircularProgress />
            ) : (
                <>
                    <List sx={{ maxHeight: '40vh', overflow: 'auto' }}>
                        {recommendations.map((recipe, index) => (
                            <ListItem key={index} component={Link} to={`/recette/${recipe}`}>
                                <ListItemButton>
                                    <ListItemText primary={recipe} secondary="Cliquez pour en savoir plus" />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </>
            )}
        </Stack>
    );
};

export default Recette;
