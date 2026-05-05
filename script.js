let chart;

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("btnGenera").onclick = simula;
});

// Generatore normale (Box-Muller)
function gaussianRandom() {
    let u1 = Math.random();
    let u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function simula() {

    // Parametri fissi (puoi rimettere input se vuoi)
    const n = 100;
    const T = 1;
    const S0 = 100;
    const mu = 0.05;
    const sigma = 0.2;

    const dt = T / n;

    let tempi = [0];
    let prezzi = [S0];

    let S = S0;

    // --- Trading ---
    let posizione = 0;
    let pnl = 0;
    let pnlSerie = [0];

    let peak = 0;
    let maxDD = 0;

    for (let i = 1; i <= n; i++) {
        let Z = gaussianRandom();
        let S_prev = S;

        // GBM
        S = S * Math.exp((mu - 0.5 * sigma * sigma) * dt + sigma * Math.sqrt(dt) * Z);

        // Strategia: Trend following
        if (S > S_prev) {
            posizione = 1;
        } else {
            posizione = 0;
        }

        // PnL
        let ret = S - S_prev;
        pnl += posizione * ret;
        pnlSerie.push(pnl);

        // Drawdown
        if (pnl > peak) peak = pnl;
        let dd = peak - pnl;
        if (dd > maxDD) maxDD = dd;

        tempi.push(i);
        prezzi.push(S);
    }

    aggiornaBox(pnl, maxDD);
    disegnaGrafico(tempi, prezzi, pnlSerie);
}

// Aggiorna i box sopra
function aggiornaBox(pnl, maxDD) {
    document.getElementById("pnlBox").innerText = `€ ${pnl.toFixed(2)}`;
    document.getElementById("ddBox").innerText = `€ ${maxDD.toFixed(2)}`;
}

// Grafico con doppio asse
function disegnaGrafico(tempi, prezzi, pnlSerie) {
    const ctx = document.getElementById("grafico").getContext("2d");

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: tempi,
            datasets: [
                {
                    label: 'Prezzo Asset (GBM)',
                    data: prezzi,
                    borderWidth: 2,
                    pointRadius: 0,
                    yAxisID: 'y'
                },
                {
                    label: 'PnL Strategia',
                    data: pnlSerie,
                    borderWidth: 2,
                    pointRadius: 0,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false
            },
            scales: {
                y: {
                    type: 'linear',
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Prezzo'
                    }
                },
                y1: {
                    type: 'linear',
                    position: 'right',
                    grid: {
                        drawOnChartArea: false
                    },
                    title: {
                        display: true,
                        text: 'PnL'
                    }
                }
            }
        }
    });
}
