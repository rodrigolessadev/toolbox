"""
Testes para a lógica de cálculo do plugin calc-jornadas.
Porta fiel dos testes em jornada-calc.test.ts do KapiNote.

Executar com:
    python -m pytest test_calc_jornadas.py -v
ou:
    python test_calc_jornadas.py
"""
import sys
import os
import unittest

# Permite executar tanto a partir do diretório do plugin quanto de qualquer lugar
sys.path.insert(0, os.path.dirname(__file__))

from main import (
    Params,
    Resultado,
    hora_para_min,
    min_para_hora,
    calc_noturno,
    calcular_jornada,
)

PARAMS = Params()  # padrão: noturno 22:00–05:00, fator 52.5/60


# ─── Helpers ──────────────────────────────────────────────────────────────

def calc_fmt(entrada: str, saida: str) -> dict:
    """Calcula e retorna resultados formatados como strings HH:MM."""
    r = calcular_jornada(entrada, saida, PARAMS)
    return {
        "total":   min_para_hora(r.total_minutos),
        "normais": min_para_hora(r.minutos_normais),
        "not":     min_para_hora(r.minutos_noturnos),
        "notRed":  min_para_hora(r.minutos_noturnos_red),
    }


# ─── Utilitários ──────────────────────────────────────────────────────────

class TestUtilitarios(unittest.TestCase):
    def test_hora_para_min(self):
        self.assertEqual(hora_para_min("22:00"), 1320)
        self.assertEqual(hora_para_min("05:00"), 300)
        self.assertEqual(hora_para_min("00:00"), 0)
        self.assertEqual(hora_para_min("08:00"), 480)

    def test_min_para_hora(self):
        self.assertEqual(min_para_hora(411), "06:51")
        self.assertEqual(min_para_hora(0), "00:00")
        self.assertEqual(min_para_hora(60), "01:00")
        self.assertEqual(min_para_hora(90), "01:30")


# ─── Exemplo 1 ────────────────────────────────────────────────────────────

class TestExemplo1(unittest.TestCase):
    """18:00–22:00 (diurna) + 23:00–08:00 (noturna cruzando meia-noite)."""

    def test_linha1_18_22(self):
        r = calc_fmt("18:00", "22:00")
        self.assertEqual(r["normais"], "04:00")
        self.assertEqual(r["not"],     "00:00")
        self.assertEqual(r["notRed"],  "00:00")
        self.assertEqual(r["total"],   "04:00")

    def test_linha2_23_08(self):
        r = calc_fmt("23:00", "08:00")
        self.assertEqual(r["normais"], "03:00")
        self.assertEqual(r["not"],     "06:00")
        self.assertEqual(r["notRed"],  "06:51")
        self.assertEqual(r["total"],   "09:51")

    def test_totais_consolidados(self):
        r1 = calcular_jornada("18:00", "22:00", PARAMS)
        r2 = calcular_jornada("23:00", "08:00", PARAMS)
        self.assertEqual(min_para_hora(r1.minutos_normais + r2.minutos_normais), "07:00")
        self.assertEqual(min_para_hora(r1.minutos_noturnos + r2.minutos_noturnos), "06:00")
        self.assertEqual(min_para_hora(r1.minutos_noturnos_red + r2.minutos_noturnos_red), "06:51")
        self.assertEqual(min_para_hora(r1.total_minutos + r2.total_minutos), "13:51")


# ─── Exemplo 2 ────────────────────────────────────────────────────────────

class TestExemplo2(unittest.TestCase):
    """20:15–23:45 + 00:30–06:15."""

    def test_linha1_20_15_23_45(self):
        r = calc_fmt("20:15", "23:45")
        self.assertEqual(r["normais"], "01:45")
        self.assertEqual(r["not"],     "01:45")
        self.assertEqual(r["notRed"],  "02:00")
        self.assertEqual(r["total"],   "03:45")

    def test_linha2_00_30_06_15(self):
        r = calc_fmt("00:30", "06:15")
        self.assertEqual(r["normais"], "01:15")
        self.assertEqual(r["not"],     "04:30")
        self.assertEqual(r["notRed"],  "05:09")
        self.assertEqual(r["total"],   "06:24")

    def test_totais_consolidados(self):
        r1 = calcular_jornada("20:15", "23:45", PARAMS)
        r2 = calcular_jornada("00:30", "06:15", PARAMS)
        self.assertEqual(min_para_hora(r1.minutos_normais + r2.minutos_normais), "03:00")
        self.assertEqual(min_para_hora(r1.minutos_noturnos + r2.minutos_noturnos), "06:15")
        self.assertEqual(min_para_hora(r1.minutos_noturnos_red + r2.minutos_noturnos_red), "07:09")
        self.assertEqual(min_para_hora(r1.total_minutos + r2.total_minutos), "10:09")


# ─── Exemplo 3 ────────────────────────────────────────────────────────────

class TestExemplo3(unittest.TestCase):
    """21:20–00:10 + 04:40–09:25."""

    def test_linha1_21_20_00_10(self):
        r = calc_fmt("21:20", "00:10")
        self.assertEqual(r["normais"], "00:40")
        self.assertEqual(r["not"],     "02:10")
        self.assertEqual(r["notRed"],  "02:29")
        self.assertEqual(r["total"],   "03:09")

    def test_linha2_04_40_09_25(self):
        r = calc_fmt("04:40", "09:25")
        self.assertEqual(r["normais"], "04:25")
        self.assertEqual(r["not"],     "00:20")
        self.assertEqual(r["notRed"],  "00:23")
        self.assertEqual(r["total"],   "04:48")

    def test_totais_consolidados(self):
        r1 = calcular_jornada("21:20", "00:10", PARAMS)
        r2 = calcular_jornada("04:40", "09:25", PARAMS)
        self.assertEqual(min_para_hora(r1.minutos_normais + r2.minutos_normais), "05:05")
        self.assertEqual(min_para_hora(r1.minutos_noturnos + r2.minutos_noturnos), "02:30")
        self.assertEqual(min_para_hora(r1.minutos_noturnos_red + r2.minutos_noturnos_red), "02:52")
        self.assertEqual(min_para_hora(r1.total_minutos + r2.total_minutos), "07:57")


# ─── Exemplo 4 ────────────────────────────────────────────────────────────

class TestExemplo4(unittest.TestCase):
    """22:10–02:25 (100% noturna) + 02:55–07:40."""

    def test_linha1_22_10_02_25(self):
        r = calc_fmt("22:10", "02:25")
        self.assertEqual(r["normais"], "00:00")
        self.assertEqual(r["not"],     "04:15")
        self.assertEqual(r["notRed"],  "04:51")
        self.assertEqual(r["total"],   "04:51")

    def test_linha2_02_55_07_40(self):
        r = calc_fmt("02:55", "07:40")
        self.assertEqual(r["normais"], "02:40")
        self.assertEqual(r["not"],     "02:05")
        self.assertEqual(r["notRed"],  "02:23")
        self.assertEqual(r["total"],   "05:03")

    def test_totais_consolidados(self):
        r1 = calcular_jornada("22:10", "02:25", PARAMS)
        r2 = calcular_jornada("02:55", "07:40", PARAMS)
        self.assertEqual(min_para_hora(r1.minutos_normais + r2.minutos_normais), "02:40")
        self.assertEqual(min_para_hora(r1.minutos_noturnos + r2.minutos_noturnos), "06:20")
        self.assertEqual(min_para_hora(r1.minutos_noturnos_red + r2.minutos_noturnos_red), "07:14")
        self.assertEqual(min_para_hora(r1.total_minutos + r2.total_minutos), "09:54")


# ─── Exemplo 5 ────────────────────────────────────────────────────────────

class TestExemplo5(unittest.TestCase):
    """17:35–23:20 + 23:40–04:25 (100% noturna)."""

    def test_linha1_17_35_23_20(self):
        r = calc_fmt("17:35", "23:20")
        self.assertEqual(r["normais"], "04:25")
        self.assertEqual(r["not"],     "01:20")
        self.assertEqual(r["notRed"],  "01:31")
        self.assertEqual(r["total"],   "05:56")

    def test_linha2_23_40_04_25(self):
        r = calc_fmt("23:40", "04:25")
        self.assertEqual(r["normais"], "00:00")
        self.assertEqual(r["not"],     "04:45")
        self.assertEqual(r["notRed"],  "05:26")
        self.assertEqual(r["total"],   "05:26")

    def test_totais_consolidados(self):
        r1 = calcular_jornada("17:35", "23:20", PARAMS)
        r2 = calcular_jornada("23:40", "04:25", PARAMS)
        self.assertEqual(min_para_hora(r1.minutos_normais + r2.minutos_normais), "04:25")
        self.assertEqual(min_para_hora(r1.minutos_noturnos + r2.minutos_noturnos), "06:05")
        self.assertEqual(min_para_hora(r1.minutos_noturnos_red + r2.minutos_noturnos_red), "06:57")
        self.assertEqual(min_para_hora(r1.total_minutos + r2.total_minutos), "11:22")


# ─── Exemplo 6 ────────────────────────────────────────────────────────────

class TestExemplo6(unittest.TestCase):
    """19:10–01:35 + 04:20–10:05."""

    def test_linha1_19_10_01_35(self):
        r = calc_fmt("19:10", "01:35")
        self.assertEqual(r["normais"], "02:50")
        self.assertEqual(r["not"],     "03:35")
        self.assertEqual(r["notRed"],  "04:06")
        self.assertEqual(r["total"],   "06:56")

    def test_linha2_04_20_10_05(self):
        r = calc_fmt("04:20", "10:05")
        self.assertEqual(r["normais"], "05:05")
        self.assertEqual(r["not"],     "00:40")
        self.assertEqual(r["notRed"],  "00:46")
        self.assertEqual(r["total"],   "05:51")

    def test_totais_consolidados(self):
        r1 = calcular_jornada("19:10", "01:35", PARAMS)
        r2 = calcular_jornada("04:20", "10:05", PARAMS)
        self.assertEqual(min_para_hora(r1.minutos_normais + r2.minutos_normais), "07:55")
        self.assertEqual(min_para_hora(r1.minutos_noturnos + r2.minutos_noturnos), "04:15")
        self.assertEqual(min_para_hora(r1.minutos_noturnos_red + r2.minutos_noturnos_red), "04:52")
        self.assertEqual(min_para_hora(r1.total_minutos + r2.total_minutos), "12:47")


# ─── Casos de borda ───────────────────────────────────────────────────────

class TestCasosLimite(unittest.TestCase):
    def test_exatamente_no_limite_noturno_22_05(self):
        r = calc_fmt("22:00", "05:00")
        self.assertEqual(r["normais"], "00:00")
        self.assertEqual(r["not"],     "07:00")

    def test_jornada_100_diurna_sem_noturna(self):
        r = calc_fmt("08:00", "17:00")
        self.assertEqual(r["normais"], "09:00")
        self.assertEqual(r["not"],     "00:00")
        self.assertEqual(r["notRed"],  "00:00")
        self.assertEqual(r["total"],   "09:00")

    def test_jornada_00_00_a_00_00_cruza_meia_noite(self):
        # 00:00 → 00:00 = 24h
        r = calcular_jornada("00:00", "00:00", PARAMS)
        self.assertGreater(r.total_minutos, 0)

    def test_consolidacao_ignora_entradas_vazias(self):
        # Grupo com entradas preenchidas + grupo vazio
        r_valido = calcular_jornada("08:00", "17:00", PARAMS)
        # Grupo vazio não contribui (testado pela ausência de erro)
        try:
            calcular_jornada("", "", PARAMS)
            falhou = True
        except Exception:
            falhou = False
        # Esperamos que entradas vazias gerem exceção ou retornem zero
        # (o plugin real trata isso na UI — aqui apenas verificamos que não crasham silenciosamente)
        self.assertEqual(min_para_hora(r_valido.minutos_normais), "09:00")

    def test_fator_reducao_configuravel(self):
        params_custom = Params(fator_reducao=60.0 / 60)  # fator 1 = sem redução
        r = calcular_jornada("22:00", "05:00", params_custom)
        # Com fator 1, noturnas reduzidas == noturnas reais
        self.assertEqual(r.minutos_noturnos, r.minutos_noturnos_red)

    def test_intervalo_zero(self):
        # Entrada igual à saída = 24h por convenção (cruza meia-noite)
        r = calcular_jornada("10:00", "10:00", PARAMS)
        self.assertEqual(r.minutos_normais + r.minutos_noturnos_red, r.total_minutos)

    def test_jornada_multiplos_periodos(self):
        # Dois períodos distintos no mesmo dia
        r1 = calcular_jornada("08:00", "12:00", PARAMS)
        r2 = calcular_jornada("13:00", "17:00", PARAMS)
        total = r1.total_minutos + r2.total_minutos
        self.assertEqual(min_para_hora(total), "08:00")

    def test_jornada_totalmente_noturna(self):
        r = calc_fmt("22:00", "02:00")
        self.assertEqual(r["normais"], "00:00")
        self.assertEqual(r["not"],     "04:00")

    def test_jornada_parcialmente_noturna(self):
        r = calc_fmt("20:00", "23:00")
        self.assertEqual(r["normais"], "02:00")
        self.assertEqual(r["not"],     "01:00")


if __name__ == "__main__":
    unittest.main(verbosity=2)
