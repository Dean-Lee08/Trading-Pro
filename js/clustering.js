// clustering.js - Trade Clustering Analysis

/**
 * K-means 클러스터링을 사용한 거래 패턴 분석
 */

/**
 * 특성 벡터 정규화 (Min-Max Normalization)
 */
function normalizeFeatures(features) {
    if (features.length === 0) return [];

    const numFeatures = features[0].length;
    const mins = new Array(numFeatures).fill(Infinity);
    const maxs = new Array(numFeatures).fill(-Infinity);

    // Find min and max for each feature
    features.forEach(feature => {
        feature.forEach((value, index) => {
            if (value < mins[index]) mins[index] = value;
            if (value > maxs[index]) maxs[index] = value;
        });
    });

    // Normalize to 0-1 range
    return features.map(feature =>
        feature.map((value, index) => {
            const range = maxs[index] - mins[index];
            return range === 0 ? 0 : (value - mins[index]) / range;
        })
    );
}

/**
 * 유클리드 거리 계산
 */
function euclideanDistance(point1, point2) {
    return Math.sqrt(
        point1.reduce((sum, val, idx) => sum + Math.pow(val - point2[idx], 2), 0)
    );
}

/**
 * K-means 클러스터링 알고리즘
 * @param {Array} data - 특성 벡터 배열
 * @param {number} k - 클러스터 개수
 * @param {number} maxIterations - 최대 반복 횟수
 * @returns {Object} - 클러스터 할당 및 중심점
 */
function kMeansClustering(data, k = 3, maxIterations = 50) {
    if (data.length === 0 || data.length < k) {
        return {
            centroids: [],
            assignments: [],
            converged: false
        };
    }

    const n = data.length;
    const dimensions = data[0].length;

    // Initialize centroids randomly (k-means++ initialization)
    const centroids = [];
    const firstCentroidIndex = Math.floor(Math.random() * n);
    centroids.push([...data[firstCentroidIndex]]);

    // k-means++ initialization for remaining centroids
    for (let i = 1; i < k; i++) {
        const distances = data.map(point => {
            const minDist = Math.min(...centroids.map(centroid =>
                euclideanDistance(point, centroid)
            ));
            return minDist * minDist;
        });

        const totalDist = distances.reduce((sum, d) => sum + d, 0);
        let random = Math.random() * totalDist;

        for (let j = 0; j < n; j++) {
            random -= distances[j];
            if (random <= 0) {
                centroids.push([...data[j]]);
                break;
            }
        }
    }

    let assignments = new Array(n).fill(0);
    let converged = false;
    let iteration = 0;

    while (!converged && iteration < maxIterations) {
        // Assign each point to nearest centroid
        const newAssignments = data.map(point => {
            let minDist = Infinity;
            let closestCluster = 0;

            centroids.forEach((centroid, idx) => {
                const dist = euclideanDistance(point, centroid);
                if (dist < minDist) {
                    minDist = dist;
                    closestCluster = idx;
                }
            });

            return closestCluster;
        });

        // Check convergence
        converged = newAssignments.every((val, idx) => val === assignments[idx]);
        assignments = newAssignments;

        if (!converged) {
            // Update centroids
            for (let i = 0; i < k; i++) {
                const clusterPoints = data.filter((_, idx) => assignments[idx] === i);

                if (clusterPoints.length > 0) {
                    centroids[i] = new Array(dimensions).fill(0).map((_, dim) =>
                        clusterPoints.reduce((sum, point) => sum + point[dim], 0) / clusterPoints.length
                    );
                }
            }
        }

        iteration++;
    }

    return {
        centroids,
        assignments,
        converged,
        iterations: iteration
    };
}

/**
 * 거래 데이터를 특성 벡터로 변환
 */
function extractTradeFeatures(trades) {
    return trades.map(trade => {
        // Feature vector: [holding time (minutes), P&L, return %, entry time (minutes from midnight)]
        const holdingMinutes = trade.holdingMinutes || 0;
        const pnl = trade.pnl || 0;
        const returnPct = trade.returnPct || 0;

        // Entry time in minutes from midnight
        let entryMinutes = 0;
        if (trade.entryTime) {
            const [hours, minutes] = trade.entryTime.split(':').map(Number);
            entryMinutes = hours * 60 + minutes;
        }

        return [holdingMinutes, pnl, returnPct, entryMinutes];
    });
}

/**
 * 거래 클러스터링 수행 및 분석
 */
function performTradeClustering(trades) {
    if (!trades || trades.length < 5) {
        return {
            success: false,
            error: 'Not enough trades for clustering (minimum 5 required)'
        };
    }

    // Extract features
    const features = extractTradeFeatures(trades);

    // Normalize features
    const normalizedFeatures = normalizeFeatures(features);

    // Perform k-means clustering (k=3: Best, Medium, Worst)
    const k = Math.min(3, Math.floor(trades.length / 3)); // Dynamic k based on data size
    const clusterResult = kMeansClustering(normalizedFeatures, k, 50);

    if (!clusterResult.converged) {
        console.warn('K-means clustering did not fully converge');
    }

    // Analyze each cluster
    const clusters = [];

    for (let i = 0; i < k; i++) {
        const clusterTrades = trades.filter((_, idx) => clusterResult.assignments[idx] === i);

        if (clusterTrades.length === 0) continue;

        const wins = clusterTrades.filter(t => t.pnl > 0);
        const losses = clusterTrades.filter(t => t.pnl < 0);

        const totalPnl = clusterTrades.reduce((sum, t) => sum + t.pnl, 0);
        const avgPnl = totalPnl / clusterTrades.length;
        const winRate = (wins.length / clusterTrades.length) * 100;

        const avgHoldingTime = clusterTrades.reduce((sum, t) => sum + (t.holdingMinutes || 0), 0) / clusterTrades.length;
        const avgReturn = clusterTrades.reduce((sum, t) => sum + Math.abs(t.returnPct || 0), 0) / clusterTrades.length;

        // Calculate average entry time
        const avgEntryMinutes = clusterTrades.reduce((sum, t) => {
            if (!t.entryTime) return sum;
            const [hours, minutes] = t.entryTime.split(':').map(Number);
            return sum + (hours * 60 + minutes);
        }, 0) / clusterTrades.length;

        const avgEntryHour = Math.floor(avgEntryMinutes / 60);
        const avgEntryMin = Math.floor(avgEntryMinutes % 60);

        clusters.push({
            id: i,
            trades: clusterTrades,
            count: clusterTrades.length,
            totalPnl: totalPnl,
            avgPnl: avgPnl,
            winRate: winRate,
            wins: wins.length,
            losses: losses.length,
            avgHoldingTime: avgHoldingTime,
            avgReturn: avgReturn,
            avgEntryTime: `${String(avgEntryHour).padStart(2, '0')}:${String(avgEntryMin).padStart(2, '0')}`,
            centroid: clusterResult.centroids[i]
        });
    }

    // Sort clusters by average P&L (descending)
    clusters.sort((a, b) => b.avgPnl - a.avgPnl);

    // Identify best and worst clusters
    const bestCluster = clusters[0];
    const worstCluster = clusters[clusters.length - 1];
    const mediumClusters = clusters.slice(1, -1);

    return {
        success: true,
        clusters: clusters,
        bestCluster: bestCluster,
        worstCluster: worstCluster,
        mediumClusters: mediumClusters,
        totalTrades: trades.length,
        converged: clusterResult.converged,
        iterations: clusterResult.iterations
    };
}

/**
 * 클러스터 특성 설명 생성
 */
function describeClusterCharacteristics(cluster) {
    const characteristics = [];

    // Holding time characteristics
    const hours = Math.floor(cluster.avgHoldingTime / 60);
    const minutes = Math.floor(cluster.avgHoldingTime % 60);

    if (cluster.avgHoldingTime < 30) {
        characteristics.push('Quick scalping trades');
    } else if (cluster.avgHoldingTime < 120) {
        characteristics.push('Short-term swings');
    } else {
        characteristics.push('Position trades');
    }

    characteristics.push(`Avg hold: ${hours}h ${minutes}m`);

    // Entry time characteristics
    const entryHour = parseInt(cluster.avgEntryTime.split(':')[0]);

    if (entryHour >= 9 && entryHour < 10) {
        characteristics.push('Market open entries');
    } else if (entryHour >= 10 && entryHour < 12) {
        characteristics.push('Mid-morning entries');
    } else if (entryHour >= 12 && entryHour < 14) {
        characteristics.push('Midday entries');
    } else if (entryHour >= 14 && entryHour < 16) {
        characteristics.push('Afternoon entries');
    }

    // Performance characteristics
    if (cluster.winRate > 60) {
        characteristics.push('High win rate');
    } else if (cluster.winRate < 40) {
        characteristics.push('Low win rate');
    }

    if (cluster.avgPnl > 50) {
        characteristics.push('Strong profitability');
    } else if (cluster.avgPnl < -20) {
        characteristics.push('Consistent losses');
    }

    return characteristics.join(' • ');
}
