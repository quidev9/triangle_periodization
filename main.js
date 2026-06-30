// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ COOKIES ---

function saveToCookies(a, b, c) {
    document.cookie = `bench_a=${a}; path=/; max-age=31536000`;
    document.cookie = `smith_b=${b}; path=/; max-age=31536000`;
    document.cookie = `incline_c=${c}; path=/; max-age=31536000`;
}

function loadFromCookies() {
    const nameA = "bench_a=";
    const nameB = "smith_b=";
    const nameC = "incline_c=";
    
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    
    let valA = null, valB = null, valC = null;

    for(let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.indexOf(nameA) == 0) valA = c.substring(nameA.length);
        if (c.indexOf(nameB) == 0) valB = c.substring(nameB.length);
        if (c.indexOf(nameC) == 0) valC = c.substring(nameC.length);
    }

    // Если куки есть, заполняем поля. Если нет — оставляем пустыми или ставим 0
    if(valA !== null) document.getElementById('bench_a').value = valA;
    if(valB !== null) document.getElementById('smith_b').value = valB;
    if(valC !== null) document.getElementById('incline_c').value = valC;
}


function getTriangleCoords(a, b, c, scale, offsetX, offsetY) {
    if ((a + b <= c) || (a + c <= b) || (b + c <= a)) return null;
    
    let cos_alpha = (a*a + c*c - b*b) / (2 * a * c);

    cos_alpha = Math.max(-1, Math.min(1, cos_alpha)); 
    let sin_alpha = Math.sqrt(Math.max(0, 1 - cos_alpha*cos_alpha));
    
    let x1 = offsetX, y1 = offsetY;
    let x2 = offsetX, y2 = offsetY - a * scale;
    let x3 = offsetX + c * sin_alpha * scale, y3 = offsetY - c * cos_alpha * scale;
    
    return {x1, y1, x2, y2, x3, y3};
}

function drawSVG(svgId, coords, a, b, c, colorFill, colorStroke) {
    let svg = document.getElementById(svgId);
    if (!svg) {
        console.error(`SVG элемент с id="${svgId}" не найден!`);
        return;
    }
    
    svg.innerHTML = ''; 
    if (!coords) return;

    const SVG_NS = "http://www.w3.org/2000/svg";
    let polygon = document.createElementNS(SVG_NS, "polygon");
    polygon.setAttribute("points", `${coords.x1},${coords.y1} ${coords.x2},${coords.y2} ${coords.x3},${coords.y3}`);
    polygon.setAttribute("fill", colorFill);
    polygon.setAttribute("stroke", colorStroke);
    polygon.setAttribute("stroke-width", "3");
    svg.appendChild(polygon);

    function addText(textStr, x, y, anchor, color) {

        let text = document.createElementNS(SVG_NS, "text");
        text.setAttribute("x", x);
        text.setAttribute("y", y);
        text.setAttribute("text-anchor", anchor);
        text.setAttribute("fill", color || "#c7c7c7");
        text.setAttribute("font-size", "12px");
        text.setAttribute("font-weight", "bold");
        text.textContent = textStr;
        svg.appendChild(text);
    }

    let points = [[coords.x1, coords.y1], [coords.x2, coords.y2], [coords.x3, coords.y3]];
    points.forEach(p => {
        let circle = document.createElementNS(SVG_NS, "circle");
        circle.setAttribute("cx", p[0]); 
        circle.setAttribute("cy", p[1]); 
        circle.setAttribute("r", "4");
        circle.setAttribute("fill", colorStroke);
        svg.appendChild(circle);
    });

    // Подписи сторон (исправлена ошибка с пропущенным аргументом цвета)
    addText(`A: ${a.toFixed(1)} кг`, coords.x1 - 10, (coords.y1 + coords.y2)/2, "end", "#666");
    addText(`B: ${b.toFixed(1)} кг`, (coords.x2 + coords.x3)/2 + 10, (coords.y2 + coords.y3)/2 - 5, "start", colorStroke);
    addText(`C: ${c.toFixed(1)} кг`, (coords.x1 + coords.x3)/2 + 10, (coords.y1 + coords.y3)/2 + 15, "start", colorStroke);
}


function calculate() {
    // 1. Получаем данные
    let a_curr = parseFloat(document.getElementById('bench_a').value) || 0;
    let b_curr = parseFloat(document.getElementById('smith_b').value) || 0;
    let c_curr = parseFloat(document.getElementById('incline_c').value) || 0;
    
    saveToCookies(a_curr, b_curr, c_curr);

    let errorMsg = document.getElementById('error-msg');
    
    // 2. Проверка треугольника
    if ((a_curr + b_curr <= c_curr) || (a_curr + c_curr <= b_curr) || (b_curr + c_curr <= a_curr)) {
        if(errorMsg) errorMsg.style.display = 'block';
        return;
    } else {
        if(errorMsg) errorMsg.style.display = 'none';
    }

    const PERCENT_TO_HORIZON = 0.85; 
    const BALANCE_TOLERANCE = 0.10;  
    const STEP_BASE = 7.5;
    const STEP_ADJUST = 5; // базовый шаг для корректировки (можно менять под методику)
    
    let b_target = b_curr;
    let c_target = c_curr;
    let a_target = a_curr;
    
    let adviceText = "";
    let isBalanced = false;


    let pC = a_curr > 0 ? (c_curr / a_curr) : 0; 
    let pB = a_curr > 0 ? (b_curr / a_curr) : 0; 
    let balanceRatio = b_curr > 0 ? (b_curr / c_curr) : 0; 


    if (pC < PERCENT_TO_HORIZON && c_target != Math.floor((a_target * 0.85) / 10) * 10) {
        c_target = Math.floor((a_target * 0.85) / 10) * 10;
        b_target = a_target;
        
        let c_diff = Math.max(STEP_ADJUST, Math.min(15, c_target - c_curr));
        
        if (pC < 0.70) {
            adviceText = `❌ КРИТИЧЕСКИЙ ДЕФИЦИТ ВЕРХА!\nФокус только на свободном наклоне: +${c_diff} кг.\n`;
        }
        else {
            adviceText = `❌ ДЕФИЦИТ ВЕРХА!\nФокус на свободном наклоне: +${c_diff} кг.\n`;
        }
        isBalanced = false;
    } 
    else if (pB < PERCENT_TO_HORIZON || balanceRatio < 1 || a_curr != b_curr) {

        let b_diff;
        b_diff = a_curr - b_curr

        b_diff = Math.round(b_diff * 2) / 2; 
        b_target = b_curr + b_diff;
        console.log(balanceRatio)
        if (balanceRatio < (1 - BALANCE_TOLERANCE)) {
            adviceText = `⚠️ ДИСБАЛАНС СИЛЫ!\nСмит значительно слабее Наклона (потеря контроля веса).\nФокус на Смите: +${b_diff} кг`;
        }
        else {
            adviceText = `⚠️ СЛАБАЯ БАЗА.\nСмит отстает от горизонта (<90%).\nФокус на Смите: +${b_diff} кг.`;
        }
        isBalanced = false;
    }
    else if (pB <= pC) {

        let b_diff = STEP_ADJUST;
        if (Math.abs(pB - pC) > 0.15) {
            b_diff = Math.min(10, b_diff * 1.5);
        }
        b_diff = Math.round(b_diff * 2) / 2;
        b_target = b_curr + b_diff;
        adviceText = `⚠️ ДИСБАЛАНС ТЕХНИКИ!\nФокус на Смите: +${b_diff} кг`;
    }
    else {
        a_target = a_curr + STEP_BASE; 
        adviceText = "✅ ИДЕАЛЬНЫЙ БАЛАНС.\nБаза и верх в норме: Горизонт +7.5 кг.";
        isBalanced = true;
    }

    a_target = Math.round(a_target * 10) / 10;
    b_target = Math.round(b_target * 10) / 10;
    c_target = Math.round(c_target * 10) / 10;

    let max_val = Math.max(a_curr, b_curr, c_curr, a_target, b_target, c_target);
    let scale = (max_val > 0) ? (160 / max_val) : 1; 
    let offsetX = 110, offsetY = 220;

    let coords_cur = getTriangleCoords(a_curr, b_curr, c_curr, scale, offsetX, offsetY);
    let coords_tar = getTriangleCoords(a_target, b_target, c_target, scale, offsetX, offsetY);

    drawSVG('svg_current', coords_cur, a_curr, b_curr, c_curr, 'rgba(230, 230, 255, 0.6)', 'gray');
    drawSVG('svg_target', coords_tar, a_target, b_target, c_target, 'rgba(212, 247, 216, 0.6)', '#3a7463');

    let verdictBox = document.getElementById('verdict');
    let statusTitle = "СТАТИСТИКА:\n";
    
    let details = `Наклон: ${(pC*100).toFixed(1)}% от горизонта.\n`;
    details += `Смит: ${(pB*100).toFixed(1)}% от горизонта.\n`;
    details += `Баланс Смит/Наклон: ${(((pB + pC)/2)*100).toFixed(1)}%.\n\n`;

    let totalText = `<b>${statusTitle}</b>${details}`;
    
    if (isBalanced) {
        totalText += `<span style="color: var(--accent-green);">${adviceText}</span>`;
    } else {
        totalText += `<span style="color: var(--accent-red);">${adviceText}</span>`;
    }

    totalText += `\n\n<b>🔮 АВТО-ПРОГНОЗ:</b>\n`;
    totalText += `Горизонтальный жим: ${a_curr} → ${a_target} кг\n`;
    totalText += `Смит 30°: ${b_curr} → ${b_target} кг\n`;
    totalText += `Наклон свободный: ${c_curr} → ${c_target} кг`;

    if(verdictBox) {
        verdictBox.innerHTML = totalText;
    }
}


loadFromCookies();

calculate();


const inputs = ['bench_a', 'smith_b', 'incline_c'];
inputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener('input', calculate);
    }
});
