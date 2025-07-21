document.addEventListener('DOMContentLoaded', function() {
    const moodButtons = document.querySelectorAll('.mood-btn');
    const tracksContainer = document.getElementById('tracks-container');
    const resultsTitle = document.getElementById('results-title');
    const loader = document.getElementById('loader');
    const audioPlayer = document.getElementById('audio-player');
    
    // Mood to search term mapping
    const moodMap = {
        happy: 'happy OR upbeat OR joyful',
        sad: 'sad OR melancholy OR emotional',
        energetic: 'energetic OR workout OR dance',
        calm: 'calm OR relaxing OR meditation',
        romantic: 'romantic OR love OR slow'
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
    
    // Function to search tracks based on mood
    function searchTracksByMood(mood) {
        const searchTerm = moodMap[mood];
        resultsTitle.textContent = moodTitleMap[mood];
        
        // Show loader and clear previous results
        loader.style.display = 'flex';
        tracksContainer.innerHTML = '';
        
        // Use Deezer API to search for tracks
        fetch(`https://api.deezer.com/search?q=${encodeURIComponent(searchTerm)}&limit=12`)
            .then(response => response.json())
            .then(data => {
                loader.style.display = 'none';
                displayTracks(data.data);
            })
            .catch(error => {
                loader.style.display = 'none';
                console.error('Error fetching tracks:', error);
                tracksContainer.innerHTML = '<p>Sorry, we couldn\'t load tracks right now. Please try again later.</p>';
            });
    }
    
    // Function to display tracks
    function displayTracks(tracks) {
        if (!tracks || tracks.length === 0) {
            tracksContainer.innerHTML = '<p>No tracks found for this mood. Try another mood!</p>';
            return;
        }
        
        tracks.forEach(track => {
            const trackElement = document.createElement('div');
            trackElement.className = 'track';
            
            // Use the album cover (medium size), fallback to artist picture if not available
            let coverImage = track.album?.cover_medium || track.artist?.picture_medium || 'https://via.placeholder.com/250';
            
            trackElement.innerHTML = `
                <img src="${coverImage}" alt="${track.title}" class="track-img">
                <div class="track-title">${track.title}</div>
                <div class="track-artist">${track.artist.name}</div>
                <div class="track-controls">
                    <button class="play-btn" data-preview="${track.preview}">
                        <i class="fas fa-play"></i>
                    </button>
                    <a href="${track.link}" target="_blank" class="deezer-link">
                        <i class="fab fa-deezer"></i> Deezer
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
