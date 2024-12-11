document.addEventListener('DOMContentLoaded', function () {
    const apiKey = '600ee9e333289038c1e92065fba00427';
    const moviesContainer = document.getElementById('movies');

    // Search for movies using TMDB API
    function searchMovies() {
        const movieName = document.getElementById('movieName').value;
        const genre = document.getElementById('genre').value;
        const actors = document.getElementById('actors').value;
        const directors = document.getElementById('directors').value;
        const rating = document.getElementById('rating').value;

        let url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${movieName}`;

        // Append additional parameters if provided
        if (genre) url += `&with_genres=${genre}`;
        if (rating) url += `&vote_average.gte=${rating}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                displayMovies(data.results);
            })
            .catch(error => {
                console.error('Error fetching movies:', error);
            });
    }

    // Display movies dynamically
    function displayMovies(movies) {
        moviesContainer.innerHTML = ''; // Clear existing content

        if (movies.length === 0) {
            moviesContainer.innerHTML = '<p class="text-white">No movies found.</p>';
            return;
        }

        movies.forEach(movie => {
            const movieElement = document.createElement('div');
            movieElement.classList.add('col-md-3', 'movie');
            movieElement.innerHTML = `
                <div class="card">
                    <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" class="card-img-top" alt="${movie.title}">
                    <div class="card-body">
                        <h5 class="card-title">${movie.title}</h5>
                        <p class="card-text">Rating: ${movie.vote_average}</p>
                        <button class="btn btn-primary" data-toggle="modal" data-target="#movieModal" data-id="${movie.id}">View Details</button>
                    </div>
                </div>
            `;
            moviesContainer.appendChild(movieElement);
        });

        // Attach event listeners to "View Details" buttons
        document.querySelectorAll('[data-target="#movieModal"]').forEach(button => {
            button.addEventListener('click', (event) => {
                const movieId = event.target.getAttribute('data-id');
                fetchMovieDetails(movieId);
            });
        });
    }

    // Fetch and display movie details
    function fetchMovieDetails(movieId) {
        const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&append_to_response=videos`;

        fetch(url)
            .then(response => response.json())
            .then(movie => {
                const modalBody = document.querySelector('#movieModal .modal-body');
                const trailer = movie.videos.results.find(video => video.type === 'Trailer');
                modalBody.innerHTML = `
                    <h5>${movie.title}</h5>
                    <p>${movie.overview}</p>
                    <p><strong>Release Date:</strong> ${movie.release_date}</p>
                    <p><strong>Rating:</strong> ${movie.vote_average}</p>
                    ${trailer ? `<div class="embed-responsive embed-responsive-16by9"><iframe class="embed-responsive-item" src="https://www.youtube.com/embed/${trailer.key}" allowfullscreen></iframe></div>` : ''}
                `;
                document.getElementById('add-to-favorites').setAttribute('data-id', movie.id);
                document.getElementById('add-to-watchlist').setAttribute('data-id', movie.id);
            })
            .catch(error => {
                console.error('Error fetching movie details:', error);
            });
    }

    // Firebase configuration
    var firebaseConfig = {
        apiKey: "AIzaSyAFZXe81rgwKmQb9qYozptlw-ai9rc3JtA",
        authDomain: "movie-recommendation-app-ad8a9.firebaseapp.com",
        projectId: "movie-recommendation-app-ad8a9",
        storageBucket: "movie-recommendation-app-ad8a9.appspot.com",
        messagingSenderId: "646703389786",
        appId: "1:646703389786:web:500b84fc9eb3ffb6ac8c63"
    };

    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();

    // Add to favorites
    function addToFavorites(movieId) {
        const user = auth.currentUser;
        if (user) {
            db.collection('favorites').add({
                userId: user.uid,
                movieId: movieId
            })
                .then(() => {
                    console.log('Movie added to favorites');
                })
                .catch(error => {
                    console.error('Error adding to favorites:', error);
                });
        } else {
            console.log('User not logged in');
        }
    }

    // Add to watchlist
    function addToWatchlist(movieId) {
        const user = auth.currentUser;
        if (user) {
            db.collection('watchlist').add({
                userId: user.uid,
                movieId: movieId
            })
                .then(() => {
                    console.log('Movie added to watchlist');
                })
                .catch(error => {
                    console.error('Error adding to watchlist:', error);
                });
        } else {
            console.log('User not logged in');
        }
    }

    // Event listeners for adding to favorites/watchlist
    document.getElementById('add-to-favorites').addEventListener('click', (event) => {
        const movieId = event.target.getAttribute('data-id');
        addToFavorites(movieId);
    });

    document.getElementById('add-to-watchlist').addEventListener('click', (event) => {
        const movieId = event.target.getAttribute('data-id');
        addToWatchlist(movieId);
    });

    // Expose searchMovies function to global scope
    window.searchMovies = searchMovies;
});
