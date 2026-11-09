"""
MicroPython for original Raspberry Pi Pico RP2040: single-shot 24 GHz radar IF capture.
REV IF-AFE-R1 2026-11-09, NOT LAB VALIDATED. GP26/ADC0, 3V3, AGND.
IMPORTANT: check amplifier output is 0..3.3 V before connecting GP26.
Capture occurs first; USB printing occurs only AFTER capture to avoid serial jitter.
Sampling speed is best-effort; if OVERUNS > 0 reject the run for FFT frequency claims.
"""
from machine import ADC, Pin
from array import array
from time import ticks_us, ticks_diff, ticks_add, sleep_ms
import gc

ADC_PIN = 26
SAMPLE_RATE_HZ = 10000
SAMPLES = 4096
PERIOD_US = 1000000 // SAMPLE_RATE_HZ

adc = ADC(Pin(ADC_PIN))


def capture_one(run_id):
    gc.collect()
    buf = array("H", [0] * SAMPLES)
    overruns = 0
    start = ticks_us()
    target = start
    for i in range(SAMPLES):
        # Busy-wait scheduling reduces but cannot eliminate MicroPython jitter.
        while ticks_diff(target, ticks_us()) > 0:
            pass
        actual = ticks_us()
        if ticks_diff(actual, target) > PERIOD_US // 2:
            overruns += 1
        buf[i] = adc.read_u16()
        target = ticks_add(target, PERIOD_US)
    stop = ticks_us()
    elapsed = ticks_diff(stop, start)
    duration_s = elapsed / 1000000
    print("BEGIN_CDM324_CSV")
    print("# run_id={},n={},fs_nominal_hz={},elapsed_s={},overruns={}".format(
        run_id, SAMPLES, SAMPLE_RATE_HZ, duration_s, overruns
    ))
    print("sample_index,adc_u16")
    for i, v in enumerate(buf):
        print("{},{}".format(i, v))
    print("END_CDM324_CSV")
    if overruns:
        print("# WARNING: sampling overrun; discard from quantitative FFT")
    print("# ADC code is 16-bit-scaled from RP2040 12-bit ADC; calibrate voltage as needed")


print("CDM324 capture ready. Use serial REPL: capture_one('TEST01')")
print("Do not use raw CSV to claim RCS in dBsm. Check ground/power before connecting.")
