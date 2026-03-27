// que tipo es?
let nombre: string = "Julio";
let precio: number = 99.99;
let esMayorDeEdad: boolean = true;

let alumnos: string[] = ["Hugo", "Paco", "Luis"];
alumnos.push("Juan");

let cantidades: number[] = [100, 200, 300];

// como podriamos hacer si queremos que una variable inicie en null y luego su valor cambie
let description: string | null = null;
description = "hola me llamo juan";
description = null;

let descuento: number | undefined = undefined;
descuento = 10;

// interfaces
interface Person {
  nombre: string;
  apellido: string;
  edad: number;
  esMayor: boolean;
  celular?: number; // opcional cuando agregamo el "?"
}

const persona1: Person = {
  nombre: "Linder",
  apellido: "Hassinger",
  edad: 99,
  esMayor: true,
  celular: 99999,
};

const persona2: Person = {
  nombre: "Juan",
  apellido: "Perez",
  esMayor: true,
  edad: 88,
};

function calcularTotal(
  precio: number,
  cantidad: number,
  cliente: string,
): string {
  const total = precio * cantidad;
  return `Cliente: ${cliente}\nTotal: ${total}`;
}

console.log(calcularTotal(10, 50, "Pepe"));

type TaskStatus = "pending" | "completed" | "cancelled";
let status1: TaskStatus = "pending";
status1 = "cancelled";
status1 = "completed";

type UserId = number;
type StringOrNull = string | null;
let userId1: UserId = 10;

let texto: StringOrNull = null;
texto = "hola mundo";