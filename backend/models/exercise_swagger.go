package models

type ExerciseSwagger struct {
	ID       uint   `json:"id" example:"1"`
	Title    string `json:"title" example:"Sumar dos números"`
	Exercise string `json:"exercise" example:"Escribe una función que sume dos números"`
	Solution string `json:"solution" example:"def sumar(a, b): return a + b"`
	Level    int    `json:"level" example:"1"`
}
