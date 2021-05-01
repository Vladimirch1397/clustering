import React, { useRef, useEffect } from "react";

let worker = null;

function randomRGBColor() {
    return [randomNumber(1, 255), randomNumber(1, 255), randomNumber(1, 255)];
}

function randomNumber(min, max) {
    return Math.floor(min - 0.5 + Math.random() * (max - min + 1));
}

function convertToCanvasSize(canvas, x, y) {
    let rect = canvas.getBoundingClientRect();
    return [x - rect.x, y - rect.y];
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function handleWorkerMessage(e) {
    let type = e.data.type;

    switch (type) {
        case "inited":
            resizeCanvas();
            break;
    }
}

function initWebGL(canvas) {
    worker.postMessage(
        {
            type: "init",
            canvas,
        },
        [canvas]
    );
}

function resizeCanvas() {
    let [width, height] = Canvas.getSize();

    worker.postMessage({
        type: "size",
        width,
        height,
    });
}

function setPoints(points, color, radius) {
    worker.postMessage({
        type: "points",
        pointsData: [
            {
                points,
                color,
                radius,
            },
        ],
    });
}

function setCentersGravity(centers) {
    worker.postMessage({
        type: "centers",
        centers,
    });
}

function setClusteringData(states) {
    worker.postMessage({
        type: "clusters",
        states,
    });
}

export default function Canvas(props) {
    let canvas = useRef(null);
    let points = props.points;
    let pointColor = props.pointDefaultColor;
    let pointRadius = props.pointRadius;
    let clustersStates = props.clusteringData;
    let centersGravity = {};

    Canvas.getSize = () => {
        return [canvas.current.clientWidth, canvas.current.clientHeight];
    };

    Canvas.getCentersGravity = () => {
        return Object.values(centersGravity);
    };

    useEffect(() => {
        if (canvas.current.transferControlToOffscreen) {
            let offScreenCanvas = canvas.current.transferControlToOffscreen();

            worker = new Worker("/webgl/webgl.js");

            initWebGL(offScreenCanvas);

            worker.onmessage = handleWorkerMessage;
        } else {
            alert("Ваш браузер не поддерживает offScreenCanvas");
        }

        window.addEventListener("resize", resizeCanvas);
    }, []);

    useEffect(() => {
        setPoints(points, pointColor, pointRadius);
    }, [points]);

    useEffect(() => {
        setClusteringData(clustersStates);
    }, [clustersStates]);

    const handleClick = (e) => {
        let [x, y] = convertToCanvasSize(canvas.current, e.clientX, e.clientY);

        for (let i = points.length - 1; i >= 0; i--) {
            if (distance(x, y, points[i].x, points[i].y) < pointRadius + 2) {
                if (!(i in centersGravity)) {
                    centersGravity[i] = {
                        x: points[i].x,
                        y: points[i].y,
                        color: randomRGBColor(),
                        radius: pointRadius * 2,
                    };
                    setCentersGravity(centersGravity);
                    return;
                }
            }
        }
    };

    return (
        <div className="content">
            <canvas id="canvas" ref={canvas} onClick={handleClick}>
                <p>Ваш баузер не поддерживает canvas</p>
            </canvas>
        </div>
    );
}
