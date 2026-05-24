# Spotify Multidimensional Data Visualization

DS5343 – Visualización de Datos · UTEC · Week 8

Flask + D3.js app that explores 1,496 Spotify tracks (1921–2020) using four linked multidimensional views.

## Visualizations

| Panel | Technique | Analytical Task |
|---|---|---|
| Top-left | **RadViz** – dimensional anchoring | T1 · T3 |
| Top-right | **Star Coordinates** – draggable axes | T3 |
| Bottom-left | **Parallel Coordinates** – axis brushing | T2 |
| Bottom-right | **PCA Projection** – 2D embedding | T1 · T2 |

- **T1** – Do audio features cluster tracks by decade?
- **T2** – What feature patterns separate high-popularity from low-popularity tracks?
- **T3** – How do dominant audio dimensions shift across decades?

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
    │   └── projection.js
    └── helpers/
        ├── state.js  
        └── main.js
```

## Setup & Run

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python data/process.py      # only once
python app.py
```

Open [http://localhost:5050](http://localhost:5050).
