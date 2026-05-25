# Spotify Multidimensional Data Visualization

Flask + D3.js app that explores Spotify tracks from 1921 to 2020 using four linked multidimensional views. The dataset is sampled — up to 1,500 tracks, balanced per decade from a larger CSV corpus — and all 9 audio features are normalized to [0, 1] before any computation or rendering.

## Visualizations

| Panel | Technique | Analytical Task |
|---|---|---|
| Top-left | **RadViz** | T1 · T3 |
| Top-right | **Star Coordinates** | T3 |
| Bottom-left | **Parallel Coordinates** | T2 |
| Bottom-right | **PCA Projection** | T1 · T2 |

- **T1** – Do tracks from the same decade share a common audio profile?
- **T2** – What features separate high-popularity from low-popularity tracks?
- **T3** – How do dominant audio dimensions shift across decades?

## Design Rationale

| Technique | Why chosen |
|---|---|
| **RadViz** | Places all 9 features as anchors around a circle — the pull toward each anchor shows which features dominate a group of tracks, making decade-level patterns easy to spot. |
| **Star Coordinates** | Axes are draggable, so you can manually rotate and scale dimensions until decades separate — direct exploration of which audio features drive the shift over time. |
| **Parallel Coordinates** | Brushing each axis isolates specific feature ranges, so you can immediately see which combinations show up consistently in high or low popularity tracks. |
| **PCA Projection** | Reduces 9 dimensions down to 2. With decade coloring you can see if tracks group by era; switching to popularity coloring shows whether popular tracks occupy a distinct region. |

All four views are linked — selecting tracks in any panel highlights the same records across all others.

## Analytical Insight

**T1 — Do tracks from the same decade share a common audio profile?**

Basically, yes — but not cleanly. In RadViz you can see older decades (1920s–1950s) pulling toward tempo and speechiness, while recent decades drift toward energy and danceability. PCA shows the same trend spatially, though the clusters overlap, which just means the shift happened gradually over time rather than all at once.

**T2 — What features separate high-popularity from low-popularity tracks?**

Simply put, popular tracks tend to be high energy (> 0.6), danceable (> 0.5), low on acousticness (< 0.4), and have near-zero instrumentalness. You can see this clearly by brushing those ranges in Parallel Coordinates — no single feature does it alone, it's the combination that separates them.

**T3 — How do dominant audio dimensions shift across decades?**

Basically, early decades are defined by acousticness and instrumentalness, and recent ones by energy, danceability, and valence. In RadViz you can follow the point mass migrating from one side to the other as you go from the 1920s to the 2010s, and Star Coordinates lets you drag the axes to confirm which dimensions drive that separation.

## Tasks Coverage

| Task | Views | What you can see |
|---|---|---|
| T1 | RadViz, PCA Projection | Decade-colored clusters — older tracks pull toward tempo/speechiness, newer ones toward energy/danceability |
| T2 | Parallel Coordinates, PCA Projection | Brush feature ranges to isolate popular tracks; toggle popularity color in PCA to see their distribution |
| T3 | RadViz, Star Coordinates | Point mass migration across decades in RadViz; drag axes in Star Coordinates to find separating dimensions |

## Project Structure

```
MultiDimVis/
├── app.py
├── requirements.txt
├── index.html
├── data/
│   ├── process.py          
│   ├── data.csv
│   └── processed.json
└── views/
    ├── graphs/
    │   ├── radviz.js
    │   ├── star.js
    │   ├── parallel.js
    │   └── pca.js
    └── helpers/
        ├── state.js  
        └── main.js
```

## Setup & Run

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python data/process.py
python app.py
```

Open [http://localhost:5050](http://localhost:5050).
