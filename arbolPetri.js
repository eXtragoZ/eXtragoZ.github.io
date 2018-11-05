let red = {
    marcaInicial: [1,0,0],
    transiciones: [{
            nombre: "T0",
            toma: [1,0,1],
            da: [0,0,0]
        }, {
            nombre: "T1",
            toma: [1,0,0],
            da: [0,0,1]
        }, {
            nombre: "T2",
            toma: [0,1,1],
            da: [0,0,1]
        }, {
            nombre: "T3",
            toma: [1,0,0],
            da: [1,1,0]
        }
    ]
}

let estadoActual

function nuevaRama(id, transicion, marca, padre) {
	const nodo = document.createElement('div')
	$(nodo).attr("id", id)
	.addClass('rama')
    .appendTo(padre)
	
	const valor = document.createElement('div')
	$(valor)
	.addClass('valor')
	.addClass('ultimo')
    .html(transicion + ": " + marcaAString(marca))
    .appendTo($(nodo))
	
	const hijos = document.createElement('div')
	return $(hijos)
	.addClass('hijos')
    .appendTo($(nodo))
}

function deadEnd(padre) {	
    agregarTexto(padre, 'dead end', 'deadEnd')
}
function old(padre) {
	agregarTexto(padre, 'old', 'old')
}

function agregarTexto(padre, texto, clase) {	
	const nodo = document.createElement('div')
	$(nodo)
	.addClass(clase)
	.html(texto)
    .appendTo(padre)
}

function marcaAString(marca) {
	let resultado = ""
	marca.forEach(valor => {
	  resultado += valor + ", "
	})
	return resultado.slice(0, resultado.length - 2)
}

function siguienteEstado() {
	$( ".repetido" ).removeClass( "repetido" )
	$( ".actual" ).removeClass( "actual" )
	$( ".ultimo" ).removeClass( "ultimo" )
	
	estadoActual.nodoJQuery.addClass( "actual" )
	
	if (estadoActual.transicion < red.transiciones.length) {
		if (transicionHabilitada(estadoActual)) {
			$("#pasos").html(red.transiciones[estadoActual.transicion].nombre + " Habilitada")
			estadoActual.esDeadEnd = false
			ejecutarEstado(estadoActual, estadoActual.nodoJQuery)
		} else {
			$("#pasos").html(red.transiciones[estadoActual.transicion].nombre + " Deshabilitada")
			estadoActual.transicion++
		}
	}
	
	if (estadoActual.transicion >= red.transiciones.length) {
		if (estadoActual.esDeadEnd) {
			deadEnd(estadoActual.nodoJQuery)
		}
		if (estadoActual.previo != null ) {
			estadoActual = estadoActual.previo
		} else {
			finalizoArbol()
			return
		}
	}
		
	if ($("#autoArbol").prop('checked')) {
		siguienteEstado()
	}
}

function ejecutarEstado(estado, padre) {
	const nuevaMarca = aplicarTransicion(estado)
			
	let nodo = nuevaRama("m-" + estado.nodos.length, red.transiciones[estado.transicion].nombre, nuevaMarca, padre)
	
	const yaExiste = existeEnRed(estado, nuevaMarca)
	
	estado.nodos.push(nuevaMarca)
	estado.transicion++
	
	const marcaOmega = nuevaMarca.slice()
	if (yaExiste) {
		old(nodo)
	} else if(mayorEnRama(estado, marcaOmega)) {
		ejecutarEstadoCubierto(estado, nodo, marcaOmega)
	} else {
		avanzarEstado(estado, nuevaMarca, nodo)
	}
}

function ejecutarEstadoCubierto(estado, nodo, marcaOmega) {
	let nodoCubierto = nuevaRama("m-" + estado.nodos.length, "w", marcaOmega, nodo)
	
	const yaExiste = existeEnRed(estado, marcaOmega)
	
	estado.nodos.push(marcaOmega)
	
	if (yaExiste) {
		old(nodoCubierto)
	} else {
		avanzarEstado(estado, marcaOmega, nodoCubierto)	
	}
}

function avanzarEstado(estadoPrevio, nuevaMarca, nuevoPadre) {
	const nuevoEstado = {
		previo: estadoPrevio,
		nodos: estadoPrevio.nodos,
		rama: estadoPrevio.rama.slice(),
		marca: nuevaMarca,
		transicion: 0,
		nodoJQuery: nuevoPadre,
		esDeadEnd: true
	}
	nuevoEstado.rama.push(estadoPrevio.marca)
	
	estadoActual = nuevoEstado
}

function existeEnRed(estado, marca) {
	for (let nodo of estado.nodos) {
		if (mismaMarca(marca, nodo)) {
			marcarNodoRepetido(estado, nodo)
			return true
		}
	}
	return false
}

function mayorEnRama(estado, marca) {
	let modificado = false
	for (let nodo of estado.rama) {
		if (marcaMayorIgual(marca, nodo)) {
			modificado = true
			ponerOmegas(marca, nodo)
		}
	}
	return modificado
}

function mismaMarca(marca1, marca2) {
	for (i = 0; i < marca1.length; i++) { 
		if (marca1[i] != marca2[i]) {
			return false
		}	
	}
	return true
}

function marcaMayorIgual(marca1, marca2) {
	for (i = 0; i < marca1.length; i++) {
		if (marca1[i] < marca2[i]) {
			return false
		}	
	}
	return true
}

function ponerOmegas(marca1, marca2) {
	for (i = 0; i < marca1.length; i++) { 
		if (marca1[i] > marca2[i]) {
			marca1[i] = Infinity
		}	
	}
}

function transicionHabilitada(estado) {
	for (i = 0; i < red.transiciones[estado.transicion].toma.length; i++) {
		if (estado.marca[i] < red.transiciones[estado.transicion].toma[i]) {
			return false
		}
	}
	return true
}

function aplicarTransicion(estado) {
	const nuevaMarca = estado.marca.slice()
	for (i = 0; i < red.transiciones[estado.transicion].toma.length; i++) {
		nuevaMarca[i] -= red.transiciones[estado.transicion].toma[i]
	}
	for (i = 0; i < red.transiciones[estado.transicion].da.length; i++) {
		nuevaMarca[i] += red.transiciones[estado.transicion].da[i]
	}
	return nuevaMarca
}

function buscarCota(estado) {
	let cota = 0
	for (let nodo of estado.nodos) {
		for (let valor of nodo) {
			if (valor > cota) {
				cota = valor
			}	
		}
	}
	return cota
}

function marcarNodoRepetido(estado, nodo) {
	const i = estado.nodos.indexOf(nodo)
	$("#m-"+i).addClass('repetido')
}

function arbolPorPasos() {
	siguienteEstado()
}

function cargarArbolJson() {
	red = JSON.parse($("#arbolJson").val())
	$("#arbolJson").val(JSON.stringify(red))
	$("#arbol").html("")
	$("#pasos").html("")
	$("#cota").html("")
	let nodo = nuevaRama('m-0', "M0",red.marcaInicial, $("#arbol"))
	let estado = {
		nodos: [red.marcaInicial],
		rama: [red.marcaInicial],
		marca: red.marcaInicial,
		transicion: 0,
		nodoJQuery: nodo,
		esDeadEnd: true
	}
	estadoActual = estado
	$("#pasos").html("M0")
	if ($("#autoArbol").prop('checked')) {
		siguienteEstado()
	}
}

function finalizoArbol() {
	$( ".actual" ).removeClass( "actual" )
	$( ".ultimo" ).removeClass( "ultimo" )
	$("#pasos").html("")
	const cota = buscarCota(estadoActual)
	if (cota == Infinity) {
		$("#cota").html("No es acotado")
	} else {
		$("#cota").html("Es " + cota + " acotado")
	}
}

$(document).ready(function(){
	$("#autoArbol").prop('checked', true);
	$("#arbolJson").val(JSON.stringify(red))
	cargarArbolJson()
})