document.addEventListener('DOMContentLoaded', function() {
    const apiKey = '600ee9e333289038c1e92065fba00427';
    const moviesContainer = document.getElementById('movies');
    const favoritesContainer = document.getElementById('favorites-movies');
    const watchlistContainer = document.getElementById('watchlist-movies');


    function searchMovies() {
        const genre = document.getElementById('genre').value;
        const year = document.getElementById('year').value;
        const rating = document.getElementById('rating').value;
        const actors = document.getElementById('actors').value;
        const directors = document.getElementById('directors').value;
        const movieName = document.getElementById('movieName').value;

        let url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genre}&primary_release_year=${year}&vote_average.gte=${rating}`;

        if (actors) {
            url += `&with_cast=${actors.split(',').map(actor => actor.trim()).join(',')}`;
        }
        if (directors) {
            url += `&with_crew=${directors.split(',').map(director => director.trim()).join(',')}`;
        }

        fetch(url)
            .then(response => response.json())
            .then(data => {
                displayMovies(data.results);
            })
            .catch(error => {
                console.error('Error fetching movies:', error);
            });
    }

    function displayMovies(movies) {
        moviesContainer.innerHTML = '';

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

        document.querySelectorAll('[data-target="#movieModal"]').forEach(button => {
            button.addEventListener('click', (event) => {
                const movieId = event.target.getAttribute('data-id');
                fetchMovieDetails(movieId);
            });
        });
    }

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

    // Firebase Configuration
    var firebaseConfig = {
        apiKey: "AIzaSyAFZXe81rgwKmQb9qYozptlw-ai9rc3JtA",
        authDomain: "movie-recommendation-app-ad8a9.firebaseapp.com",
        projectId: "movie-recommendation-app-ad8a9",
        storageBucket: "gs://movie-recommendation-app-ad8a9.appspot.com",
        messagingSenderId: "646703389786",
        appId: "1:646703389786:web:500b84fc9eb3ffb6ac8c63"
    };

    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            auth.signInWithEmailAndPassword(email, password)
                .then(userCredential => {
                    window.location.href = 'index.html'; // Redirect to home page after login
                    console.log('User logged in:', userCredential.user);
                })
                .catch(error => {
                    console.error('Error logging in:', error);
                });
        });
    }

    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;

            auth.createUserWithEmailAndPassword(email, password)
                .then(userCredential => {
                    window.location.href = 'index.html'; // Redirect to home page after sign-up
                    console.log('User signed up:', userCredential.user);
                })
                .catch(error => {
                    console.error('Error signing up:', error);
                });
        });
    }

    document.getElementById('add-to-favorites').addEventListener('click', (event) => {
        const movieId = event.target.getAttribute('data-id');
        addToFavorites(movieId);
    });

    document.getElementById('add-to-watchlist').addEventListener('click', (event) => {
        const movieId = event.target.getAttribute('data-id');
        addToWatchlist(movieId);
    });

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


    window.searchMovies = searchMovies; // Expose searchMovies function to global scope
});