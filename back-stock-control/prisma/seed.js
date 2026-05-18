require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const n = (v) => (v === 0 ? null : v)

const products = [
  // ── HELADO X KILO ──────────────────────────────────────────────────────────
  { name: 'ANANA A LA CREMA LATA',              category_name: 'HELADO X KILO',      kg_pack: 7.8,   cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 1000, kg_unidades: 7800 },
  { name: 'BANANA CON DULCE DE LECHE LATA',     category_name: 'HELADO X KILO',      kg_pack: 7.8,   cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 1000, kg_unidades: 7800 },
  { name: 'CAPPUCCINO GRANIZADO LATA',          category_name: 'HELADO X KILO',      kg_pack: 7.8,   cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 1000, kg_unidades: 7800 },
  { name: 'CEREZA LATA',                        category_name: 'HELADO X KILO',      kg_pack: 7.8,   cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 1000, kg_unidades: 7800 },
  { name: 'CHOCO BLANCO OREO LATA',             category_name: 'HELADO X KILO',      kg_pack: 7.8,   cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 1000, kg_unidades: 7800 },
  { name: 'CHOCOLATE LATA',                     category_name: 'HELADO X KILO',      kg_pack: 7.8,   cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 1000, kg_unidades: 7800 },
  { name: 'CHOCOLATE BLANCO LATA',              category_name: 'HELADO X KILO',      kg_pack: 7.8,   cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 1000, kg_unidades: 7800 },
  { name: 'CHOCOLATE CON ALMENDRAS LATA',       category_name: 'HELADO X KILO',      kg_pack: 7.8,   cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 1000, kg_unidades: 7800 },
  { name: 'CHOCOLATE DUBAI LATA',               category_name: 'HELADO X KILO',      kg_pack: 7.8,   cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 1000, kg_unidades: 7800 },
  { name: 'CHOCOLATE SUIZO LATA',               category_name: 'HELADO X KILO',      kg_pack: 7.8,   cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 1000, kg_unidades: 7800 },
  { name: 'CREMA AMERICANA LATA',               category_name: 'HELADO X KILO',      kg_pack: 7.8,   cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 1000, kg_unidades: 7800 },
  { name: 'CREMA COOKIE LATA',                  category_name: 'HELADO X KILO',      kg_pack: 7.8,   cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 1000, kg_unidades: 7800 },
  { name: 'CREMA RUSA LATA',                    category_name: 'HELADO X KILO',      kg_pack: 7.8,   cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 1000, kg_unidades: 7800 },
  { name: 'DULCE DE LECHE LATA',                category_name: 'HELADO X KILO',      kg_pack: 7.8,   cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 1000, kg_unidades: 7800 },
  { name: 'DULCE DE LECHE CON BROWNIE LATA',    category_name: 'HELADO X KILO',      kg_pack: 7.8,   cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 1000, kg_unidades: 7800 },
  { name: 'DULCE DE LECHE CON NUEZ LATA',       category_name: 'HELADO X KILO',      kg_pack: 7.8,   cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 1000, kg_unidades: 7800 },
  { name: 'DULCE DE LECHE GRANIZADO LATA',      category_name: 'HELADO X KILO',      kg_pack: 7.8,   cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 1000, kg_unidades: 7800 },
  { name: 'DURAZNO A LA CREMA LATA',            category_name: 'HELADO X KILO',      kg_pack: 7.8,   cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 1000, kg_unidades: 7800 },
  { name: 'FLAN LATA',                          category_name: 'HELADO X KILO',      kg_pack: 7.8,   cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 1000, kg_unidades: 7800 },
  { name: 'FRUTILLA A LA CREMA LATA',           category_name: 'HELADO X KILO',      kg_pack: 7.8,   cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 1000, kg_unidades: 7800 },
  { name: 'FRUTILLA AL AGUA LATA',              category_name: 'HELADO X KILO',      kg_pack: 7.8,   cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 1000, kg_unidades: 7800 },
  { name: 'FRUTOS ROJOS AL AGUA LATA',          category_name: 'HELADO X KILO',      kg_pack: 7.8,   cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 1000, kg_unidades: 7800 },
  { name: 'GRANIZADO LATA',                     category_name: 'HELADO X KILO',      kg_pack: 7.8,   cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 1000, kg_unidades: 7800 },
  { name: 'KINOTOS AL WHISKY LATA',             category_name: 'HELADO X KILO',      kg_pack: 7.8,   cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 1000, kg_unidades: 7800 },
  { name: 'LIMON AL AGUA LATA',                 category_name: 'HELADO X KILO',      kg_pack: 7.8,   cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 1000, kg_unidades: 7800 },
  { name: 'MARACUYA AL AGUA LATA',              category_name: 'HELADO X KILO',      kg_pack: 7.8,   cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 1000, kg_unidades: 7800 },
  { name: 'MARROC LATA',                        category_name: 'HELADO X KILO',      kg_pack: 7.8,   cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 1000, kg_unidades: 7800 },
  { name: 'MASCARPONE CON FRUTOS ROJOS LATA',   category_name: 'HELADO X KILO',      kg_pack: 7.8,   cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 1000, kg_unidades: 7800 },
  { name: 'MENTA GRANIZADA LATA',               category_name: 'HELADO X KILO',      kg_pack: 7.8,   cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 1000, kg_unidades: 7800 },
  { name: 'MANGO AL AGUA LATA',                 category_name: 'HELADO X KILO',      kg_pack: 7.8,   cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 1000, kg_unidades: 7800 },
  { name: 'SAMBAYON LATA',                      category_name: 'HELADO X KILO',      kg_pack: 7.8,   cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 1000, kg_unidades: 7800 },
  { name: 'SUPER DULCE DE LECHE LATA',          category_name: 'HELADO X KILO',      kg_pack: 7.8,   cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 1000, kg_unidades: 7800 },
  { name: 'SUPER GRIDITO LATA',                 category_name: 'HELADO X KILO',      kg_pack: 7.8,   cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 1000, kg_unidades: 7800 },
  { name: 'TIRAMISU LATA',                      category_name: 'HELADO X KILO',      kg_pack: 7.8,   cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 1000, kg_unidades: 7800 },
  { name: 'TRAMONTANA LATA',                    category_name: 'HELADO X KILO',      kg_pack: 7.8,   cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 1000, kg_unidades: 7800 },
  { name: 'VAINILLA LATA',                      category_name: 'HELADO X KILO',      kg_pack: 7.8,   cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 1000, kg_unidades: 7800 },

  // ── LÍNEAS ESPECIALES ──────────────────────────────────────────────────────
  { name: 'POSTRE VEGANO CHOCOLATE',            category_name: 'LÍNEAS ESPECIALES',  kg_pack: 0.96,  cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 12,   kg_unidades: 0.08 },
  { name: 'POSTRE VEGANO VAINILLA',             category_name: 'LÍNEAS ESPECIALES',  kg_pack: 0.96,  cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 12,   kg_unidades: 0.08 },
  { name: 'POSTRE VEGANO MANI',                 category_name: 'LÍNEAS ESPECIALES',  kg_pack: 0.96,  cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 12,   kg_unidades: 0.08 },
  { name: 'YOGURT SIN TACC MANGO MARACUYA',     category_name: 'LÍNEAS ESPECIALES',  kg_pack: 0.96,  cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 12,   kg_unidades: 0.08 },
  { name: 'YOGURT SIN TACC FRUTILLA',           category_name: 'LÍNEAS ESPECIALES',  kg_pack: 0.96,  cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 12,   kg_unidades: 0.08 },
  { name: 'YOGURT SIN TACC FRUTOS DEL BOSQUE',  category_name: 'LÍNEAS ESPECIALES',  kg_pack: 0.96,  cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 12,   kg_unidades: 0.08 },
  { name: 'HELADO RED AZUCARES DDL',            category_name: 'LÍNEAS ESPECIALES',  kg_pack: 0.96,  cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 12,   kg_unidades: 0.08 },
  { name: 'HELADO RED AZUCARES FRUTILLA',       category_name: 'LÍNEAS ESPECIALES',  kg_pack: 0.96,  cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 12,   kg_unidades: 0.08 },
  { name: 'HELADO RED AZUCARES CHOCOLATE',      category_name: 'LÍNEAS ESPECIALES',  kg_pack: 0.96,  cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 12,   kg_unidades: 0.08 },

  // ── BOMBONES ──────────────────────────────────────────────────────────────
  { name: 'ALFAJOR SECRETO X 6 X 6',           category_name: 'BOMBONES',           kg_pack: 2.952, cajas_x_pack: 6,    kg_caja: 0.492, unidades_x_caja: 6,    unidades_x_pack: 36,   kg_unidades: 0.082 },
  { name: 'BOMBON CROCANTE X 6 X 8',           category_name: 'BOMBONES',           kg_pack: 3.36,  cajas_x_pack: 6,    kg_caja: 0.56,  unidades_x_caja: 8,    unidades_x_pack: 48,   kg_unidades: 0.07  },
  { name: 'BOMBON ESCOCES X 6 X 8',            category_name: 'BOMBONES',           kg_pack: 4.272, cajas_x_pack: 6,    kg_caja: 0.712, unidades_x_caja: 8,    unidades_x_pack: 48,   kg_unidades: 0.089 },
  { name: 'BOMBON SUIZO X 6 X 8',              category_name: 'BOMBONES',           kg_pack: 4.032, cajas_x_pack: 6,    kg_caja: 0.672, unidades_x_caja: 8,    unidades_x_pack: 48,   kg_unidades: 0.084 },
  { name: 'BOMBON FRUTEZZA X 6 X 8',           category_name: 'BOMBONES',           kg_pack: 3.552, cajas_x_pack: 6,    kg_caja: 0.592, unidades_x_caja: 8,    unidades_x_pack: 48,   kg_unidades: 0.074 },

  // ── TORTAS ────────────────────────────────────────────────────────────────
  { name: 'COOKIE AND CREAM TORTA',             category_name: 'TORTAS',             kg_pack: 6.27,  cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 6,    kg_unidades: 1.045 },
  { name: 'FRUTILLA CON CREMA TORTA',           category_name: 'TORTAS',             kg_pack: 6.27,  cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 6,    kg_unidades: 1.045 },
  { name: 'GRIDO TORTA',                        category_name: 'TORTAS',             kg_pack: 6.27,  cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 6,    kg_unidades: 1.045 },

  // ── FAMILIARES ────────────────────────────────────────────────────────────
  { name: 'FAMILIAR N1',                        category_name: 'FAMILIARES',         kg_pack: 9.6,   cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 6,    kg_unidades: 1.6   },
  { name: 'FAMILIAR N2',                        category_name: 'FAMILIARES',         kg_pack: 9.6,   cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 6,    kg_unidades: 1.6   },
  { name: 'FAMILIAR N3',                        category_name: 'FAMILIARES',         kg_pack: 9.6,   cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 6,    kg_unidades: 1.6   },
  { name: 'FAMILIAR N4',                        category_name: 'FAMILIARES',         kg_pack: 9.6,   cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 6,    kg_unidades: 1.6   },

  // ── TENTACIONES ───────────────────────────────────────────────────────────
  { name: 'CHOCO ALMENDRAS TENTACION',          category_name: 'TENTACIONES',        kg_pack: 4.14,  cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 6,    kg_unidades: 0.69  },
  { name: 'CHOCOLATE TENTACION',                category_name: 'TENTACIONES',        kg_pack: 4.14,  cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 6,    kg_unidades: 0.69  },
  { name: 'CREMA AMERICANA TENTACION',          category_name: 'TENTACIONES',        kg_pack: 4.14,  cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 6,    kg_unidades: 0.69  },
  { name: 'CREMA COOKIE TENTACION',             category_name: 'TENTACIONES',        kg_pack: 4.14,  cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 6,    kg_unidades: 0.69  },
  { name: 'DULCE DE LECHE TENTACION',           category_name: 'TENTACIONES',        kg_pack: 4.14,  cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 6,    kg_unidades: 0.69  },
  { name: 'DDL GRANIZADO TENTACION',            category_name: 'TENTACIONES',        kg_pack: 4.14,  cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 6,    kg_unidades: 0.69  },
  { name: 'FRUTILLA TENTACION',                 category_name: 'TENTACIONES',        kg_pack: 4.14,  cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 6,    kg_unidades: 0.69  },
  { name: 'GRANIZADO TENTACION',                category_name: 'TENTACIONES',        kg_pack: 4.14,  cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 6,    kg_unidades: 0.69  },
  { name: 'LIMON TENTACION',                    category_name: 'TENTACIONES',        kg_pack: 4.14,  cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 6,    kg_unidades: 0.69  },
  { name: 'MENTA GRANIZADA TENTACION',          category_name: 'TENTACIONES',        kg_pack: 4.14,  cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 6,    kg_unidades: 0.69  },
  { name: 'VAINILLA TENTACION',                 category_name: 'TENTACIONES',        kg_pack: 4.14,  cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 6,    kg_unidades: 0.69  },
  { name: 'TODDY GALLETITAS TENTACION',         category_name: 'TENTACIONES',        kg_pack: 4.14,  cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 6,    kg_unidades: 0.69  },

  // ── PALITOS ───────────────────────────────────────────────────────────────
  { name: 'CREMA AMERICANA PALITOS',            category_name: 'PALITOS',            kg_pack: 4.0,   cajas_x_pack: 10,   kg_caja: 0.4,   unidades_x_caja: 10,   unidades_x_pack: 100,  kg_unidades: 0.04  },
  { name: 'CREMA FRUTILLA PALITOS',             category_name: 'PALITOS',            kg_pack: 4.0,   cajas_x_pack: 10,   kg_caja: 0.4,   unidades_x_caja: 10,   unidades_x_pack: 100,  kg_unidades: 0.04  },
  { name: 'AGUA FRUTILLA PALITOS',              category_name: 'PALITOS',            kg_pack: 4.4,   cajas_x_pack: 4,    kg_caja: 1.1,   unidades_x_caja: 20,   unidades_x_pack: 80,   kg_unidades: 0.055 },
  { name: 'AGUA LIMON PALITOS',                 category_name: 'PALITOS',            kg_pack: 4.4,   cajas_x_pack: 4,    kg_caja: 1.1,   unidades_x_caja: 20,   unidades_x_pack: 80,   kg_unidades: 0.055 },
  { name: 'AGUA NARANJA PALITOS',               category_name: 'PALITOS',            kg_pack: 4.4,   cajas_x_pack: 4,    kg_caja: 1.1,   unidades_x_caja: 20,   unidades_x_pack: 80,   kg_unidades: 0.055 },
  { name: 'BOMBON PALITOS',                     category_name: 'PALITOS',            kg_pack: 5.1,   cajas_x_pack: 10,   kg_caja: 0.51,  unidades_x_caja: 10,   unidades_x_pack: 100,  kg_unidades: 0.051 },

  // ── POSTRES ───────────────────────────────────────────────────────────────
  { name: 'ALMENDRADO',                         category_name: 'POSTRES',            kg_pack: 4.032, cajas_x_pack: 6,    kg_caja: 0.672, unidades_x_caja: 8,    unidades_x_pack: 48,   kg_unidades: 0.084 },
  { name: 'CASATTA',                            category_name: 'POSTRES',            kg_pack: 3.6,   cajas_x_pack: 6,    kg_caja: 0.6,   unidades_x_caja: 8,    unidades_x_pack: 48,   kg_unidades: 0.075 },
  { name: 'CROCANTINO',                         category_name: 'POSTRES',            kg_pack: 2.6,   cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 4,    kg_unidades: 0.65  },
  { name: 'DELICIA',                            category_name: 'POSTRES',            kg_pack: 2.4,   cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 4,    kg_unidades: 0.6   },

  // ── CONGELADOS ────────────────────────────────────────────────────────────
  { name: 'PIZZA MUZZARELLA',                   category_name: 'CONGELADOS',         kg_pack: 6.12,  cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 12,   kg_unidades: 0.51  },
  { name: 'MINI PIZZA',                         category_name: 'CONGELADOS',         kg_pack: 3.6,   cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 20,   kg_unidades: 0.18  },
  { name: 'PIZZA INTEGRAL',                     category_name: 'CONGELADOS',         kg_pack: 6.36,  cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 12,   kg_unidades: 0.53  },
  { name: 'PIZZA CEBOLLA',                      category_name: 'CONGELADOS',         kg_pack: 5.94,  cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 11,   kg_unidades: 0.54  },
  { name: 'PIZZA JAMON',                        category_name: 'CONGELADOS',         kg_pack: 5.88,  cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 11,   kg_unidades: 0.535 },
  { name: 'PIZZA CASERA',                       category_name: 'CONGELADOS',         kg_pack: 5.32,  cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 8,    kg_unidades: 0.665 },
  { name: 'BASTONCITOS',                        category_name: 'CONGELADOS',         kg_pack: 6.08,  cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 16,   kg_unidades: 0.38  },
  { name: 'PECHUGUITAS',                        category_name: 'CONGELADOS',         kg_pack: 6.08,  cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 16,   kg_unidades: 0.38  },
  { name: 'EMPANADAS CARNE',                    category_name: 'CONGELADOS',         kg_pack: 5.76,  cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 18,   kg_unidades: 0.32  },
  { name: 'EMPANADAS JAMON Y QUESO',            category_name: 'CONGELADOS',         kg_pack: 5.76,  cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 18,   kg_unidades: 0.32  },
  { name: 'FRAMBUESAS BAÑADAS CHOCO',           category_name: 'CONGELADOS',         kg_pack: 2.88,  cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 24,   kg_unidades: 0.12  },
  { name: 'FRUTILLAS BAÑADAS CHOCO',            category_name: 'CONGELADOS',         kg_pack: 2.88,  cajas_x_pack: null, kg_caja: null,  unidades_x_caja: null, unidades_x_pack: 24,   kg_unidades: 0.12  },
]

async function main() {
  const result = await prisma.products.createMany({ data: products })
  console.log(`Insertados ${result.count} productos`)

  const total = await prisma.products.count()
  const byCategory = await prisma.products.groupBy({
    by: ['category_name'],
    _count: { id: true },
    orderBy: { category_name: 'asc' }
  })

  console.log(`\nTotal en DB: ${total}`)
  byCategory.forEach(c => console.log(`  ${c.category_name.padEnd(22)} ${c._count.id} productos`))
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
