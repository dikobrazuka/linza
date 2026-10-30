# Beginner guide — текущая логика проекта

## Что мы строим

Линза Люнеберга с непрерывным радиальным профилем:

`epsilon(r)=2-(r/R)^2`.

Вместо смены материала используем одну фотополимерную смолу и меняем локальную volume fraction sheet-gyroid.

## Current physical prototype

- frequency `5 GHz`;
- diameter `120 mm`;
- radius `60 mm`;
- gyroid period `7.5 mm`.

Это примерно `2 lambda0` по диаметру, поэтому перед печатью обязательно проверяем, что размер ещё даёт нужный RF-эффект.

## Почему не Ø240

Ø240 был удобен электромагнитно, но material balance оказался плохим: по provisional model он требует порядка нескольких килограммов cured resin. Current Ø120 требует примерно `356–366 g` DE-10 на саму линзу до окончательной measured recalculation.

## Что измеряем до линзы

1. T1 — dielectric properties solid DE-10.
2. T2 — cured density/shrinkage.
3. T3 — какие gyroid densities реально печатаются и промываются.
4. T4 — реальная epsilon_eff(rho) структуры.

## Что делает Meep

Сначала проверяет физику и численную методику, затем реальную manufacturable model.

Перед full print сравниваем диаметры:

`120 / 150 / 180 / 240 mm`.

Берём минимальный, который проходит objective.

## Что происходит после 5-GHz эксперимента

Validated geometry масштабируется по частоте:

`k=5/24`.

Если current Ø120 остаётся финальным physical V1:

- `D_24=25 mm`;
- `R_24=12.5 mm`;
- `a_24=1.5625 mm`.

24-GHz результат — расчётный prediction, а не прямой эксперимент.

## Главная метрика

`K_sigma=sigma_test/sigma_baseline`.

Goal:

`K_sigma>=10` = `+10 dB`.

## Главное правило

Не печатать full lens до двух GO:

1. RF diameter gate;
2. material-budget/process gate.
