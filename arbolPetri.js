let red = {
    lugares: ["P1","P2","P3"],
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
    ],
}

function nuevaRama(id, transicion, marca, padre) {
	const nodo = document.createElement('div')
	$(nodo).attr("id", id)
	.addClass('rama')
    .appendTo(padre)
	
	const valor = document.createElement('div')
	$(valor)
	.addClass('valor')
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

function siguienteEstado(estado, padre) {
	let esDeadEnd = true
	while (estado.transicion < red.transiciones.length) {
		if (transicionHabilitada(estado)) {
			esDeadEnd = false
			const nuevaMarca = aplicarTransicion(estado)
			
			let nodo = nuevaRama("m-" + estado.nodos.length, red.transiciones[estado.transicion].nombre, nuevaMarca, padre)
			
			if (existeEnRed(estado, nuevaMarca)) {
				old(nodo)
			} else if(mayorEnRama(estado, nuevaMarca)) {
				let nodoCubierto = nuevaRama("m-" + estado.nodos.length, "w", nuevaMarca, nodo)
				if (existeEnRed(estado, nuevaMarca)) {
					old(nodoCubierto)
				} else {
					const nuevoEstado = {
						nodos: estado.nodos,
						rama: estado.rama.slice(),
						marca: nuevaMarca,
						transicion: 0
					}
					nuevoEstado.nodos.push(nuevaMarca)
					nuevoEstado.rama.push(estado.marca)
					
					siguienteEstado(nuevoEstado, nodoCubierto)
				}
			} else {
				const nuevoEstado = {
					nodos: estado.nodos,
					rama: estado.rama.slice(),
					marca: nuevaMarca,
					transicion: 0
				}
				nuevoEstado.nodos.push(nuevaMarca)
				nuevoEstado.rama.push(estado.marca)
				
				siguienteEstado(nuevoEstado, nodo)
			}
			
		}
		estado.transicion++
	}
	if (esDeadEnd) {
		deadEnd(padre)
	}
}

function existeEnRed(estado, marca) {
	for (let nodo of estado.nodos) {
		if (mismaMarca(marca, nodo)) {
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

function cargarArbolJson() {
	red = JSON.parse($("#arbolJson").val())
	$("#arbolJson").val(JSON.stringify(red))
	$("#arbol").html("")
	let nodo = nuevaRama('m0', "M0",red.marcaInicial, $("#arbol"))
	let estado = {
	   nodos: [red.marcaInicial],
	   rama: [red.marcaInicial],
	   marca: red.marcaInicial,
	   transicion: 0
	}
	siguienteEstado(estado, nodo)
}


$(document).ready(function(){
	$("#arbolJson").val(JSON.stringify(red))
	cargarArbolJson()
})