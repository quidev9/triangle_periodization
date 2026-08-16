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

    let valA = null;
    let valB = null;
    let valC = null;

    for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();

        if (c.indexOf(nameA) === 0) {
            valA = c.substring(nameA.length);
        }

        if (c.indexOf(nameB) === 0) {
            valB = c.substring(nameB.length);
        }

        if (c.indexOf(nameC) === 0) {
            valC = c.substring(nameC.length);
        }
    }

    if (valA !== null) {
        const input = document.getElementById('bench_a');

        if (input) {
            input.value = valA;
        }
    }

    if (valB !== null) {
        const input = document.getElementById('smith_b');

        if (input) {
            input.value = valB;
        }
    }

    if (valC !== null) {
        const input = document.getElementById('incline_c');

        if (input) {
            input.value = valC;
        }
    }
}


// ============================================================
// ТРЕУГОЛЬНИК
// ============================================================

function getTriangleCoords(
    a,
    b,
    c,
    scale,
    offsetX,
    offsetY
) {

    if (
        (a + b <= c) ||
        (a + c <= b) ||
        (b + c <= a)
    ) {
        return null;
    }

    let cos_alpha =
        (a * a + c * c - b * b) /
        (2 * a * c);

    cos_alpha =
        Math.max(
            -1,
            Math.min(1, cos_alpha)
        );

    let sin_alpha =
        Math.sqrt(
            Math.max(
                0,
                1 - cos_alpha * cos_alpha
            )
        );

    let x1 = offsetX;
    let y1 = offsetY;

    let x2 = offsetX;
    let y2 = offsetY - a * scale;

    let x3 =
        offsetX +
        c * sin_alpha * scale;

    let y3 =
        offsetY -
        c * cos_alpha * scale;

    return {
        x1,
        y1,
        x2,
        y2,
        x3,
        y3
    };
}


function drawSVG(
    svgId,
    coords,
    a,
    b,
    c,
    colorFill,
    colorStroke
) {

    let svg = document.getElementById(svgId);

    if (!svg) {
        console.error(
            `SVG элемент с id="${svgId}" не найден!`
        );

        return;
    }

    svg.innerHTML = '';

    if (!coords) {
        return;
    }

    const SVG_NS =
        "http://www.w3.org/2000/svg";

    let polygon =
        document.createElementNS(
            SVG_NS,
            "polygon"
        );

    polygon.setAttribute(
        "points",
        `${coords.x1},${coords.y1} ` +
        `${coords.x2},${coords.y2} ` +
        `${coords.x3},${coords.y3}`
    );

    polygon.setAttribute(
        "fill",
        colorFill
    );

    polygon.setAttribute(
        "stroke",
        colorStroke
    );

    polygon.setAttribute(
        "stroke-width",
        "3"
    );

    svg.appendChild(polygon);


    function addText(
        textStr,
        x,
        y,
        anchor,
        color
    ) {

        let text =
            document.createElementNS(
                SVG_NS,
                "text"
            );

        text.setAttribute(
            "x",
            x
        );

        text.setAttribute(
            "y",
            y
        );

        text.setAttribute(
            "text-anchor",
            anchor
        );

        text.setAttribute(
            "fill",
            color || "#c7c7c7"
        );

        text.setAttribute(
            "font-size",
            "12px"
        );

        text.setAttribute(
            "font-weight",
            "bold"
        );

        text.textContent = textStr;

        svg.appendChild(text);
    }


    // ========================================================
    // ТОЧКИ
    // ========================================================

    let points = [
        [coords.x1, coords.y1],
        [coords.x2, coords.y2],
        [coords.x3, coords.y3]
    ];

    points.forEach(p => {

        let circle =
            document.createElementNS(
                SVG_NS,
                "circle"
            );

        circle.setAttribute(
            "cx",
            p[0]
        );

        circle.setAttribute(
            "cy",
            p[1]
        );

        circle.setAttribute(
            "r",
            "4"
        );

        circle.setAttribute(
            "fill",
            colorStroke
        );

        svg.appendChild(circle);
    });


    // ========================================================
    // ПОДПИСИ СТОРОН
    // ========================================================

    addText(
        `A: ${a.toFixed(1)} кг`,
        coords.x1 - 10,
        (coords.y1 + coords.y2) / 2,
        "end",
        "#666"
    );

    addText(
        `B: ${b.toFixed(1)} кг`,
        (coords.x2 + coords.x3) / 2 + 10,
        (coords.y2 + coords.y3) / 2 - 5,
        "start",
        colorStroke
    );

    addText(
        `C: ${c.toFixed(1)} кг`,
        (coords.x1 + coords.x3) / 2 + 10,
        (coords.y1 + coords.y3) / 2 + 15,
        "start",
        colorStroke
    );
}


// ============================================================
// ОСНОВНОЙ РАСЧЁТ
// ============================================================

function calculate() {

    // ============================================================
    // 1. ПОЛУЧАЕМ ДАННЫЕ
    // ============================================================

    let a_curr =
        parseFloat(
            document.getElementById('bench_a').value
        ) || 0;

    let b_curr =
        parseFloat(
            document.getElementById('smith_b').value
        ) || 0;

    let c_curr =
        parseFloat(
            document.getElementById('incline_c').value
        ) || 0;


    saveToCookies(
        a_curr,
        b_curr,
        c_curr
    );


    // ============================================================
    // 2. ПРОВЕРКА ТРЕУГОЛЬНИКА
    // ============================================================

    let errorMsg =
        document.getElementById('error-msg');

    if (
        (a_curr + b_curr <= c_curr) ||
        (a_curr + c_curr <= b_curr) ||
        (b_curr + c_curr <= a_curr)
    ) {

        if (errorMsg) {
            errorMsg.style.display = 'block';
        }

        return;

    } else {

        if (errorMsg) {
            errorMsg.style.display = 'none';
        }
    }


    // ============================================================
    // НАСТРОЙКИ
    // ============================================================

    const PERCENT_TO_HORIZON = 0.85;
    const BALANCE_TOLERANCE = 0.10;

    const STEP_BASE = 7.5;
    const STEP_ADJUST = 5;


    // ============================================================
    // ЦЕЛИ ОСНОВНОГО ПРОГНОЗА
    // ============================================================

    let b_target = b_curr;
    let c_target = c_curr;
    let a_target = a_curr;

    let adviceText = "";
    let isBalanced = false;


    // ============================================================
    // ПРОЦЕНТЫ
    // ============================================================

    let pC =
        a_curr > 0
            ? (c_curr / a_curr)
            : 0;

    let pB =
        a_curr > 0
            ? (b_curr / a_curr)
            : 0;


    let balanceRatio =
        c_curr > 0
            ? (b_curr / c_curr)
            : 0;


    // ============================================================
    // 1. СМИТ СЛАБЕЕ ГОРИЗОНТА
    // ============================================================

    if (b_curr < a_curr) {

        let b_diff =
            a_curr - b_curr;

        b_diff =
            Math.round(
                b_diff * 2
            ) / 2;

        b_target =
            b_curr + b_diff;


        if (
            balanceRatio <
            (1 - BALANCE_TOLERANCE)
        ) {

            adviceText =
                `⚠️ ДИСБАЛАНС СИЛЫ!\n` +
                `Смит слабее горизонта.\n` +
                `Сначала добить Смит до ${a_curr} кг.\n` +
                `Фокус на Смите: +${b_diff} кг`;

        } else {

            adviceText =
                `⚠️ СЛАБАЯ БАЗА!\n` +
                `Смит отстает от горизонта.\n` +
                `Сначала добить Смит до ${a_curr} кг.\n` +
                `Фокус на Смите: +${b_diff} кг.`;
        }


        isBalanced = false;
    }


    // ============================================================
    // 2. СМИТ РАВЕН ИЛИ ВЫШЕ ГОРИЗОНТА
    // ============================================================

    else {

        let horizon_8 =
            Math.round(
                (b_curr * PERCENT_TO_HORIZON) / 5
            ) * 5;

        let horizon_3 =
            Math.round(
                (b_curr * 0.925) / 5
            ) * 5;


        // ========================================================
        // РАЗОВЫЙ МАКСИМУМ
        // ========================================================

        let oneRM =
            horizon_3 *
            36 /
            (37 - 3);


        // Округление до ближайших 2.5 кг

        a_target =
            Math.round(
                oneRM / 2.5
            ) * 2.5;


        adviceText =
            `🎯 МОЖНО ПРОБОВАТЬ ГОРИЗОНТ!\n` +
            `Ориентир:\n` +
            `${horizon_8} кг × 8\n` +
            `${horizon_3} кг × 3`;

        isBalanced = true;


        // ========================================================
        // НАКЛОН
        // ========================================================

        // Конечный ориентир наклона = 80% от горизонта
        let incline_reference =
            Math.round(
                (a_curr * 0.80) / 2.5
            ) * 2.5;


        // Следующий шаг = максимум +5 кг.
        // Поэтому не показываем сразу, например:
        // 90 → 105.
        //
        // Будет:
        // 90 → 95
        // 95 → 100
        // 100 → 105

        let incline_next =
            Math.min(
                c_curr + 5,
                incline_reference
            );


        incline_next =
            Math.round(
                incline_next / 2.5
            ) * 2.5;


        if (pC < 0.70) {

            adviceText +=
                `\n\n⚠️ Свободный наклон сильно отстаёт: ` +
                `${c_curr} → ${incline_next} кг.`;

        }

        else if (pC <= 0.775) {

            if (incline_next > c_curr) {

                adviceText +=
                    `\n\nℹ️ Наклон немного отстаёт: ` +
                    `${c_curr} → ${incline_next} кг.`;
            }
        }
    }


    // ============================================================
    // ОКРУГЛЕНИЕ ОСНОВНЫХ ЦЕЛЕЙ
    // ============================================================

    a_target =
        Math.round(
            a_target * 10
        ) / 10;

    b_target =
        Math.round(
            b_target * 10
        ) / 10;

    c_target =
        Math.round(
            c_target * 10
        ) / 10;


    // ============================================================
    // ФИКСИРОВАННЫЙ ПРОГНОЗ ДЛЯ ЗЕЛЁНОГО ТРЕУГОЛЬНИКА
    // ============================================================

    let triangle_a_target =
        a_curr + STEP_BASE;


    // ============================================================
    // СМИТ
    // ============================================================

    let triangle_b_min =
        a_curr + STEP_ADJUST;

    let triangle_b_target =
        Math.max(
            b_curr,
            triangle_b_min
        );


    // ============================================================
    // НАКЛОН
    // ============================================================

    const INCLINE_RATIO = 0.80;
    const MAX_INCLINE_STEP = 5;


    // Желаемый уровень наклона относительно горизонта

    let triangle_c_reference =
        Math.round(
            (a_curr * INCLINE_RATIO) / 2.5
        ) * 2.5;


    // За один прогноз добавляем максимум 5 кг

    let triangle_c_target =
        Math.min(
            c_curr + MAX_INCLINE_STEP,
            triangle_c_reference
        );


    // Никогда не уменьшаем текущий вес

    triangle_c_target =
        Math.max(
            c_curr,
            triangle_c_target
        );


    // ============================================================
    // ОКРУГЛЕНИЕ ПРОГНОЗНОГО ТРЕУГОЛЬНИКА
    // ============================================================

    triangle_a_target =
        Math.round(
            triangle_a_target / 2.5
        ) * 2.5;

    triangle_b_target =
        Math.round(
            triangle_b_target / 2.5
        ) * 2.5;

    triangle_c_target =
        Math.round(
            triangle_c_target / 2.5
        ) * 2.5;


    // ============================================================
    // SVG
    // ============================================================

    let max_val =
        Math.max(
            a_curr,
            b_curr,
            c_curr,
            a_target,
            b_target,
            c_target,
            triangle_a_target,
            triangle_b_target,
            triangle_c_target
        );


    let scale =
        max_val > 0
            ? (160 / max_val)
            : 1;

    let offsetX = 110;
    let offsetY = 220;


    // ============================================================
    // ТЕКУЩИЙ ТРЕУГОЛЬНИК
    // ============================================================

    let coords_cur =
        getTriangleCoords(
            a_curr,
            b_curr,
            c_curr,
            scale,
            offsetX,
            offsetY
        );


    // ============================================================
    // ПРОГНОЗНЫЙ ТРЕУГОЛЬНИК
    // ============================================================

    let coords_tar =
        getTriangleCoords(
            triangle_a_target,
            triangle_b_target,
            triangle_c_target,
            scale,
            offsetX,
            offsetY
        );


    drawSVG(
        'svg_current',
        coords_cur,
        a_curr,
        b_curr,
        c_curr,
        'rgba(230, 230, 255, 0.6)',
        'gray'
    );


    drawSVG(
        'svg_target',
        coords_tar,
        triangle_a_target,
        triangle_b_target,
        triangle_c_target,
        'rgba(212, 247, 216, 0.6)',
        '#3a7463'
    );


    // ============================================================
    // СТАТИСТИКА
    // ============================================================

    let verdictBox =
        document.getElementById('verdict');

    let statusTitle =
        "СТАТИСТИКА:\n";


    let details =
        `Наклон: ${(pC * 100).toFixed(1)}% от горизонта.\n`;

    details +=
        `Смит: ${(pB * 100).toFixed(1)}% от горизонта.\n`;

    details +=
        `Баланс Смит/Наклон: ${(((pB + pC) / 2) * 100).toFixed(1)}%.\n\n`;


    let totalText =
        `<b>${statusTitle}</b>${details}`;


    if (isBalanced) {

        totalText +=
            `<span style="color: var(--accent-green);">${adviceText}</span>`;

    } else {

        totalText +=
            `<span style="color: var(--accent-red);">${adviceText}</span>`;
    }


    // ============================================================
    // АВТО-ПРОГНОЗ
    // ============================================================

    let forecast_a =
        Math.max(
            a_curr,
            a_target
        );


    let forecast_b =
        Math.max(
            b_curr,
            triangle_b_target
        );


    let forecast_c =
        Math.max(
            c_curr,
            triangle_c_target
        );


    totalText +=
        `\n\n<b>🔮 АВТО-ПРОГНОЗ:</b>\n`;

    totalText +=
        `Горизонтальный жим: ${a_curr} → ${forecast_a} кг\n`;

    totalText +=
        `Смит 30°: ${b_curr} → ${forecast_b} кг\n`;

    totalText +=
        `Наклон свободный: ${c_curr} → ${forecast_c} кг`;


    // ============================================================
    // ВЫВОД
    // ============================================================

    if (verdictBox) {
        verdictBox.innerHTML = totalText;
    }
}


// ============================================================
// ЗАПУСК
// ============================================================

loadFromCookies();

calculate();


const inputs = [
    'bench_a',
    'smith_b',
    'incline_c'
];


inputs.forEach(id => {

    const el =
        document.getElementById(id);

    if (el) {

        el.addEventListener(
            'input',
            calculate
        );
    }
});