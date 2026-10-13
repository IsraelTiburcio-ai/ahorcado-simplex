/*
  Ahorcado Simplex · configuración y banco de palabras
  Fuente: Gimnasio 3 · Método Simplex (3.1 Forma canónica, 3.2 Equivalencias,
  3.3 Método Simplex, 3.4 M grande, 3.5 Dos fases, 3.6 Simplex revisado).

  Campos de cada entrada:
    id        identificador único
    palabra   término oculto (con acentos; el juego ignora acentos al adivinar)
    tema      sección del Gimnasio 3
    nivel     "facil" | "media"
    pista     pista académica breve que se muestra al iniciar la ronda
    cierre    definición breve que se muestra al acertar (inicia con "Correcto.")
    refuerzo  pista reforzada que se muestra al fallar
*/

window.AHORCADO_CONFIG = {
  duracionSeg: 90,           // duración máxima de cada partida (cuenta regresiva)
  rondasOpciones: [3, 4, 5], // palabras por partida que puede elegir el alumno
  rondasPorDefecto: 4,
  maxErrores: 6              // intentos por palabra (un engrane por intento)
};

window.AHORCADO_BANCO = [
  {
    id: 'canonica',
    palabra: 'CANÓNICA',
    tema: '3.1 Forma canónica',
    nivel: 'media',
    pista: 'Forma requerida para ciertos procedimientos del método.',
    cierre: 'Correcto. Canónica: restricciones ≤ en maximización (o ≥ en minimización) y x ≥ 0.',
    refuerzo: 'Forma canónica de maximización: max z = cx, Ax ≤ b, x ≥ 0. Los libros la piden para aplicar el método simplex.'
  },
  {
    id: 'minimizacion',
    palabra: 'MINIMIZACIÓN',
    tema: '3.1 Forma canónica',
    nivel: 'media',
    pista: 'Sentido de optimización que busca el menor valor posible de z.',
    cierre: 'Correcto. Minimización: se busca el menor valor de z; su forma canónica usa restricciones ≥.',
    refuerzo: 'Minimizar z = cx equivale a maximizar −cx (equivalencia 1, tema 3.2).'
  },
  {
    id: 'maximizacion',
    palabra: 'MAXIMIZACIÓN',
    tema: '3.1 Forma canónica',
    nivel: 'media',
    pista: 'Sentido de optimización que busca el mayor valor posible de z.',
    cierre: 'Correcto. Maximización: se busca el mayor valor de z; su forma canónica usa restricciones ≤.',
    refuerzo: 'Maximizar z = cx equivale a minimizar −cx. Los libros piden la forma canónica de maximización para aplicar el método simplex.'
  },
  {
    id: 'holgura',
    palabra: 'HOLGURA',
    tema: '3.2 Equivalencias',
    nivel: 'facil',
    pista: 'Variable que se agrega a una restricción ≤ para convertirla en igualdad.',
    cierre: 'Correcto. Holgura: se agrega a una restricción ≤.',
    refuerzo: 'Holgura: variable no negativa que mide el recurso sobrante. Si x₃ = 4, sobran 4 unidades.'
  },
  {
    id: 'exceso',
    palabra: 'EXCESO',
    tema: '3.2 Equivalencias',
    nivel: 'media',
    pista: 'Variable que se resta a una restricción ≥ para convertirla en igualdad.',
    cierre: 'Correcto. Exceso: se resta a una restricción ≥ para formar una igualdad.',
    refuerzo: 'Exceso: variable no negativa que mide cuánto se supera el mínimo. Si x₄ = 2, se supera en 2 unidades.'
  },
  {
    id: 'artificial',
    palabra: 'ARTIFICIAL',
    tema: '3.3 Método Simplex',
    nivel: 'media',
    pista: 'Variable auxiliar que se agrega a restricciones = o ≥ para obtener una solución inicial.',
    cierre: 'Correcto. Artificial: variable auxiliar que da una base inicial; al final debe valer 0.',
    refuerzo: 'Variable artificial: solo sirve para iniciar. Si al final sigue positiva, el modelo original no tiene solución factible.'
  },
  {
    id: 'pivote',
    palabra: 'PIVOTE',
    tema: '3.3 Método Simplex',
    nivel: 'facil',
    pista: 'Elemento clave usado para transformar la tabla en el método Simplex.',
    cierre: 'Correcto. Pivote: elemento que se convierte en 1 para transformar la tabla.',
    refuerzo: 'Pivote: está en la intersección de la columna de entrada y el renglón de salida. Su valor pasa a ser 1.'
  },
  {
    id: 'simplex',
    palabra: 'SIMPLEX',
    tema: '3.3 Método Simplex',
    nivel: 'facil',
    pista: 'Algoritmo que se repite una y otra vez hasta obtener la solución óptima.',
    cierre: 'Correcto. Simplex: algoritmo iterativo que recorre puntos extremos hasta la solución óptima.',
    refuerzo: 'Simplex: parte de una solución básica factible y avanza de punto extremo en punto extremo hasta la óptima.'
  },
  {
    id: 'revisado',
    palabra: 'REVISADO',
    tema: '3.6 Simplex revisado',
    nivel: 'media',
    pista: 'Versión del método que trabaja con matrices y la inversa de la base, sin llenar tablas completas.',
    cierre: 'Correcto. Simplex revisado: mismos pasos, pero calcula con B⁻¹ en lugar de tablas completas.',
    refuerzo: 'Simplex revisado: usa forma matricial. Con B⁻¹ se calculan x_B, z, zⱼ − cⱼ y las yᵢ de la variable de entrada.'
  },
  {
    id: 'dual',
    palabra: 'DUAL',
    tema: '3.1 Forma canónica',
    nivel: 'facil',
    pista: 'Variante del método simplex para modelos de minimización con restricciones ≥.',
    cierre: 'Correcto. Dual: variante del Simplex para minimización en forma canónica (restricciones ≥).',
    refuerzo: 'Dual simplex: parte de una solución no factible y avanza hasta la factibilidad sin perder la optimalidad.'
  },
  {
    id: 'factible',
    palabra: 'FACTIBLE',
    tema: '3.3 Método Simplex',
    nivel: 'media',
    pista: 'Solución que cumple todas las restricciones y la no negatividad de las variables.',
    cierre: 'Correcto. Factible: cumple todas las restricciones y tiene variables no negativas.',
    refuerzo: 'Factible: pertenece a la región factible. Una solución básica factible es un punto extremo de esa región.'
  },
  {
    id: 'restriccion',
    palabra: 'RESTRICCIÓN',
    tema: '3.1 Forma canónica',
    nivel: 'media',
    pista: 'Condición del modelo que limita los valores de las variables mediante ≤, ≥ o =.',
    cierre: 'Correcto. Restricción: condición que limita las variables con ≤, ≥ o =.',
    refuerzo: 'Restricción: cada renglón de Ax ≤ b, Ax ≥ b o Ax = b. Puede volverse igualdad con holgura, exceso o artificial.'
  },
  {
    id: 'variable',
    palabra: 'VARIABLE',
    tema: '3.2 Equivalencias',
    nivel: 'facil',
    pista: 'Incógnita del modelo cuyo valor se determina al resolverlo.',
    cierre: 'Correcto. Variable: incógnita del modelo que el método determina.',
    refuerzo: 'Variable: puede ser de decisión, de holgura, de exceso o artificial.'
  },
  {
    id: 'iteracion',
    palabra: 'ITERACIÓN',
    tema: '3.3 Método Simplex',
    nivel: 'facil',
    pista: 'Cada repetición completa del procedimiento que acerca a la solución óptima.',
    cierre: 'Correcto. Iteración: un ciclo completo de entrada, salida y actualización.',
    refuerzo: 'Iteración: en cada una entra una variable no básica y sale una básica.'
  },
  {
    id: 'optima',
    palabra: 'ÓPTIMA',
    tema: '3.3 Método Simplex',
    nivel: 'facil',
    pista: 'Solución factible que da el mejor valor posible de z.',
    cierre: 'Correcto. Óptima: la mejor solución factible; ya no hay variable que mejore z.',
    refuerzo: 'Óptima: se cumple el criterio de optimalidad; ningún cambio de base mejora z.'
  },
  {
    id: 'basica',
    palabra: 'BÁSICA',
    tema: '3.3 Método Simplex',
    nivel: 'facil',
    pista: 'Variable que se obtiene al resolver el sistema y forma parte de la base.',
    cierre: 'Correcto. Básica: forma parte de la base y se despeja del sistema.',
    refuerzo: 'Básica: se despeja del sistema de ecuaciones; las que quedan fuera de la base valen cero.'
  },
  {
    id: 'no-basica',
    palabra: 'NO BÁSICA',
    tema: '3.3 Método Simplex',
    nivel: 'media',
    pista: 'Variable que queda fuera de la base y vale cero en la solución.',
    cierre: 'Correcto. No básica: vale cero; puede entrar a la base si mejora el valor de z.',
    refuerzo: 'No básica: en una solución básica vale cero. Si su zⱼ − cⱼ indica mejora, puede entrar a la base.'
  },
  {
    id: 'estandar',
    palabra: 'ESTÁNDAR',
    tema: '3.3 Método Simplex',
    nivel: 'facil',
    pista: 'Forma del modelo con restricciones de igualdad y variables no negativas.',
    cierre: 'Correcto. Forma estándar: restricciones de igualdad con holguras y excesos; x ≥ 0.',
    refuerzo: 'Forma estándar: las ≤ reciben holgura, las ≥ reciben exceso y las = no cambian.'
  },
  {
    id: 'extremo',
    palabra: 'EXTREMO',
    tema: '3.3 Método Simplex',
    nivel: 'media',
    pista: 'Vértice de la región factible; corresponde a una solución básica factible.',
    cierre: 'Correcto. Punto extremo: vértice de la región factible con solución básica factible.',
    refuerzo: 'Punto extremo: solución básica factible. El método pasa de un punto extremo adyacente a otro.'
  },
  {
    id: 'entrada',
    palabra: 'ENTRADA',
    tema: '3.3 Método Simplex',
    nivel: 'facil',
    pista: 'Variable no básica que entra a la base en la siguiente iteración.',
    cierre: 'Correcto. Variable de entrada: no básica que entra a la base; se elige por zⱼ − cⱼ.',
    refuerzo: 'Variable de entrada: en maximización, la de zⱼ − cⱼ más negativo. Su columna es la columna pivote.'
  },
  {
    id: 'salida',
    palabra: 'SALIDA',
    tema: '3.3 Método Simplex',
    nivel: 'facil',
    pista: 'Variable básica que deja la base al final de la iteración.',
    cierre: 'Correcto. Variable de salida: básica que deja la base; se elige por el cociente menor.',
    refuerzo: 'Variable de salida: se divide el lado derecho entre cada yᵢ positivo; gana el cociente menor.'
  },
  {
    id: 'degenerada',
    palabra: 'DEGENERADA',
    tema: '3.3 Método Simplex',
    nivel: 'media',
    pista: 'Estado de una solución básica en la que alguna variable básica vale cero.',
    cierre: 'Correcto. Degenerada: una variable básica vale cero; puede provocar ciclos.',
    refuerzo: 'Degenerada: al menos una variable básica vale cero. El criterio de Bland evita que el método cicle.'
  },
  {
    id: 'penalizacion',
    palabra: 'PENALIZACIÓN',
    tema: '3.4 M grande',
    nivel: 'media',
    pista: 'Castigo con un valor M muy grande en la función objetivo para forzar ciertas variables a cero.',
    cierre: 'Correcto. Penalización: el valor M grande en z obliga a que las artificiales valgan cero.',
    refuerzo: 'Método de la M grande: penaliza las artificiales con −M (max) o +M (min) para sacarlas de la base.'
  },
  {
    id: 'dos-fases',
    palabra: 'DOS FASES',
    tema: '3.5 Dos fases',
    nivel: 'media',
    pista: 'Método que separa el problema en una etapa de factibilidad y otra de optimización.',
    cierre: 'Correcto. Dos fases: primero se eliminan las artificiales; después se optimiza z original.',
    refuerzo: 'Fase 1 minimiza la suma de artificiales. Si llega a cero, la fase 2 optimiza la función original.'
  },
  {
    id: 'inversa',
    palabra: 'INVERSA',
    tema: '3.6 Simplex revisado',
    nivel: 'media',
    pista: 'Matriz que se calcula a partir de la base B para obtener la nueva solución.',
    cierre: 'Correcto. Inversa: B⁻¹ permite calcular la solución y los zⱼ − cⱼ sin usar tablas.',
    refuerzo: 'La inversa B⁻¹ se actualiza en cada iteración, por ejemplo con la matriz E del producto de la inversa.'
  },
  {
    id: 'razon-minima',
    palabra: 'RAZÓN MÍNIMA',
    tema: '3.3 Método Simplex',
    nivel: 'media',
    pista: 'Criterio que determina qué variable deja la base con el menor cociente positivo.',
    cierre: 'Correcto. Razón mínima: el menor cociente positivo define la variable que sale.',
    refuerzo: 'Razón mínima: se divide cada valor de la solución entre su yᵢ positivo. El menor cociente indica quién sale.'
  }
];
