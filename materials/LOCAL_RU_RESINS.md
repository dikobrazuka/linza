# Russia / Kazan photopolymer shortlist for RF MVP

Updated: 2026-10-30

Goal: find materials that can be obtained quickly in Russia/Kazan while keeping RF loss as low as possible.

## 1. HARZ Labs Dielectric — most interesting local low-loss resin

Status: **high-interest local experimental candidate, but NOT sufficient alone for classic Luneburg center**.

HARZ Labs test program lists a resin called `Dielectric` for desktop LCD/DLP printers:

- color: yellow transparent;
- `epsilon_r = 1.628`;
- `tan(delta) = 5.39e-3`;
- intended specifically as a low-permittivity dielectric material.

Source:
https://harzlabs.ru/support/test-program/about-program/

The HARZ Labs testing program states that test-material samples are provided to registered participants. This makes it potentially much faster and cheaper to obtain in Russia than imported Arkema/Rogers.

### Why it is interesting

Its loss tangent is in the same order as Rogers Radix and only roughly 2x worse than Arkema N3D-DIELEC731:

- HARZ Dielectric: `tan(delta) ~0.00539`;
- Rogers Radix: `~0.0043 @10 GHz`;
- Arkema N3D-DIELEC731: `~0.0030 @10 GHz`.

### Why it cannot be the only resin for classic Luneburg

Classic Luneburg requires:

`epsilon_target(r)=2-(r/R)^2`,

therefore the center requires `epsilon=2`.

A solid resin with `epsilon_solid=1.628` cannot be diluted with air to reach `epsilon=2`; geometry can only reduce its effective epsilon further.

The radius at which ideal Luneburg reaches `epsilon=1.628` is:

`r/R = sqrt(2-1.628) ~0.610`.

So HARZ Dielectric is naturally suitable only for approximately the outer `39%` of radius in a classic Luneburg lens unless paired with a higher-epsilon material.

Possible future branch: nested/two-material construction, but not preferred for the fastest single-material MVP.

## 2. HARZ Labs Industrial ABS — locally available but lossy

HARZ Labs published 10-GHz measurements:

- `epsilon_r = 2.200 +/- 0.006`;
- `tan(delta) = 0.0218 +/- 0.0002`.

Source:
https://harzlabs.ru/upload/iblock/c8e/z57l26i8njot7d6l4g5zemzqxaev3yt4/ABS-dielektricheskaya-pronitsaemost.pdf

Advantage: epsilon is high enough to generate a classic Luneburg profile by adding air/porosity.

Disadvantage: losses are about 7x Arkema N3D-DIELEC731 and about 4x HARZ Dielectric. Therefore it is not preferred as final RF material, but it could be used for quick geometry/process experiments.

## 3. Anycubic DLP Craftsman — easiest known off-the-shelf compromise

Published microwave experiment at 22-33 GHz used Anycubic Craftsman and reported approximately:

`epsilon ~= 2.6569 * (1 - 0.03j)`

which corresponds to a loss tangent of about `0.03`.

Advantage:

- easy to obtain in Russia;
- standard LCD/DLP workflow;
- epsilon comfortably above 2;
- therefore can realize `epsilon=2 -> 1` via geometry.

Disadvantage: substantially lossier than purpose-built RF resins.

Russian stock example: 3DVision lists Anycubic DLP Craftsman as available, around 3400 RUB depending on pack/variant.

## 4. Formlabs materials — some promising electrical numbers, but poor MVP fit

Formlabs publishes electrical data for several resins. Example values include:

- High Temp Resin V1: dielectric constant ~2.6, dissipation factor ~0.0114;
- Rigid 10K: dissipation factor reported as low as ~0.002 at 13.56 MHz in Formlabs electrical-property data.

However:

- MHz values cannot be assumed to remain the same at 5-10 GHz;
- Formlabs cartridge/process ecosystem complicates use on a generic Elegoo/Anycubic MSLA machine;
- W-band measurements of several ordinary Formlabs resins show loss tangents typically around 0.019-0.024.

Conclusion: not the preferred fast route unless a suitable Formlabs printer/material is already available.

## 5. Phrozen / generic consumer resins

Phrozen resins are widely available in Russia and in Kazan distributors, including Aqua, TR250LV, TR300, etc.

Current problem: no strong RF characterization was found showing a clear low-loss advantage over Anycubic Craftsman. Do not choose based on mechanical/thermal TDS alone.

Use only for geometry/process trials unless measured locally.

## 6. Local procurement channels in Kazan

### Color World / Cvetmir3D Kazan

Address listed by distributor:

`Kazan, Nikolaya Ershova 29B, BC Tatariya`.

They distribute Anycubic, Phrozen, HARZ Labs, Formlabs and other resin brands.

Useful action: ask whether they can bring HARZ Labs test or engineering resin through their existing HARZ distribution channel.

### 3DVision Kazan

Local branch/service point exists in Kazan and the national catalog lists Anycubic Craftsman and HARZ materials.

Useful action: ask for same-day/fast transfer of Craftsman or HARZ engineering resins.

## 7. Current local ranking

For a **single-material classic Luneburg MVP**:

1. Imported Arkema N3D-DIELEC731 — still best technical choice.
2. Rogers Radix 2.8Dk — excellent backup, imported.
3. Anycubic Craftsman — easiest locally available material with published microwave data and epsilon >2, but high loss.
4. HARZ Industrial ABS — epsilon >2 and measured at 10 GHz, but also high loss.

For a **local low-loss research sample**:

1. HARZ Labs Dielectric — strongest Russian low-loss finding so far (`epsilon=1.628`, `tan(delta)=0.00539`), but cannot alone realize the center of a classic Luneburg lens.

## 8. Practical MVP recommendation

Run two procurement tracks in parallel:

- get Anycubic Craftsman immediately for geometry/printing/RF workflow validation;
- apply to HARZ Labs test program for `Dielectric` and measure it locally;
- continue trying to obtain Arkema N3D-DIELEC731 for the final single-material continuous-gyroid lens.

Do not stop the project while waiting for the ideal resin.
