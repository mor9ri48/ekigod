document.addEventListener('DOMContentLoaded', () => {
    // DOM要素の取得
    const lineFilter = document.getElementById('line-filter');
    const spinButton = document.getElementById('spin-button');
    const spinAgainButton = document.getElementById('spin-again-button');
    const settingsView = document.getElementById('settings-view');
    const resultView = document.getElementById('result-view');
    const stationNameEl = document.getElementById('station-name');
    const routemapImageEl = document.getElementById('routemap-image');

    let allLinesData = [];

    // 1. JSONデータを読み込み、フィルターをセットアップする
    fetch('data/stations.json') // 修正点: ファイル名を 'stations.json' に変更
        .then(response => response.json())
        .then(data => {
            allLinesData = data;
            // 路線フィルターのセレクトボックスを生成
            allLinesData.forEach(line => {
                const option = document.createElement('option');
                option.value = line.lineId;
                option.textContent = line.lineName;
                lineFilter.appendChild(option);
            });
        })
        .catch(error => {
            console.error('駅データの読み込みに失敗しました:', error);
            alert('駅データの読み込みに失敗しました。');
        });

    // 2. 「ルーレットを回す！」ボタンのイベント
    spinButton.addEventListener('click', () => {
        const selectedLineId = lineFilter.value;
        let stationPool = [];
        let selectedLineInfo = null;

        if (selectedLineId === 'all') {
            // 「すべての路線から」選択時
            allLinesData.forEach(line => {
                line.stations.forEach(station => {
                    stationPool.push({ ...station, lineInfo: line });
                });
            });
        } else {
            // 特定の路線を選択時
            selectedLineInfo = allLinesData.find(line => line.lineId === selectedLineId);
            if (selectedLineInfo) {
                stationPool = selectedLineInfo.stations.map(station => ({ ...station, lineInfo: selectedLineInfo }));
            }
        }
        
        if (stationPool.length === 0) {
            alert('対象となる駅がありません。');
            return;
        }

        // 抽選実行
        const randomIndex = Math.floor(Math.random() * stationPool.length);
        const selectedStation = stationPool[randomIndex];
        
        // 結果表示
        displayResult(selectedStation);
    });
    
    // 3. 結果を表示する関数
    function displayResult(stationData) {
        // 表示を切り替え
        settingsView.classList.add('hidden');
        resultView.classList.remove('hidden');

        // 駅名と読みがなを表示
        stationNameEl.textContent = `${stationData.stationName} (${stationData.stationReading})`;
        
        // 路線図画像を表示
        const imagePath = `images/${stationData.lineInfo.imageFile}`;
        routemapImageEl.src = imagePath;
        routemapImageEl.alt = `${stationData.lineInfo.lineName} 路線図`;
    }

    // 4. 「もう一度回す」ボタンのイベント
    spinAgainButton.addEventListener('click', () => {
        // 表示を元に戻す
        resultView.classList.add('hidden');
        settingsView.classList.remove('hidden');
    });
});