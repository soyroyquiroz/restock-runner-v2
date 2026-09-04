import { createContext, useContext } from 'react'

export type Lang = 'en' | 'es'

type Dict = Record<string, { en: string; es: string }>

export const STRINGS: Dict = {
  // marca / navegación
  appName:      { en: 'Restock Runner',   es: 'Restock Runner' },
  resort:       { en: 'Sagamore Resort',  es: 'Sagamore Resort' },
  tabRound:     { en: '1 Round',          es: '1 Ronda' },
  tabTrip:      { en: '2 Trip',           es: '2 Viaje' },
  tabProgress:  { en: 'Progress',         es: 'Progreso' },
  tabTeam:      { en: 'Team',             es: 'Runners' },
  tabCatalog:   { en: 'Catalog',          es: 'Catálogo' },
  tabAccount:   { en: 'Account',          es: 'Cuenta' },
  loading:      { en: 'Loading…',         es: 'Cargando…' },
  save:         { en: 'Save',             es: 'Guardar' },
  saving:       { en: 'Saving…',          es: 'Guardando…' },
  saved:        { en: 'Saved',            es: 'Guardado' },
  cancel:       { en: 'Cancel',           es: 'Cancelar' },
  remove:       { en: 'Remove',           es: 'Quitar' },

  // login
  whoAreYou:    { en: 'Who are you?',     es: '¿Quién eres?' },
  noRunners:    { en: 'No one has been added yet.', es: 'No hay runners dados de alta.' },
  pinOf:        { en: 'PIN for',          es: 'PIN de' },
  wrongPin:     { en: 'Wrong PIN.',       es: 'PIN incorrecto.' },
  changeName:   { en: '← Pick a different name', es: '← Cambiar de nombre' },
  connError:    { en: 'Could not connect.', es: 'No se pudo conectar.' },
  logout:       { en: 'sign out',         es: 'salir' },

  // captura
  stepWhere:    { en: '1 · Where',        es: '1 · Dónde' },
  outside:      { en: 'Outside (Lodges)', es: 'Outside (Lodges)' },
  mainHotel:    { en: 'Main Hotel',       es: 'Main Hotel' },
  stepLodge:    { en: '2 · Lodge and Bridge', es: '2 · Lodge y Bridge' },
  stepFloor:    { en: '2 · Floor',        es: '2 · Piso' },
  pickLodge:    { en: 'Select a lodge',   es: 'Selecciona lodge' },
  pickFloor:    { en: 'Select a floor',   es: 'Selecciona piso' },
  stepType:     { en: '3 · Restock type', es: '3 · Tipo de restock' },
  deep:         { en: 'Full',             es: 'Profundidad' },
  deepSub:      { en: 'every item',       es: 'todos los items' },
  urgent:       { en: 'Urgent',           es: 'Urgente' },
  urgentSub:    { en: 'critical only',    es: 'solo críticos' },
  stepItems:    { en: '4 · What is there', es: '4 · Qué hay' },
  sliderHelp:   { en: 'Slide to what IS there. The app works out what is missing.',
                  es: 'Mueve el slider a lo que SÍ hay. Lo que falta se calcula solo.' },
  full:         { en: 'full',             es: 'lleno' },
  complete:     { en: 'complete',         es: 'completo' },
  missing:      { en: 'missing',          es: 'falta' },
  saveSpace:    { en: 'Save this space',  es: 'Guardar espacio' },
  saveFailed:   { en: 'Could not save:',  es: 'No se pudo guardar:' },

  // viaje
  step1Pick:    { en: 'Step 1 · Pick the bridges for this trip', es: 'Paso 1 · Elige los bridges de este viaje' },
  noShortages:  { en: 'Nothing is short. Do an inventory round first.',
                  es: 'No hay faltantes. Haz primero la ronda de inventario.' },
  items:        { en: 'items',            es: 'items' },
  buildTrip:    { en: 'Build trip with',  es: 'Armar viaje con' },
  stops:        { en: 'stops',            es: 'paradas' },
  stop:         { en: 'stop',             es: 'parada' },
  building:     { en: 'Building…',        es: 'Armando…' },
  step2Load:    { en: 'Step 2 · Load the cart', es: 'Paso 2 · Carga el carrito' },
  loadHelp:     { en: 'Everything you need from the boathouse for',
                  es: 'Todo lo que necesitas del boathouse para' },
  inOneTrip:    { en: 'in a single trip.', es: 'en un solo viaje.' },
  tripStops:    { en: 'Stops on this trip', es: 'Paradas de este viaje' },
  cartReady:    { en: 'Cart ready · start route', es: 'Carrito listo · empezar ruta' },
  leaveWith:    { en: 'Leave with',       es: 'Salir con' },
  unchecked:    { en: 'unchecked',        es: 'sin palomear' },
  cancelTrip:   { en: 'Cancel trip',      es: 'Cancelar viaje' },
  confirmCancel:{ en: 'Cancel this trip?', es: '¿Cancelar este viaje?' },
  step3Route:   { en: 'Step 3 · Delivery route', es: 'Paso 3 · Ruta de entrega' },
  stopsDone:    { en: 'stops delivered',  es: 'paradas entregadas' },
  of:           { en: 'of',               es: 'de' },
  park:         { en: 'Park',             es: 'Parkea' },
  box:          { en: 'box',              es: 'caja' },
  boxes:        { en: 'boxes',            es: 'cajas' },
  fromCart:     { en: 'from what you carry', es: 'de lo que traes' },
  leave:        { en: 'leave',            es: 'deja' },
  units:        { en: 'units',            es: 'unidades' },
  leftFor:      { en: 'left for the next one', es: 'te sobran para el siguiente' },
  stopDone:     { en: 'Stop done · next', es: 'Parada lista · siguiente' },
  endTrip:      { en: 'End trip here',    es: 'Terminar viaje aquí' },
  confirmEnd:   { en: 'End the trip here? Stops you did not deliver stay pending.',
                  es: '¿Terminar el viaje aquí? Las paradas no entregadas se quedan pendientes.' },
  openTrips:    { en: 'Open trips from others', es: 'Viajes abiertos de otros' },
  close:        { en: 'Close',            es: 'Cerrar' },

  // progreso
  today:        { en: 'Today',            es: 'Hoy' },
  inventory:    { en: 'Inventory',        es: 'Inventario' },
  spacesToday:  { en: 'spaces today',     es: 'espacios hoy' },
  nothingToday: { en: 'Nothing captured today.', es: 'Nada capturado hoy.' },
  islandShort:  { en: 'Current shortage across the island', es: 'Faltante actual de toda la isla' },
  noShortage:   { en: 'No shortages.',    es: 'Sin faltantes.' },
  levelBySpace: { en: 'Level by space',   es: 'Nivel por espacio' },

  // equipo
  addPerson:    { en: 'Add someone',      es: 'Agregar persona' },
  name:         { en: 'Name',             es: 'Nombre' },
  pin4:         { en: '4-digit PIN',      es: 'PIN de 4 dígitos' },
  add:          { en: 'Add',              es: 'Agregar' },
  team:         { en: 'Team',             es: 'Equipo' },
  showPins:     { en: 'Show PINs',        es: 'Ver PINs' },
  hidePins:     { en: 'Hide PINs',        es: 'Ocultar PINs' },
  changePin:    { en: 'change PIN',       es: 'cambiar PIN' },
  deactivate:   { en: 'deactivate',       es: 'desactivar' },
  activate:     { en: 'activate',         es: 'activar' },
  inactive:     { en: 'inactive',         es: 'inactivo' },
  roleRunner:   { en: 'Runner',           es: 'Runner' },
  roleSup:      { en: 'Supervisor',       es: 'Supervisor' },
  roleAdmin:    { en: 'Admin',            es: 'Admin' },
  newPinFor:    { en: 'New PIN for',      es: 'PIN nuevo para' },
  pinMust4:     { en: 'The PIN must be 4 digits.', es: 'El PIN debe ser de 4 dígitos.' },
  nameTaken:    { en: 'Someone already has that name.', es: 'Ya existe alguien con ese nombre.' },
  cantDeactivateSelf: { en: 'You cannot deactivate yourself.', es: 'No puedes desactivarte a ti mismo.' },
  cantDropAdmin:{ en: 'You cannot remove your own admin role.', es: 'No puedes quitarte el rol de admin.' },

  // cuenta
  myAccount:    { en: 'My account',       es: 'Mi cuenta' },
  changeMyPin:  { en: 'Change my PIN',    es: 'Cambiar mi PIN' },
  currentPin:   { en: 'Current PIN',      es: 'PIN actual' },
  newPin:       { en: 'New PIN',          es: 'PIN nuevo' },
  repeatPin:    { en: 'Repeat new PIN',   es: 'Repite el PIN nuevo' },
  pinsDontMatch:{ en: 'The two new PINs do not match.', es: 'Los dos PINs nuevos no coinciden.' },
  pinSameAsOld: { en: 'The new PIN is the same as the current one.', es: 'El PIN nuevo es igual al actual.' },
  wrongCurrent: { en: 'Your current PIN does not match.', es: 'Tu PIN actual no coincide.' },
  pinChanged:   { en: 'PIN changed',      es: 'PIN cambiado' },
  forgotHint:   { en: 'If you forget it, Rodrigo can reset it for you.',
                  es: 'Si se te olvida, Rodrigo te lo puede resetear.' },
  signOut:      { en: 'Sign out',         es: 'Cerrar sesión' },
  language:     { en: 'Language',         es: 'Idioma' },

  // catálogo
  catalogHelp:  { en: 'Change how many visual units a space holds at 100%, how many pieces each unit is, and how many pieces come in a box. Applies immediately for everyone.',
                  es: 'Cambia cuántas unidades visuales lleva un espacio al 100%, cuántas piezas es cada unidad, y cuántas piezas trae una caja. Aplica de inmediato para todos.' },
  pcsPerBox:    { en: 'Pieces per box',   es: 'Piezas por caja' },
  pcsBoxShort:  { en: 'pcs/box',          es: 'pzs/caja' },
  bridgesLabel: { en: 'Bridges (outside)', es: 'Bridges (outside)' },
  mainLabel:    { en: 'Main Hotel (Floors 2 and 3)', es: 'Main Hotel (Piso 2 y 3)' },
  at100:        { en: 'at 100%',          es: 'al 100%' },
  pcsPer:       { en: 'pcs per',          es: 'pzs por' },
  fullStandard: { en: 'Full standard:',   es: 'Estándar completo:' },
  perSpace:     { en: 'per space',        es: 'por espacio' },
  restoreItem:  { en: 'Restore original values', es: 'Restaurar valores originales' },
  confirmRestore:{ en: 'Reset this item to the values in the code?', es: '¿Regresar este item a los valores originales del código?' },
  restored:     { en: 'Restored',         es: 'Restaurado' },
  adminOnly:    { en: 'Only the admin can edit the catalog.', es: 'Solo el admin puede editar el catálogo.' },
  pcs:          { en: 'pcs',              es: 'pzs' },
  loosePcs:     { en: 'loose pcs',        es: 'pzs sueltas' },
}

// Unidades visuales: se traducen por palabra, no por item
const UNITS: Record<string, string> = {
  'hilera': 'row', 'hileras': 'rows',
  'caja': 'box', 'cajas': 'boxes',
  'caja verde': 'green box', 'cajas verdes': 'green boxes',
  'cuarto de bin': 'quarter bin', 'cuartos de bin': 'quarter bins',
  'bolsa': 'bag', 'bolsas': 'bags',
  'bolsa (25 pzs)': 'bag (25 pcs)', 'bolsas (25 pzs)': 'bags (25 pcs)',
  'botellita': 'bottle', 'botellitas': 'bottles',
  'pieza': 'piece', 'piezas': 'pieces',
  'pack': 'pack', 'packs': 'packs',
  'sleeve': 'sleeve', 'sleeves': 'sleeves',
  'case': 'case', 'cases': 'cases',
  'bin': 'bin', 'bins': 'bins',
}

export function tUnit(unit: string, lang: Lang): string {
  return lang === 'es' ? unit : (UNITS[unit] ?? unit)
}

export const LangContext = createContext<Lang>('en')

export function useT() {
  const lang = useContext(LangContext)
  const t = (key: keyof typeof STRINGS | string): string => {
    const entry = STRINGS[key as string]
    return entry ? entry[lang] : String(key)
  }
  return { t, lang, tUnit: (u: string) => tUnit(u, lang) }
}
