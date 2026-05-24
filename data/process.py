import sys
import json
from pathlib import Path
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from sklearn.decomposition import PCA

sys.path.insert(0, str(Path(__file__).parent.parent))

from constants.funcs import decade
from constants.consts import REGS, FEATURES

def proccess():
    data = pd.read_csv("data/data.csv")

    data = data.dropna(subset=FEATURES + ["popularity", "year", "name", "artists"])
    data = data[data["popularity"] > 0]
    data["decade"] = data["year"].apply(decade)

    decades = data["decade"].unique()
    regs_per_decade = max(1, REGS // len(decades))

    data_per_decade = []

    for d in decades:
        data_in_decade = data[data["decade"] == d]
        data_per_decade.append(data_in_decade.sample(min(len(data_in_decade), regs_per_decade)))

    combined = pd.concat(data_per_decade)
    data = combined.sample(min(len(combined), REGS))
    data = data.reset_index(drop=True)

    scaler = MinMaxScaler()
    data[FEATURES] = scaler.fit_transform(data[FEATURES])

    pca = PCA(n_components=2)
    dimensions = pca.fit_transform(data[FEATURES])
    data["pca_x"] = dimensions[:, 0]
    data["pca_y"] = dimensions[:, 1]

    data["popularity_type"] = pd.cut(data["popularity"], bins=[0, 25, 50, 75, 100], labels=["Low", "Medium", "High", "Very High"]).astype(str)

    final_data = []
    for i in range(len(data)):
        data_reg = data.iloc[i]
        final_reg = {"id": i, "name": str(data_reg["name"]), "artists": str(data_reg["artists"]), "year": int(data_reg["year"]),
                    "decade": str(data_reg["decade"]), "popularity": float(data_reg["popularity"]), "popularity_type": str(data_reg["popularity_type"]),
                    "pca_x": float(data_reg["pca_x"]), "pca_y": float(data_reg["pca_y"])}

        for feature in FEATURES:
            final_reg[feature] = float(data.iloc[i][feature])

        final_data.append(final_reg)

    processed = {"features": FEATURES, "pca_variance": pca.explained_variance_ratio_.tolist(), "data": final_data}

    with open("data/processed.json", "w") as f:
        json.dump(processed, f)

    print("Data processed written to processed.json")

if __name__ == "__main__":
    proccess()
