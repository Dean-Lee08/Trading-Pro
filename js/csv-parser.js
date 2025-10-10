// csv-parser.js - CSV/JSON Broker Data Parser

/**
 * CSV 브로커 데이터 파싱 및 거래 변환
 */

/**
 * CSV 텍스트를 2D 배열로 파싱
 */
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const result = [];

    for (let line of lines) {
        // Handle quoted fields with commas
        const fields = [];
        let currentField = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                fields.push(currentField.trim());
                currentField = '';
            } else {
                currentField += char;
            }
        }

        // Add last field
        fields.push(currentField.trim());
        result.push(fields);
    }

    return result;
}

/**
 * CSV 헤더에서 컬럼 인덱스 찾기 (대소문자 무시, 부분 매치)
 */
function findColumnIndex(headers, possibleNames) {
    for (let name of possibleNames) {
        const index = headers.findIndex(h =>
            h.toLowerCase().includes(name.toLowerCase())
        );
        if (index !== -1) return index;
    }
    return -1;
}

/**
 * 날짜 문자열을 YYYY-MM-DD 형식으로 변환
 */
function normalizeDate(dateStr) {
    if (!dateStr) return null;

    // Try parsing common formats
    let date = null;

    // YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        date = new Date(dateStr + 'T12:00:00');
    }
    // MM/DD/YYYY format
    else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
        const parts = dateStr.split('/');
        date = new Date(parts[2], parts[0] - 1, parts[1], 12, 0, 0);
    }
    // DD-MM-YYYY format
    else if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(dateStr)) {
        const parts = dateStr.split('-');
        date = new Date(parts[2], parts[1] - 1, parts[0], 12, 0, 0);
    }
    // YYYYMMDD format
    else if (/^\d{8}$/.test(dateStr)) {
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        date = new Date(year, month - 1, day, 12, 0, 0);
    }
    // Try native Date parsing as fallback
    else {
        date = new Date(dateStr);
    }

    if (!date || isNaN(date.getTime())) {
        return null;
    }

    // Return YYYY-MM-DD format
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

/**
 * 시간 문자열을 HH:MM 형식으로 변환
 */
function normalizeTime(timeStr) {
    if (!timeStr) return '';

    // Remove quotes if present
    timeStr = timeStr.replace(/['"]/g, '').trim();

    // Already in HH:MM or HH:MM:SS format
    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(timeStr)) {
        const parts = timeStr.split(':');
        const hours = parts[0].padStart(2, '0');
        const minutes = parts[1].padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    // HHMM format
    if (/^\d{4}$/.test(timeStr)) {
        const hours = timeStr.substring(0, 2);
        const minutes = timeStr.substring(2, 4);
        return `${hours}:${minutes}`;
    }

    // HH:MM AM/PM format
    const ampmMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (ampmMatch) {
        let hours = parseInt(ampmMatch[1]);
        const minutes = ampmMatch[2];
        const ampm = ampmMatch[3].toUpperCase();

        if (ampm === 'PM' && hours !== 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;

        return `${String(hours).padStart(2, '0')}:${minutes}`;
    }

    return '';
}

/**
 * CSV 데이터를 거래 객체 배열로 변환
 */
function parseBrokerCSV(csvText) {
    try {
        const rows = parseCSV(csvText);

        if (rows.length === 0) {
            throw new Error('CSV file is empty');
        }

        // First row is header
        const headers = rows[0].map(h => h.trim());

        // Find column indices
        const columnMapping = {
            date: findColumnIndex(headers, ['date', 'trade date', 'execution date', 'datetime']),
            symbol: findColumnIndex(headers, ['symbol', 'ticker', 'stock', 'instrument']),
            shares: findColumnIndex(headers, ['shares', 'quantity', 'qty', 'size']),
            buyPrice: findColumnIndex(headers, ['buy price', 'entry price', 'buy', 'entry', 'open price', 'open']),
            sellPrice: findColumnIndex(headers, ['sell price', 'exit price', 'sell', 'exit', 'close price', 'close']),
            entryTime: findColumnIndex(headers, ['entry time', 'buy time', 'open time', 'time in']),
            exitTime: findColumnIndex(headers, ['exit time', 'sell time', 'close time', 'time out'])
        };

        // Validate required columns
        const requiredColumns = ['date', 'symbol', 'buyPrice', 'sellPrice'];
        const missingColumns = [];

        for (let col of requiredColumns) {
            if (columnMapping[col] === -1) {
                missingColumns.push(col);
            }
        }

        if (missingColumns.length > 0) {
            throw new Error(`Missing required columns: ${missingColumns.join(', ')}. Found headers: ${headers.join(', ')}`);
        }

        // Parse data rows
        const trades = [];
        const errors = [];

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];

            // Skip empty rows
            if (row.every(cell => !cell || cell.trim() === '')) {
                continue;
            }

            try {
                const date = normalizeDate(row[columnMapping.date]);
                const symbol = row[columnMapping.symbol]?.toUpperCase().trim();
                const buyPrice = parseFloat(row[columnMapping.buyPrice]);
                const sellPrice = parseFloat(row[columnMapping.sellPrice]);

                // Parse shares (optional, calculate from amount if missing)
                let shares = columnMapping.shares !== -1 ? parseFloat(row[columnMapping.shares]) : 0;

                // Validate essential data
                if (!date || !symbol || isNaN(buyPrice) || isNaN(sellPrice)) {
                    errors.push(`Row ${i + 1}: Missing or invalid essential data`);
                    continue;
                }

                // If shares not provided, default to 100
                if (!shares || shares === 0) {
                    shares = 100;
                }

                // Calculate metrics
                const amount = shares * buyPrice;
                const pnl = shares * (sellPrice - buyPrice);
                const returnPct = ((sellPrice - buyPrice) / buyPrice) * 100;

                // Parse times
                const entryTime = columnMapping.entryTime !== -1 ?
                    normalizeTime(row[columnMapping.entryTime]) : '';
                const exitTime = columnMapping.exitTime !== -1 ?
                    normalizeTime(row[columnMapping.exitTime]) : '';

                // Calculate holding time
                let holdingMinutes = 0;
                let holdingTime = '';

                if (entryTime && exitTime) {
                    const [entryHour, entryMin] = entryTime.split(':').map(Number);
                    const [exitHour, exitMin] = exitTime.split(':').map(Number);

                    let entryMinutes = entryHour * 60 + entryMin;
                    let exitMinutes = exitHour * 60 + exitMin;

                    if (exitMinutes < entryMinutes) {
                        exitMinutes += 24 * 60;
                    }

                    holdingMinutes = exitMinutes - entryMinutes;

                    const hours = Math.floor(holdingMinutes / 60);
                    const minutes = holdingMinutes % 60;

                    if (hours > 0) {
                        holdingTime = `${hours}h ${minutes}m`;
                    } else {
                        holdingTime = `${minutes}m`;
                    }
                }

                // Create trade object
                const trade = {
                    id: Date.now() + i, // Unique ID
                    date: date,
                    symbol: symbol,
                    shares: shares,
                    amount: amount,
                    buyPrice: buyPrice,
                    sellPrice: sellPrice,
                    pnl: pnl,
                    returnPct: returnPct,
                    entryTime: entryTime,
                    exitTime: exitTime,
                    holdingTime: holdingTime,
                    holdingMinutes: holdingMinutes,
                    notes: ''
                };

                trades.push(trade);

            } catch (error) {
                errors.push(`Row ${i + 1}: ${error.message}`);
            }
        }

        return {
            success: true,
            trades: trades,
            errors: errors,
            totalRows: rows.length - 1,
            parsedRows: trades.length,
            columnMapping: columnMapping
        };

    } catch (error) {
        return {
            success: false,
            trades: [],
            errors: [error.message],
            totalRows: 0,
            parsedRows: 0
        };
    }
}

/**
 * JSON 브로커 데이터 파싱
 */
function parseBrokerJSON(jsonText) {
    try {
        const data = JSON.parse(jsonText);

        // Check if it's an array
        if (!Array.isArray(data)) {
            throw new Error('JSON must be an array of trade objects');
        }

        const trades = [];
        const errors = [];

        for (let i = 0; i < data.length; i++) {
            const item = data[i];

            try {
                // Flexible field mapping
                const date = normalizeDate(
                    item.date || item.tradeDate || item.executionDate || item.datetime
                );
                const symbol = (
                    item.symbol || item.ticker || item.stock || item.instrument
                )?.toUpperCase().trim();

                const buyPrice = parseFloat(
                    item.buyPrice || item.entryPrice || item.buy || item.entry || item.openPrice || item.open
                );
                const sellPrice = parseFloat(
                    item.sellPrice || item.exitPrice || item.sell || item.exit || item.closePrice || item.close
                );

                let shares = parseFloat(
                    item.shares || item.quantity || item.qty || item.size || 0
                );

                if (!date || !symbol || isNaN(buyPrice) || isNaN(sellPrice)) {
                    errors.push(`Item ${i + 1}: Missing or invalid essential data`);
                    continue;
                }

                if (!shares || shares === 0) {
                    shares = 100;
                }

                const amount = shares * buyPrice;
                const pnl = shares * (sellPrice - buyPrice);
                const returnPct = ((sellPrice - buyPrice) / buyPrice) * 100;

                const entryTime = normalizeTime(
                    item.entryTime || item.buyTime || item.openTime || item.timeIn || ''
                );
                const exitTime = normalizeTime(
                    item.exitTime || item.sellTime || item.closeTime || item.timeOut || ''
                );

                let holdingMinutes = 0;
                let holdingTime = '';

                if (entryTime && exitTime) {
                    const [entryHour, entryMin] = entryTime.split(':').map(Number);
                    const [exitHour, exitMin] = exitTime.split(':').map(Number);

                    let entryMinutes = entryHour * 60 + entryMin;
                    let exitMinutes = exitHour * 60 + exitMin;

                    if (exitMinutes < entryMinutes) {
                        exitMinutes += 24 * 60;
                    }

                    holdingMinutes = exitMinutes - entryMinutes;

                    const hours = Math.floor(holdingMinutes / 60);
                    const minutes = holdingMinutes % 60;

                    if (hours > 0) {
                        holdingTime = `${hours}h ${minutes}m`;
                    } else {
                        holdingTime = `${minutes}m`;
                    }
                }

                const trade = {
                    id: Date.now() + i,
                    date: date,
                    symbol: symbol,
                    shares: shares,
                    amount: amount,
                    buyPrice: buyPrice,
                    sellPrice: sellPrice,
                    pnl: pnl,
                    returnPct: returnPct,
                    entryTime: entryTime,
                    exitTime: exitTime,
                    holdingTime: holdingTime,
                    holdingMinutes: holdingMinutes,
                    notes: ''
                };

                trades.push(trade);

            } catch (error) {
                errors.push(`Item ${i + 1}: ${error.message}`);
            }
        }

        return {
            success: true,
            trades: trades,
            errors: errors,
            totalRows: data.length,
            parsedRows: trades.length
        };

    } catch (error) {
        return {
            success: false,
            trades: [],
            errors: [error.message],
            totalRows: 0,
            parsedRows: 0
        };
    }
}
