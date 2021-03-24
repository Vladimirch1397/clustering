import React, { useState } from "react";
import Menu from "./Menu/Menu";
import Canvas from "./Canvas/Canvas";
import "./App.css";

async function apiRequest(path, data = {}) {
    const response = await fetch(path, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (response.ok) {
        return await response.json();
    } else {
        alert("Проблемы с сервером");
        throw new Error(`Error request to ${path}`);
    }
}

function App() {
    const [points, setPoints] = useState([]);

    const fetchPoints = (numberPoints) => {
        const data = {
            numberPoints: numberPoints,
            canvasWidth: Canvas.getWidth(),
            canvasHeight: Canvas.getHeight(),
            pointSize: Canvas.getPointSize(),
        };

        apiRequest("/api/generate", data).then((points) => {
            setPoints(points);
        });
    };

    const fetchClusteringData = () => {
        const centersGravity = Canvas.getCentersGravity();

        if (!centersGravity.length) {
            alert("Отсутсуют центры гравитации");
            return;
        }

        const data = {
            points: points,
            centersGravity: centersGravity,
        };

        console.log(data);

        // apiRequest("/api/clustering", data).then((clusteringData) => {
        //     console.log(clusteringData);
        // });
    };

    return (
        <div className="wrapper">
            <Menu generate={fetchPoints} clustering={fetchClusteringData} />
            <Canvas points={points} />
        </div>
    );
}

export default App;
