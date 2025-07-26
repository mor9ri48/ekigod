document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('app-container');
    let allLinesData = [];
    let allStationsPool = []; // 全ての駅を保持する配列

    function startRoulette() {
        if (allStationsPool.length === 0) {
            alert('対象となる駅がありません。');
            return;
        }
        const resultArea = document.getElementById('result-area');
        const DURATION = 2500;
        const INTERVAL = 75;
        resultArea.innerHTML = `
            <div id="station-sign-container" class="station-sign waiting-design is-rouletting">
                <div class="station-name-main">
                    <div class="kanji-name"></div>
                    <div class="hiragana-name"></div>
                </div>
                <div class="line-bar">
                    <div class="romaji-name"></div>
                </div>
                <div class="adjacent-stations"></div>
            </div>
            <button id="spin-again-button" style="display: none;">もう一度！</button>
        `;
        const kanjiEl = document.querySelector('.kanji-name');
        const hiraganaEl = document.querySelector('.hiragana-name');
        const lineBarEl = document.querySelector('.line-bar');
        const rouletteTimer = setInterval(() => {
            const tempStation = allStationsPool[Math.floor(Math.random() * allStationsPool.length)];
            // アニメーション中はデザインタイプを変更せず、中身だけ更新する
            kanjiEl.textContent = tempStation.stationName;
            hiraganaEl.textContent = tempStation.stationReading;
            lineBarEl.style.backgroundColor = tempStation.lineInfo.lineColor;
            lineBarEl.style.color = tempStation.lineInfo.textColor;
        }, INTERVAL);

        setTimeout(() => {
            clearInterval(rouletteTimer);
            const randomLineIndex = Math.floor(Math.random() * allLinesData.length);
            const selectedLine = allLinesData[randomLineIndex];
            const randomStationIndex = Math.floor(Math.random() * selectedLine.stations.length);
            const currentStation = selectedLine.stations[randomStationIndex];
            let prevStation = null;
            let nextStation = null;
            const stationCount = selectedLine.stations.length;
            if (selectedLine.isLoopLine) {
                prevStation = selectedLine.stations[(randomStationIndex - 1 + stationCount) % stationCount];
                nextStation = selectedLine.stations[(randomStationIndex + 1) % stationCount];
            } else {
                if (randomStationIndex > 0) prevStation = selectedLine.stations[randomStationIndex - 1];
                if (randomStationIndex < stationCount - 1) nextStation = selectedLine.stations[randomStationIndex + 1];
            }
            const finalData = {
                current: currentStation,
                prev: prevStation,
                next: nextStation,
                line: selectedLine
            };
            renderResult(finalData);
        }, DURATION);
    }

    function renderInitialView() {
        appContainer.innerHTML = `
            <div id="control-area">
                <button id="random-button">神の啓示を待つ (駅を選ぶ)</button>
            </div>
            <div id="result-area"></div>
        `;
        const randomButton = document.getElementById('random-button');
        randomButton.addEventListener('click', startRoulette);
    }
    
    function renderResult(data) {
        const resultArea = document.getElementById('result-area');
        const prevStationHTML = data.prev ? `<div class="prev-station"><div class="station-kanji">${data.prev.stationName}</div><div class="station-romaji">${data.prev.stationRomaji}</div></div>` : '<div></div>';
        const nextStationHTML = data.next ? `<div class="next-station"><div class="station-kanji">${data.next.stationName}</div><div class="station-romaji">${data.next.stationRomaji}</div></div>` : '<div></div>';
        resultArea.innerHTML = `
            <div class="station-sign ${data.line.designType}">
                <div class="station-name-main">
                    <div class="kanji-name">${data.current.stationName}</div>
                    <div class="hiragana-name">${data.current.stationReading}</div>
                </div>
                <div class="line-bar" style="background-color: ${data.line.lineColor}; color: ${data.line.textColor};">
                    <div class="romaji-name">${data.current.stationRomaji}</div>
                </div>
                <div class="adjacent-stations">
                    ${prevStationHTML}
                    ${nextStationHTML}
                </div>
            </div>
            <h3>経路図</h3>
            <div id="initial-routemap-container">
                <img src="./images/${data.line.imageFile}" alt="選択された経路図">
            </div>
            <div><button id="spin-again-button">神頼みする</button></div>
        `;
        const lineBarEl = document.querySelector('.line-bar');
        if (lineBarEl) {
            lineBarEl.style.setProperty('--line-color', data.line.lineColor);
        }
        const spinAgainButton = document.getElementById('spin-again-button');
        spinAgainButton.addEventListener('click', startRoulette);
    }

    async function initializeApp() {
        try {
            const response = await fetch('data/stations.json');
            allLinesData = await response.json();
            // 抽選候補となる全駅のプールを作成
            allLinesData.forEach(line => {
                line.stations.forEach(station => {
                    allStationsPool.push({ ...station, lineInfo: line });
                });
            });
            renderInitialView();
        } catch (error) {
            console.error('駅データの読み込みに失敗しました:', error);
            appContainer.innerHTML = `<p style="color: red;">エラー: 駅データの読み込みに失敗しました。stations.jsonファイルを確認してください。</p>`;
        }
    }

    initializeApp();
});