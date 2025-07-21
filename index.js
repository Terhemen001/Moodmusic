document.addEventListener('DOMContentLoaded', function() {
    const moodButtons = document.querySelectorAll('.mood-btn');
    const tracksContainer = document.getElementById('tracks-container');
    const resultsTitle = document.getElementById('results-title');
    const loader = document.getElementById('loader');
    const audioPlayer = document.getElementById('audio-player');
    
    // Mood to search term mapping
    const moodMap = {
        happy: 'happy',
        sad: 'sad',
        energetic: 'dance',
        calm: 'meditation',
        romantic: 'love'
    };
    
    // Mood to display title mapping
    const moodTitleMap = {
        happy: 'Happy & Upbeat Tunes',
        sad: 'Songs for Reflection',
        energetic: 'Energetic Beats',
        calm: 'Calming Melodies',
        romantic: 'Romantic Songs'
    };
    
    // Add event listeners to mood buttons
    moodButtons.forEach(button => {
        button.addEventListener('click', function() {
            const mood = this.getAttribute('data-mood');
            searchTracksByMood(mood);
        });
    });
    
    // Function to search tracks based on mood using iTunes API
    function searchTracksByMood(mood) {
        const searchTerm = moodMap[mood];
        resultsTitle.textContent = moodTitleMap[mood];
        
        // Show loader and clear previous results
        loader.style.display = 'flex';
        tracksContainer.innerHTML = '';
        
        // Use iTunes API to search for tracks
        fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(searchTerm)}&media=music&entity=song&limit=12`)
            .then(response => response.json())
            .then(data => {
                loader.style.display = 'none';
                if (data.results && data.results.length > 0) {
                    displayTracks(data.results);
                } else {
                    tracksContainer.innerHTML = '<p>No tracks found for this mood. Try another mood!</p>';
                }
            })
            .catch(error => {
                loader.style.display = 'none';
                console.error('Error fetching tracks:', error);
                tracksContainer.innerHTML = '<p>Sorry, we couldn\'t load tracks right now. Please try again later.</p>';
            });
    }
    
    // Function to display tracks
    function displayTracks(tracks) {
        tracks.forEach(track => {
            const trackElement = document.createElement('div');
            trackElement.className = 'track';
            
            // Use the album artwork (100x100 size)
            let coverImage = track.artworkUrl100.replace('100x100', '250x250');
            
            trackElement.innerHTML = `
                <img src="${coverImage}" alt="${track.trackName}" class="track-img">
                <div class="track-title">${track.trackName}</div>
                <div class="track-artist">${track.artistName}</div>
                <div class="track-controls">
                    <button class="play-btn" data-preview="${track.previewUrl}">
                        <i class="fas fa-play"></i>
                    </button>
                    <a href="${track.trackViewUrl}" target="_blank" class="itunes-link">
                        <i class="fab fa-apple"></i> iTunes
                    </a>
                </div>
            `;
            
            tracksContainer.appendChild(trackElement);
        });
        
        // Add event listeners to play buttons
        document.querySelectorAll('.play-btn').forEach(button => {
            button.addEventListener('click', function() {
                const previewUrl = this.getAttribute('data-preview');
                if (previewUrl) {
                    if (audioPlayer.src === previewUrl && !audioPlayer.paused) {
                        audioPlayer.pause();
                        this.innerHTML = '<i class="fas fa-play"></i>';
                    } else {
                        audioPlayer.src = previewUrl;
                        audioPlayer.play();
                        this.innerHTML = '<i class="fas fa-pause"></i>';
                        
                        // Reset other buttons
                        document.querySelectorAll('.play-btn').forEach(btn => {
                            if (btn !== this) {
                                btn.innerHTML = '<i class="fas fa-play"></i>';
                            }
                        });
                    }
                }
            });
        });
        
        // Update play/pause button when audio ends
        audioPlayer.addEventListener('ended', function() {
            document.querySelectorAll('.play-btn').forEach(btn => {
                btn.innerHTML = '<i class="fas fa-play"></i>';
            });
        });
    }
});
