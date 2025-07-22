document.addEventListener('DOMContentLoaded', function() {
    const moodButtons = document.querySelectorAll('.mood-btn');
    const countrySelect = document.getElementById('country-select');
    const tracksContainer = document.getElementById('tracks-container');
    const resultsTitle = document.getElementById('results-title');
    const loader = document.getElementById('loader');
    const audioPlayer = document.getElementById('audio-player');
    
    // Mood to search term mapping with _default fallback
    const moodMap = {
        happy: {
            us: 'happy pop',
            gb: 'happy britpop',
            jp: 'happy j-pop',
            in: 'happy bollywood',
            br: 'happy sertanejo',
            fr: 'happy french pop',
            de: 'happy german pop',
            kr: 'happy k-pop',
            ng: 'happy afrobeats',
            mx: 'happy banda',
            _default: 'happy'
        },
        sad: {
            us: 'sad country',
            gb: 'sad british indie',
            jp: 'sad japanese ballad',
            in: 'sad indian classical',
            br: 'sad bossa nova',
            fr: 'sad chanson',
            de: 'sad dark folk',
            kr: 'sad korean r&b',
            ng: 'sad afro-soul',
            mx: 'sad ranchera',
            _default: 'sad'
        },
        energetic: {
            us: 'energetic rock n roll',
            gb: 'energetic britrock',
            jp: 'energetic j-rock',
            in: 'energetic bollywood remix',
            br: 'energetic samba',
            fr: 'energetic french house',
            de: 'energetic techno',
            kr: 'energetic k-hip hop',
            ng: 'energetic naija hip hop',
            mx: 'energetic mexican rock',
            _default: 'energetic'
        },
        calm: {
            us: 'calm ambient',
            gb: 'calm downtempo',
            jp: 'calm japanese lofi',
            in: 'calm indian flute',
            br: 'calm bossa nova',
            fr: 'calm french lounge',
            de: 'calm krautrock',
            kr: 'calm k-indie acoustic',
            ng: 'calm yoruba meditation',
            mx: 'calm mexican harp',
            _default: 'calm'
        },
        romantic: {
            us: 'romantic r&b',
            gb: 'romantic british soul',
            jp: 'romantic japanese city pop',
            in: 'romantic bollywood romantic',
            br: 'romantic samba-canção',
            fr: 'romantic zouk love',
            de: 'romantic german pop ballad',
            kr: 'romantic korean ballad',
            ng: 'romantic naija soul',
            mx: 'romantic bolero',
            _default: 'romantic'
        }
    };
    
    // Mood to display title mapping
    const moodTitleMap = {
        happy: 'Happy & Upbeat Tunes',
        sad: 'Songs for Reflection',
        energetic: 'Energetic Beats',
        calm: 'Calming Melodies',
        romantic: 'Romantic Songs'
    };
    
    // Country to display name mapping
    const countryNameMap = {
        us: 'United States',
        gb: 'United Kingdom',
        jp: 'Japan',
        in: 'India',
        br: 'Brazil',
        fr: 'France',
        de: 'Germany',
        kr: 'South Korea',
        ng: 'Nigeria',
        mx: 'Mexico'
    };
    
    // Add event listeners to mood buttons
    moodButtons.forEach(button => {
        button.addEventListener('click', function() {
            const mood = this.getAttribute('data-mood');
            const country = countrySelect.value;
            searchTracksByMoodAndCountry(mood, country);
        });
    });
    
    // Add event listener to country dropdown
    countrySelect.addEventListener('change', function() {
        const activeMoodBtn = document.querySelector('.mood-btn.active');
        if (activeMoodBtn) {
            const mood = activeMoodBtn.getAttribute('data-mood');
            const country = countrySelect.value;
            searchTracksByMoodAndCountry(mood, country);
        }
    });

    // Country metadata search
    function isTrackFromCountry(track, countryCode) {
        const countryIndicators = {
            us: ['american', 'usa', 'united states', 'motown', 'nashville', 'la rap'],
            gb: ['british', 'uk', 'england', 'london', 'manchester', 'scottish'],
            jp: ['japanese', 'japan', 'tokyo', 'osaka', 'j-pop', 'j-rock'],
            in: ['indian', 'india', 'bollywood', 'mumbai', 'delhi', 'punjabi'],
            br: ['brazilian', 'brazil', 'rio', 'são paulo', 'baiana'],
            fr: ['french', 'france', 'paris', 'lyon', 'toulouse'],
            de: ['german', 'germany', 'berlin', 'munich', 'hamburg'],
            kr: ['korean', 'korea', 'seoul', 'busan', 'k-pop'],
            ng: ['nigerian', 'nigeria', 'lagos', 'afrobeats', 'naija'],
            mx: ['mexican', 'mexico', 'cdmx', 'monterrey', 'banda']
        };
        
        const indicators = countryIndicators[countryCode] || [];
        return (
            track.country === countryCode.toUpperCase() ||
            indicators.some(term => 
                (track.primaryGenreName?.toLowerCase().includes(term) ||
                track.artistName?.toLowerCase().includes(term))
            )
        );
    }

    // Search function
    function searchTracksByMoodAndCountry(mood, country) {
        // Get country-specific term or fallback
        const searchTerm = moodMap[mood]?.[country] || 
                         `${moodMap[mood]._default} ${countryNameMap[country]}`;
        
        // Show loader and clear previous results
        loader.style.display = 'flex';
        tracksContainer.innerHTML = '';
        
        // Mark active mood button
        moodButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`.mood-btn[data-mood="${mood}"]`)?.classList.add('active');
        
        fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(searchTerm)}&media=music&entity=song&limit=12&country=${country}`)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => {
                loader.style.display = 'none';
                if (data.results && data.results.length > 0) {
                    // Apply country filtering
                    const filteredTracks = data.results.filter(track => 
                        isTrackFromCountry(track, country)
                    );
                    
                    if (filteredTracks.length < 5) {
                        // Fallback to less strict filtering if few results
                        displayTracks(data.results.slice(0, 6), country);
                    } else {
                        displayTracks(filteredTracks, country);
                    }
                } else {
                    tracksContainer.innerHTML = '<p>No tracks found for this mood/country combination. Try another selection.</p>';
                }
            })
            .catch(error => {
                loader.style.display = 'none';
                console.error('Error fetching tracks:', error);
                tracksContainer.innerHTML = '<p>Sorry, we couldn\'t load tracks right now. Please try again later.</p>';
            });
    }
    
    // Function to display tracks
    function displayTracks(tracks, country) {
        // Clear previous tracks
        tracksContainer.innerHTML = '';
        
        // Country flag emojis
        const countryFlags = {
            us: '🇺🇸', gb: '🇬🇧', jp: '🇯🇵', 
            in: '🇮🇳', br: '🇧🇷', fr: '🇫🇷',
            de: '🇩🇪', kr: '🇰🇷', ng: '🇳🇬', mx: '🇲🇽'
        };
        
        tracks.forEach(track => {
            const trackElement = document.createElement('div');
            trackElement.className = 'track';
            
            // Use larger album artwork when available
            let coverImage = track.artworkUrl100?.replace('100x100', '250x250') || 'https://via.placeholder.com/250';
            
            // Format price with local currency
            const price = track.trackPrice ? 
                new Intl.NumberFormat(getLocaleFromCountry(country), {
                    style: 'currency',
                    currency: track.currency
                }).format(track.trackPrice) : 'Price not available';
            
            trackElement.innerHTML = `
                <div class="country-flag">${countryFlags[country] || ''}</div>
                <img src="${coverImage}" alt="${track.trackName}" class="track-img">
                <div class="track-title">${track.trackName}</div>
                <div class="track-artist">${track.artistName}</div>
                <div class="track-price">${price}</div>
                <div class="track-controls">
                    <button class="play-btn" data-preview="${track.previewUrl || ''}">
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
                if (!previewUrl) return;
                
                if (audioPlayer.src === previewUrl && !audioPlayer.paused) {
                    audioPlayer.pause();
                    this.innerHTML = '<i class="fas fa-play"></i>';
                } else {
                    audioPlayer.src = previewUrl;
                    audioPlayer.play()
                        .then(() => {
                            this.innerHTML = '<i class="fas fa-pause"></i>';
                            // Reset other buttons
                            document.querySelectorAll('.play-btn').forEach(btn => {
                                if (btn !== this) btn.innerHTML = '<i class="fas fa-play"></i>';
                            });
                        })
                        .catch(err => console.error('Playback failed:', err));
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
    
    // Helper function to get locale from country code
    function getLocaleFromCountry(countryCode) {
        const localeMap = {
            us: 'en-US',
            gb: 'en-GB',
            jp: 'ja-JP',
            in: 'en-IN',
            br: 'pt-BR',
            fr: 'fr-FR',
            de: 'de-DE',
            kr: 'ko-KR',
            ng: 'en-US', // Changed from en-NG for better currency support
            mx: 'es-MX'
        };
        return localeMap[countryCode] || 'en-US';
    }
});
