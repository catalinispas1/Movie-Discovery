import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import { configDotenv } from "dotenv";
configDotenv();

const API_KEY = process.env.API_KEY;
console.log(API_KEY);
const port = 3000;
const app = express();
const config = {
    headers: {Authorization: "Bearer " + API_KEY}
}
const BASE_URL = "https://api.themoviedb.org/3/";
const IMAGE_URL = "https://image.tmdb.org/t/p/w300";
const BACKDROP_PATH = "https://image.tmdb.org/t/p/original/";

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));


app.get("/", async (req, res) => {
    const queryParams = req.query;
    let page = queryParams.page;
    if (page === undefined) page = 1;
    
    const response = await axios.get(BASE_URL + "discover/movie" + "?page=" + page, config);
    const result = response.data;
    res.render("index.ejs", {movies: result, 
                            imageUrl: IMAGE_URL, 
                            selectedPage: parseInt(page), 
                            pageNumber: 500, 
                            additionalUrl: "?"
                        });
});

app.get("/search", async (req, res) => {
    const queryParams = req.query;

    const searchInput = queryParams.search_input;
    console.log(searchInput); 

    let page = queryParams.page;
    if (page === undefined) page = 1;
    console.log(page);

    const response = await axios.get(BASE_URL + "search/movie" + "?query=" + searchInput + "&page=" + page, config);
    const result = response.data;
    console.log(result.total_pages);
    res.render("index.ejs", {movies: result, 
                            imageUrl: IMAGE_URL, 
                            selectedPage: parseInt(page), 
                            pageNumber: Math.min(500, result.total_pages),
                            additionalUrl: "search?search_input=" + searchInput + "&"
                        });
});

app.get("/filter", async (req, res) => {
    const queryParams = req.query;
    console.log(queryParams);

    let page = queryParams.page;
    if (page === undefined) page = 1;

    let query = "?";

    if (queryParams.primary_release_year) {
        query += `primary_release_year=${queryParams.primary_release_year}&`
    }

    if (queryParams.with_genres) {
        query += `with_genres=${queryParams.with_genres}&`;
    }

    if (queryParams.include_adult) {
        query += "include_adult=true&"
    }

    query += "sort_by=" + queryParams.sort_by;

    // if (query !== "?") query = query.slice(0, -1);

    console.log(query);

    const response = await axios.get(BASE_URL + "discover/movie" + query +"&page=" + page, config);
    const result = response.data;

    res.render("index.ejs", {movies: result, 
                            imageUrl: IMAGE_URL, 
                            selectedPage: parseInt(page), 
                            pageNumber: Math.min(500, result.total_pages),
                            additionalUrl: "filter" + query + "&"
                });
});


app.get("/details", async (req, res) => {
    const movieId = req.query.movie_id;
    console.log(movieId);

    const response = await axios.get(BASE_URL + "/movie/" + movieId, config);
    const result = response.data;
    console.log(result);

    res.render("current_movie.ejs", {movie: result, backdropUrl: BACKDROP_PATH});
});


app.listen(port, () => {
    console.log("Server started on " + port + " port"); 
});